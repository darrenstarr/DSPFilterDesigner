/**
 * Client-side signal processing library
 * Replaces Python backend functionality for GitHub Pages deployment
 */

class SignalProcessor {
    /**
     * Initialize signal processor with audio data
     */
    constructor(audioBuffer) {
        this.audioBuffer = audioBuffer;
        this.originalSignal = null;
        this.sampleRate = audioBuffer.sampleRate;
        this.duration = audioBuffer.duration;
        this.firFilteredSignal = null;
        this.iirFilteredSignal = null;
        
        // Convert audio buffer to mono signal
        this.loadAudio();
    }
    
    /**
     * Convert stereo audio buffer to mono signal
     */
    loadAudio() {
        const channelData = this.audioBuffer.getChannelData(0);
        this.originalSignal = Array.from(channelData);
    }
    
    /**
     * Design FIR bandpass filter using window method
     */
    designFIRFilter(lowcut, highcut, numtaps = 51) {
        // Ensure odd number of taps
        if (numtaps % 2 === 0) {
            numtaps += 1;
        }
        
        const nyquist = this.sampleRate / 2;
        const low = lowcut / nyquist;
        const high = highcut / nyquist;
        
        // Clamp to valid range
        const clampedLow = Math.max(0.001, Math.min(0.999, low));
        const clampedHigh = Math.max(0.001, Math.min(0.999, high));
        
        // Ensure low < high
        const finalLow = clampedLow >= clampedHigh ? clampedHigh * 0.9 : clampedLow;
        const finalHigh = clampedLow >= clampedHigh ? clampedHigh : clampedHigh;
        
        // Design FIR filter using Hamming window
        const coefficients = this.firwin(numtaps, [finalLow, finalHigh], 'hamming', false);
        
        // Calculate frequency response
        const { frequencies, magnitude } = this.freqz(coefficients, 1, 2048);
        const frequenciesHz = frequencies * nyquist / Math.PI;
        const magnitudeDb = 20 * Math.log10(Math.abs(magnitude) + 1e-10);
        
        return {
            coefficients: coefficients,
            frequencies: frequenciesHz,
            magnitude_db: magnitudeDb,
            numtaps: numtaps
        };
    }
    
    /**
     * Design IIR Butterworth bandpass filter
     */
    designIIRFilter(lowcut, highcut, order = 4) {
        const nyquist = this.sampleRate / 2;
        const low = lowcut / nyquist;
        const high = highcut / nyquist;
        
        // Clamp to valid range
        const clampedLow = Math.max(0.001, Math.min(0.999, low));
        const clampedHigh = Math.max(0.001, Math.min(0.999, high));
        
        // Ensure low < high
        const finalLow = clampedLow >= clampedHigh ? clampedHigh * 0.9 : clampedLow;
        const finalHigh = clampedLow >= clampedHigh ? clampedHigh : clampedHigh;
        
        // Design Butterworth bandpass filter
        const { b, a } = this.butter(order, [finalLow, finalHigh], 'band');
        
        // Calculate frequency response
        const { frequencies, magnitude } = this.freqz(b, a, 2048);
        const frequenciesHz = frequencies * nyquist / Math.PI;
        const magnitudeDb = 20 * Math.log10(Math.abs(magnitude) + 1e-10);
        
        return {
            b: b,
            a: a,
            frequencies: frequenciesHz,
            magnitude_db: magnitudeDb,
            order: order
        };
    }
    
    /**
     * Apply FIR filter to signal
     */
    applyFIRFilter(coefficients) {
        coefficients = new Float64Array(coefficients);
        const filtered = this.lfilter(coefficients, new Float64Array([1]), this.originalSignal);
        this.firFilteredSignal = filtered;
        return filtered;
    }
    
    /**
     * Apply IIR filter to signal
     */
    applyIIRFilter(b, a) {
        b = new Float64Array(b);
        a = new Float64Array(a);
        const filtered = this.lfilter(b, a, this.originalSignal);
        this.iirFilteredSignal = filtered;
        return filtered;
    }
    
    /**
     * Get downsampled waveform for visualization
     */
    getSignalWaveform(signalData = null, downsampleFactor = 100) {
        const data = signalData || this.originalSignal;
        const downsampled = [];
        const time = [];
        
        for (let i = 0; i < data.length; i += downsampleFactor) {
            downsampled.push(data[i]);
            time.push(i * downsampleFactor / this.sampleRate);
        }
        
        return {
            time: time,
            amplitude: downsampled
        };
    }
    
    /**
     * Get frequency spectrum of signal
     */
    getFrequencySpectrum(signalData = null, freqRange = [0, 5000]) {
        const data = signalData || this.originalSignal;
        const nFFT = 4096;
        
        // Pad signal to nFFT length
        const padded = new Float64Array(nFFT);
        padded.set(data.slice(0, nFFT));
        
        // Compute FFT
        const spectrum = this.fft(padded);
        const frequencies = this.fftfreq(nFFT, 1/this.sampleRate);
        
        // Get positive frequencies only
        const positiveFreqs = frequencies.slice(0, nFFT/2);
        const positiveSpectrum = spectrum.slice(0, nFFT/2);
        
        // Convert to dB
        const magnitudeDb = 20 * Math.log10(Math.abs(positiveSpectrum) + 1e-10);
        
        // Filter by frequency range
        const mask = positiveFreqs.map(f => f >= freqRange[0] && f <= freqRange[1]);
        const filteredFreqs = positiveFreqs.filter((_, i) => mask[i]);
        const filteredMag = magnitudeDb.filter((_, i) => mask[i]);
        
        return {
            frequencies: filteredFreqs,
            magnitude_db: filteredMag
        };
    }
    
    /**
     * Export filtered audio as WAV blob
     */
    exportAudio(filterType, coefficients = null, b = null, a = null) {
        let signal;
        
        if (filterType === 'original') {
            signal = this.originalSignal;
        } else if (filterType === 'fir' && coefficients) {
            signal = this.applyFIRFilter(coefficients);
        } else if (filterType === 'iir' && b && a) {
            signal = this.applyIIRFilter(b, a);
        } else {
            throw new Error('Invalid filter type or missing parameters');
        }
        
        // Normalize to [-1, 1]
        const maxVal = Math.max(...signal.map(v => Math.abs(v)));
        const normalized = maxVal > 0 ? signal.map(v => v / maxVal * 0.95) : signal;
        
        // Convert to 16-bit PCM
        const audioInt16 = normalized.map(v => Math.floor(v * 32767));
        
        // Create WAV file
        const wavFile = this.createWAVFile(audioInt16, this.sampleRate);
        return new Blob([wavFile], { type: 'audio/wav' });
    }
    
    // Helper methods for signal processing
    
    /**
     * FIR filter design using window method
     */
    firwin(numtaps, cutoff, window = 'hamming', pass_zero = true) {
        const coefficients = new Float64Array(numtaps);
        
        for (let n = 0; n < numtaps; n++) {
            if (n === (numtaps - 1) / 2) {
                coefficients[n] = 1;
            } else {
                let sum = 0;
                if (Array.isArray(cutoff)) {
                    for (let i = 0; i < cutoff.length; i++) {
                        sum += Math.sin(Math.PI * cutoff[i] * (n - (numtaps - 1) / 2)) / 
                               (Math.PI * (n - (numtaps - 1) / 2));
                    }
                    sum /= cutoff.length;
                } else {
                    sum = Math.sin(Math.PI * cutoff * (n - (numtaps - 1) / 2)) / 
                          (Math.PI * (n - (numtaps - 1) / 2));
                }
                
                // Apply window
                coefficients[n] = sum * this.getWindowValue(window, n, numtaps);
                
                if (!pass_zero) {
                    coefficients[n] *= -1;
                }
            }
        }
        
        return coefficients;
    }
    
    /**
     * Get window function value
     */
    getWindowValue(windowType, n, numtaps) {
        const M = numtaps - 1;
        
        switch (windowType) {
            case 'hamming':
                return 0.54 - 0.46 * Math.cos(2 * Math.PI * n / M);
            case 'hann':
                return 0.5 * (1 - Math.cos(2 * Math.PI * n / M));
            case 'blackman':
                return 0.42 - 0.5 * Math.cos(2 * Math.PI * n / M) + 
                       0.08 * Math.cos(4 * Math.PI * n / M);
            default:
                return 1;
        }
    }
    
    /**
     * Frequency response calculation
     */
    freqz(b, a, worN = 512) {
        const n = Math.max(b.length, a.length);
        const w = new Float64Array(worN);
        const h = new ComplexArray(worN);
        
        for (let i = 0; i < worN; i++) {
            const omega = (2 * Math.PI * i) / worN;
            const z = new Complex(Math.cos(omega), Math.sin(omega));
            
            // Compute H(z) = B(z) / A(z)
            let numerator = new Complex(0, 0);
            let denominator = new Complex(0, 0);
            
            for (let k = 0; k < b.length; k++) {
                const zPow = z.pow(k);
                numerator = numerator.add(zPow.mul(b[k]));
            }
            
            for (let k = 0; k < a.length; k++) {
                const zPow = z.pow(k);
                denominator = denominator.add(zPow.mul(a[k]));
            }
            
            h[i] = numerator.div(denominator);
            w[i] = omega;
        }
        
        return { frequencies: w, magnitude: h };
    }
    
    /**
     * Butterworth filter design
     */
    butter(order, Wn, btype = 'low') {
        // Normalize frequencies
        if (Array.isArray(Wn)) {
            Wn = Wn.map(w => w * 2);
        } else {
            Wn = Wn * 2;
        }
        
        // For bandpass, design lowpass and highpass, then combine
        if (btype === 'band') {
            const [low, high] = Wn;
            const { b: b1, a: a1 } = this.butter(order, low / 2, 'low');
            const { b: b2, a: a2 } = this.butter(order, high / 2, 'high');
            
            // Convolve to get bandpass
            const b = this.convolve(b1, b2);
            const a = this.convolve(a1, a2);
            
            return { b, a };
        }
        
        // Simplified butterworth design
        const poles = this.butterPoles(order, Wn);
        const [b, a] = this.zpk2tf(poles, []);
        
        return { b, a };
    }
    
    /**
     * Get Butterworth filter poles
     */
    butterPoles(order, Wn) {
        const poles = [];
        const n = order;
        
        for (let k = 0; k < n; k++) {
            const theta = Math.PI * (2 * k + 1) / (2 * n);
            const real = -Math.sin(theta) * Wn;
            const imag = Math.cos(theta) * Wn;
            poles.push(new Complex(real, imag));
            poles.push(new Complex(real, -imag));
        }
        
        return poles.slice(0, n);
    }
    
    /**
     * Convert pole-zero to transfer function
     */
    zpk2tf(zeros, poles) {
        // Start with numerator = 1
        let b = [1];
        
        // Multiply by (z - zero) for each zero
        for (const zero of zeros) {
            const newB = new Float64Array(b.length + 1);
            for (let i = 0; i < b.length; i++) {
                newB[i] += b[i] * (-zero.real);
                newB[i + 1] += b[i];
            }
            b = newB;
        }
        
        // Start with denominator = 1
        let a = [1];
        
        // Multiply by (z - pole) for each pole
        for (const pole of poles) {
            const newA = new Float64Array(a.length + 1);
            for (let i = 0; i < a.length; i++) {
                newA[i] += a[i] * (-pole.real);
                newA[i + 1] += a[i];
            }
            a = newA;
        }
        
        return { b, a };
    }
    
    /**
     * Convolve two arrays
     */
    convolve(a, b) {
        const result = new Float64Array(a.length + b.length - 1);
        
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                result[i + j] += a[i] * b[j];
            }
        }
        
        return result;
    }
    
    /**
     * Apply linear filter
     */
    lfilter(b, a, x) {
        const output = new Float64Array(x.length);
        
        // Normalize by a[0]
        if (a[0] !== 1) {
            b = b.map(coef => coef / a[0]);
            a = a.map(coef => coef / a[0]);
        }
        
        for (let n = 0; n < x.length; n++) {
            // FIR part
            let sum = 0;
            for (let k = 0; k < Math.min(b.length, n + 1); k++) {
                sum += b[k] * x[n - k];
            }
            
            // IIR part
            for (let k = 1; k < Math.min(a.length, n + 1); k++) {
                sum -= a[k] * output[n - k];
            }
            
            output[n] = sum;
        }
        
        return output;
    }
    
    /**
     * FFT implementation
     */
    fft(x) {
        const N = x.length;
        
        if (N <= 1) {
            return new ComplexArray(x.map(v => new Complex(v, 0)));
        }
        
        // Divide
        const even = new Float64Array(N / 2);
        const odd = new Float64Array(N / 2);
        
        for (let i = 0; i < N / 2; i++) {
            even[i] = x[2 * i];
            odd[i] = x[2 * i + 1];
        }
        
        // Conquer
        const evenFFT = this.fft(even);
        const oddFFT = this.fft(odd);
        
        // Combine
        const result = new ComplexArray(N);
        
        for (let k = 0; k < N / 2; k++) {
            const t = oddFFT[k].mul(new Complex(
                Math.cos(-2 * Math.PI * k / N),
                Math.sin(-2 * Math.PI * k / N)
            ));
            
            result[k] = evenFFT[k].add(t);
            result[k + N / 2] = evenFFT[k].sub(t);
        }
        
        return result;
    }
    
    /**
     * Get frequency bins for FFT
     */
    fftfreq(n, d = 1.0) {
        const results = new Float64Array(n);
        const positiveFreqs = Math.floor(n / 2);
        const negativeFreqs = n - positiveFreqs;
        
        for (let i = 0; i < positiveFreqs; i++) {
            results[i] = i / (n * d);
        }
        
        for (let i = positiveFreqs; i < n; i++) {
            results[i] = -(negativeFreqs - i) / (n * d);
        }
        
        return results;
    }
    
    /**
     * Create WAV file from audio data
     */
    createWAVFile(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);
        
        // Audio data
        let offset = 44;
        for (const sample of samples) {
            view.setInt16(offset, sample, true);
            offset += 2;
        }
        
        return buffer;
    }
}

// Complex number class for FFT operations
class Complex {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }
    
    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }
    
    sub(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }
    
    mul(other) {
        return new Complex(
            this.real * other.real - this.imag * other.imag,
            this.real * other.imag + this.imag * other.real
        );
    }
    
    div(other) {
        const denominator = other.real * other.real + other.imag * other.imag;
        return new Complex(
            (this.real * other.real + this.imag * other.imag) / denominator,
            (this.imag * other.real - this.real * other.imag) / denominator
        );
    }
    
    pow(n) {
        if (n === 0) return new Complex(1, 0);
        if (n === 1) return new Complex(this.real, this.imag);
        
        const result = this.pow(n - 1);
        return this.mul(result);
    }
    
    abs() {
        return Math.sqrt(this.real * this.real + this.imag * this.imag);
    }
}

// Complex array class
class ComplexArray {
    constructor(length) {
        this.data = new Array(length);
        for (let i = 0; i < length; i++) {
            this.data[i] = new Complex(0, 0);
        }
    }
    
    get length() {
        return this.data.length;
    }
    
    get(index) {
        return this.data[index];
    }
    
    set(index, value) {
        this.data[index] = value;
    }
    
    map(fn) {
        const result = new ComplexArray(this.length);
        for (let i = 0; i < this.length; i++) {
            result.data[i] = fn(this.data[i], i);
        }
        return result;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SignalProcessor, Complex, ComplexArray };
}