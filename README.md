# Digital Signal Processing - Filter Design Learning Tool

A comprehensive web-based visual learning tool for teaching IIR and FIR bandpass filter design with interactive visualization and audio playback.

## Features

- **Interactive Filter Design**
  - FIR filter design with configurable number of taps
  - IIR (Butterworth) filter design with configurable order
  - Real-time frequency response visualization
  - Coefficient visualization

- **Multiple Visualization Modes**
  - Coefficient display (bar charts)
  - Frequency response plots
  - Timeline view showing original and filtered signals side-by-side

- **Audio Processing**
  - Load and process audio files
  - Real-time filtering
  - Playback of original and filtered audio
  - Timeline scrubber for seeking through audio

- **Educational Value**
  - Visual comparison of FIR vs IIR filters
  - Understanding filter characteristics
  - Exploring the relationship between filter parameters and response

## Installation

### Prerequisites
- Python 3.8 or higher
- Modern web browser with JavaScript support

### Setup

1. Install Python dependencies:
```bash
cd web_app
pip install -r requirements.txt
```

2. Ensure the audio file is in the parent directory:
```
sunflower-street-drumloop-85bpm-163900 (1).mp3
```

## Running the Application

1. Start the Flask server:
```bash
cd web_app
python app.py
```

2. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Basic Workflow

1. **Select Frequency Band**
   - Use the "Low Frequency" and "High Frequency" controls to define the passband

2. **Design FIR Filter**
   - Adjust the "Number of Taps" slider (higher values = steeper rolloff)
   - Click "Design FIR Filter"
   - View the coefficients and frequency response

3. **Design IIR Filter**
   - Adjust the "Filter Order" slider (higher values = steeper rolloff)
   - Click "Design IIR Filter"
   - View the coefficients and frequency response

4. **Compare Results**
   - Switch to the "Timeline" tab to see all signals
   - View coefficient visualization in the "Coefficients" tab
   - Compare frequency responses in the "Frequency Response" tab

5. **Listen to Results**
   - Click "Play Original" to hear the unfiltered audio
   - Click "Play FIR Filtered" or "Play IIR Filtered" to hear the processed audio
   - Use the timeline scrubber to seek through the audio

## Technical Details

### Backend (Flask)
- Signal processing using NumPy and SciPy
- Audio file handling with Librosa
- Real-time filter design and application
- WAV file export for playback

### Frontend
- Canvas 2D API for fast visualization
- Modern ES6+ JavaScript
- Responsive design supporting various screen sizes
- Web Audio API for playback

### Filter Types

**FIR Filter**
- Window method with Hamming window
- Linear phase response
- No feedback path (all poles at origin)
- Stable by design

**IIR Filter**
- Butterworth design (maximally flat passband)
- Non-linear phase response
- Feedback paths (poles and zeros)
- More efficient for steep rolloff

## File Structure

```
web_app/
├── app.py                  # Flask application and signal processing
├── index.html             # Main HTML template
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css      # Application styling
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   ├── filter-designer.js  # Filter design module
│   │   ├── visualization.js    # Visualization system
│   │   └── utils.js       # Utility functions
│   └── shaders/
│       └── waveform.wgsl  # WebGPU shaders (for future enhancement)
```

## Key Parameters

### FIR Filter
- **Number of Taps**: 11-201 (odd numbers for symmetric response)
  - More taps = steeper rolloff but higher computational cost
  - Less taps = smoother response but more ripple

### IIR Filter
- **Filter Order**: 1-8
  - Higher order = steeper rolloff but potential instability
  - Lower order = smoother response but gradual rolloff

### Frequency Band
- **Low Frequency**: 1-10,000 Hz
- **High Frequency**: 1-20,000 Hz
- Must have Low Frequency < High Frequency

## Performance Considerations

- Signal processing is done server-side for accuracy
- Downsampling is applied for visualization
- Canvas 2D rendering is GPU-accelerated on modern browsers
- Audio playback uses Web Audio API for smooth performance

## Educational Applications

- **Understanding Filter Response**: Compare FIR and IIR characteristics
- **Parameter Exploration**: See how filter order/taps affect the response
- **Audio Processing**: Learn DSP concepts with real audio
- **Frequency Analysis**: Visualize how filters shape the frequency spectrum

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Modern browsers with ES6+ and Web Audio API support required.

## Future Enhancements

- WebGPU acceleration for real-time filtering
- More filter types (Cheby Type I/II, Elliptic)
- Advanced visualization options
- Group delay visualization
- Phase response plots
- Impulse response display

## License

This project is provided as an educational tool.

## Support

For issues or questions, check the browser console for error messages.
# DSPFilterDesigner
