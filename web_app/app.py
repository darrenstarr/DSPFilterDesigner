from flask import Flask, render_template, request, jsonify, send_file
import numpy as np
import scipy.signal as signal
from scipy.fft import fft, fftfreq
import librosa
import soundfile as sf
import json
import os
from pathlib import Path
import io

app = Flask(__name__, template_folder='.', static_folder='static')

# Audio file path
AUDIO_FILE = Path(__file__).parent.parent / "sunflower-street-drumloop-85bpm-163900 (1).mp3"

class SignalProcessor:
    """Handles all signal processing operations for filter design and application."""
    
    def __init__(self, audio_file: str):
        """Initialize with an audio file."""
        self.audio_file = audio_file
        self.original_signal = None
        self.sample_rate = None
        self.duration = None
        self.fir_filtered_signal = None
        self.iir_filtered_signal = None
        self.load_audio()
    
    def load_audio(self):
        """Load audio file."""
        try:
            self.original_signal, self.sample_rate = librosa.load(
                self.audio_file, sr=None, mono=True
            )
            self.duration = len(self.original_signal) / self.sample_rate
        except Exception as e:
            print(f"Error loading audio: {e}")
            raise
    
    def design_fir_filter(self, lowcut: float, highcut: float, numtaps: int):
        """Design an FIR bandpass filter."""
        if numtaps % 2 == 0:
            numtaps += 1
        
        nyquist = self.sample_rate / 2
        low = lowcut / nyquist
        high = highcut / nyquist
        
        low = np.clip(low, 0.001, 0.999)
        high = np.clip(high, 0.001, 0.999)
        
        if low >= high:
            low, high = high * 0.9, high
        
        coefficients = signal.firwin(numtaps, [low, high], window='hamming', pass_zero=False)
        
        frequencies, magnitude = signal.freqz(coefficients, 1, worN=2048)
        frequencies_hz = frequencies * nyquist / np.pi
        magnitude_db = 20 * np.log10(np.abs(magnitude) + 1e-10)
        
        return {
            'coefficients': coefficients.tolist(),
            'frequencies': frequencies_hz.tolist(),
            'magnitude_db': magnitude_db.tolist(),
            'numtaps': int(numtaps)
        }
    
    def design_iir_filter(self, lowcut: float, highcut: float, order: int = 4):
        """Design an IIR Butterworth bandpass filter."""
        nyquist = self.sample_rate / 2
        low = lowcut / nyquist
        high = highcut / nyquist
        
        low = np.clip(low, 0.001, 0.999)
        high = np.clip(high, 0.001, 0.999)
        
        if low >= high:
            low, high = high * 0.9, high
        
        b, a = signal.butter(order, [low, high], btype='band')
        
        frequencies, magnitude = signal.freqz(b, a, worN=2048)
        frequencies_hz = frequencies * nyquist / np.pi
        magnitude_db = 20 * np.log10(np.abs(magnitude) + 1e-10)
        
        return {
            'b': b.tolist(),
            'a': a.tolist(),
            'frequencies': frequencies_hz.tolist(),
            'magnitude_db': magnitude_db.tolist(),
            'order': int(order)
        }
    
    def apply_fir_filter(self, coefficients: list):
        """Apply FIR filter."""
        coefficients = np.array(coefficients)
        filtered = signal.lfilter(coefficients, 1, self.original_signal)
        self.fir_filtered_signal = filtered
        return filtered
    
    def apply_iir_filter(self, b: list, a: list):
        """Apply IIR filter."""
        b = np.array(b)
        a = np.array(a)
        filtered = signal.lfilter(b, a, self.original_signal)
        self.iir_filtered_signal = filtered
        return filtered
    def get_signal_waveform(self, signal_data: list = None, 
                           downsample_factor: int = 100):
        """Get downsampled waveform for visualization."""
        if signal_data is None:
            data = self.original_signal
        else:
            data = np.array(signal_data)
        
        downsampled = data[::downsample_factor]
        time = np.arange(len(downsampled)) * downsample_factor / self.sample_rate
        
        return {
            'time': time.tolist(),
            'amplitude': downsampled.tolist()
        }
    
    def get_frequency_spectrum(self, signal_data: list = None, 
                              freq_range: tuple = (0, 5000)):
        """Get frequency spectrum."""
        if signal_data is None:
            data = self.original_signal
        else:
            data = np.array(signal_data)
        
        n_fft = 4096
        spectrum = np.abs(fft(data, n=n_fft))
        frequencies = fftfreq(n_fft, 1/self.sample_rate)[:n_fft//2]
        magnitude_db = 20 * np.log10(spectrum[:n_fft//2] + 1e-10)
        
        # Limit to frequency range
        mask = (frequencies >= freq_range[0]) & (frequencies <= freq_range[1])
        
        return {
            'frequencies': frequencies[mask].tolist(),
            'magnitude_db': magnitude_db[mask].tolist()
        }

# Initialize processor
processor = SignalProcessor(str(AUDIO_FILE))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/audio-info')
def get_audio_info():
    """Get audio file information."""
    return jsonify({
        'duration': processor.duration,
        'sample_rate': processor.sample_rate,
        'samples': len(processor.original_signal)
    })

@app.route('/api/waveform', methods=['POST'])
def get_waveform():
    """Get waveform for timeline."""
    data = request.json
    signal_type = data.get('type', 'original')  # original, fir, iir
    
    if signal_type == 'original':
        waveform = processor.get_signal_waveform(downsample_factor=100)
    else:
        waveform = processor.get_signal_waveform(signal_type, downsample_factor=100)
    
    return jsonify(waveform)

@app.route('/api/design-fir', methods=['POST'])
def design_fir():
    """Design FIR filter."""
    data = request.json
    lowcut = float(data.get('lowcut', 100))
    highcut = float(data.get('highcut', 1000))
    numtaps = int(data.get('numtaps', 51))
    
    result = processor.design_fir_filter(lowcut, highcut, numtaps)
    return jsonify(result)

@app.route('/api/design-iir', methods=['POST'])
def design_iir():
    """Design IIR filter."""
    data = request.json
    lowcut = float(data.get('lowcut', 100))
    highcut = float(data.get('highcut', 1000))
    order = int(data.get('order', 4))
    
    result = processor.design_iir_filter(lowcut, highcut, order)
    return jsonify(result)

@app.route('/api/apply-filter', methods=['POST'])
def apply_filter():
    """Apply designed filter and get filtered waveform."""
    data = request.json
    filter_type = data.get('filter_type')  # 'fir' or 'iir'
    
    if filter_type == 'fir':
        coefficients = data.get('coefficients')
        filtered = processor.apply_fir_filter(coefficients)
    elif filter_type == 'iir':
        b = data.get('b')
        a = data.get('a')
        filtered = processor.apply_iir_filter(b, a)
    else:
        return jsonify({'error': 'Invalid filter type'}), 400
    
    waveform = processor.get_signal_waveform(filtered.tolist(), downsample_factor=100)
    spectrum = processor.get_frequency_spectrum(filtered.tolist())
    
    return jsonify({
        'waveform': waveform,
        'spectrum': spectrum
    })

@app.route('/api/spectrum', methods=['POST'])
def get_spectrum():
    """Get frequency spectrum of a signal."""
    # Fetch full signal from processor instead of from request
    try:
        data = request.json
        signal_type = data.get('type', 'original')

        
        # Get the full signal (not downsampled)
        if signal_type == 'original':
            signal_data = processor.original_signal
        elif signal_type == 'fir':
            signal_data = processor.fir_filtered_signal
        elif signal_type == 'iir':
            signal_data = processor.iir_filtered_signal
        else:
            signal_data = processor.original_signal
        
        if signal_data is None:
            return jsonify({'error': 'Signal not available'}), 400
        
        freq_range = tuple(data.get('freq_range', (0, 10000)))
        
        # Convert to list if it's a numpy array
        if hasattr(signal_data, 'tolist'):
            signal_data = signal_data.tolist()
        
        spectrum = processor.get_frequency_spectrum(signal_data, freq_range)
        return jsonify(spectrum)
    except Exception as e:
        import traceback
        print(f"ERROR in /api/spectrum: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@app.route('/api/audio-data', methods=['POST'])
def get_audio_data():
    """Get audio data for playback."""
    data = request.json
    filter_type = data.get('filter_type', 'original')
    
    if filter_type == 'original':
        audio_data = processor.original_signal
    elif filter_type == 'fir':
        coefficients = data.get('coefficients')
        audio_data = processor.apply_fir_filter(coefficients)
    elif filter_type == 'iir':
        b = data.get('b')
        a = data.get('a')
        audio_data = processor.apply_iir_filter(b, a)
    else:
        return jsonify({'error': 'Invalid filter type'}), 400
    
    # Normalize
    max_val = np.max(np.abs(audio_data))
    if max_val > 0:
        audio_data = audio_data / max_val * 0.95
    
    # Convert to 16-bit PCM
    audio_int16 = np.int16(audio_data * 32767)
    
    # Create WAV file in memory
    output = io.BytesIO()
    sf.write(output, audio_int16, processor.sample_rate, format='WAV')
    output.seek(0)
    
    return send_file(output, mimetype='audio/wav', as_attachment=True, 
                    download_name='filtered_audio.wav')

if __name__ == '__main__':
    app.run(debug=False, port=5000)
