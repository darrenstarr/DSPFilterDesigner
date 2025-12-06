# DSP Filter Design Tool - Complete Documentation

## Project Overview

This is a comprehensive web-based educational tool for learning Digital Signal Processing (DSP), specifically focusing on the design and analysis of FIR (Finite Impulse Response) and IIR (Infinite Impulse Response) bandpass filters.

The tool provides an interactive, visual experience where users can:
- Design filters with configurable parameters
- See real-time visualization of filter coefficients and frequency responses
- Apply filters to real audio
- Compare original and filtered signals
- Play back and listen to the effects

## Architecture

### Backend Stack
- **Framework**: Flask (Python)
- **Signal Processing**: NumPy, SciPy
- **Audio I/O**: Librosa, SoundFile
- **Server**: Development Flask server (production: Gunicorn/uWSGI)

### Frontend Stack
- **UI Framework**: Vanilla JavaScript (ES6+)
- **Visualization**: HTML5 Canvas 2D API
- **Styling**: CSS3 with custom design system
- **Audio Playback**: Web Audio API

### Key Components

#### Backend (app.py)
```
SignalProcessor
├── load_audio()              # Load MP3 file
├── design_fir_filter()       # Design FIR with window method
├── design_iir_filter()       # Design IIR Butterworth
├── apply_fir_filter()        # Apply FIR to signal
├── apply_iir_filter()        # Apply IIR to signal
├── get_signal_waveform()     # Downsample for display
├── get_frequency_spectrum()  # Compute FFT
└── export_audio()            # Save filtered audio

Routes
├── GET /                     # Serve HTML
├── GET /api/audio-info       # Audio metadata
├── POST /api/design-fir      # Design FIR filter
├── POST /api/design-iir      # Design IIR filter
├── POST /api/apply-filter    # Apply filter
├── POST /api/waveform        # Get waveform
└── POST /api/audio-data      # Get playable audio
```

#### Frontend (static/js/)

**app.js** - Main Application Controller
- Initializes the application
- Manages UI state
- Handles user interactions
- Coordinates between modules

**filter-designer.js** - Filter Design Module
- API wrapper for filter design
- Manages filter states
- Tracks FIR and IIR designs
- Handles filter application

**visualization.js** - Rendering Engine
- Canvas 2D drawing functions
- Coefficient visualization
- Frequency response plots
- Waveform rendering
- Grid and axis drawing

**utils.js** - Utility Functions
- Time formatting
- Frequency formatting
- Array normalization
- Statistics calculation
- API helpers

#### Frontend (static/css/)

**style.css** - Complete Styling
- Dark theme design
- Responsive layout
- Component styling
- Animation and transitions
- Mobile support

## Technical Implementation Details

### Filter Design Algorithms

#### FIR Filter Design
```python
1. Normalize frequencies to 0-1 range (relative to Nyquist)
2. Apply Hamming window to reduce Gibbs phenomenon
3. Use firwin() from scipy.signal
4. Compute frequency response using freqz()
```

Features:
- Always stable (all poles at origin)
- Linear phase response
- Computational cost increases with tap count
- Good for steep rolloff with many taps

#### IIR Filter Design
```python
1. Normalize frequencies to 0-1 range
2. Use Butterworth topology (maximally flat passband)
3. Apply butter() from scipy.signal
4. Compute frequency response using freqz()
```

Features:
- Efficient (fewer coefficients than FIR for same rolloff)
- Non-linear phase response
- Must be checked for stability
- Good for resource-constrained applications

### Signal Processing Pipeline

```
Audio File (.mp3)
    ↓
[Librosa Load]
    ↓
Original Signal (Stereo → Mono)
    ↓
    ├─→ [FIR Filter] → Filtered Signal FIR
    │       (lfilter)
    │
    └─→ [IIR Filter] → Filtered Signal IIR
            (lfilter)
    ↓
[Waveform Export] → WAV for Playback
```

### Visualization Pipeline

```
Filter Design Parameters
    ↓
[Design Filter] (scipy)
    ↓
Coefficients + Frequency Response
    ↓
[Canvas Rendering]
    ├─→ Coefficient Bars
    ├─→ Frequency Response Curve
    └─→ Timeline Waveforms
```

## User Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│ Header: Title & Subtitle                               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────────────────────────────┐│
│  │   CONTROL   │  │   VISUALIZATION PANEL              ││
│  │   PANEL     │  │                                    ││
│  │             │  │  [Coefficients|Frequency|Timeline] ││
│  │ Band Select │  │                                    ││
│  │ FIR Design  │  │  ┌──────────────────────────────┐  ││
│  │ IIR Design  │  │  │                              │  ││
│  │ Playback    │  │  │   Visualization Canvas       │  ││
│  │ Controls    │  │  │                              │  ││
│  │             │  │  └──────────────────────────────┘  ││
│  └─────────────┘  └────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Filter Design Flow
```javascript
User Input
    ↓
design-fir-btn click
    ↓
POST /api/design-fir
    ↓
Backend Signal Processing
    ↓
JSON Response (coefficients, frequencies, magnitude_db)
    ↓
Visualization Rendering
    ↓
UI Updates
```

### Audio Playback Flow
```javascript
Play Button Click
    ↓
GET /api/audio-data (with filter params)
    ↓
Backend Processing
    ↓
WAV Blob Response
    ↓
Web Audio API Playback
```

## Mathematical Concepts

### Bandpass Filter
Passes frequencies between lowcut and highcut:
- Attenuates below lowcut
- Passes between lowcut-highcut
- Attenuates above highcut
- Transition band between passband and stopband

### FIR Filter Equation
```
y[n] = Σ(b[k] * x[n-k])  where k = 0 to N-1
```
- N = number of taps
- b[k] = filter coefficients
- x[n] = input signal
- y[n] = output signal

### IIR Filter Equation
```
y[n] = Σ(b[k] * x[n-k]) - Σ(a[k] * y[n-k])
```
- Has feedback from output
- Requires stability check
- More efficient for steep rolloff

### Frequency Response
```
H(f) = |FFT(b) / FFT(a)| in magnitude
arg(H(f)) = phase response
```

## Performance Considerations

### Optimization Techniques
1. **Downsampling for Display**: Reduces rendering overhead
2. **Canvas 2D Acceleration**: Uses GPU when available
3. **Server-side Processing**: Complex calculations done once
4. **Caching**: Filter designs cached until changed
5. **Efficient Downsampling**: Shows representative waveform

### Scalability
- Handles audio files up to ~1 hour long
- Real-time filter design (<100ms for typical parameters)
- Playback handled by browser Web Audio API
- Can process multiple filters sequentially

## Browser Compatibility

### Tested On
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- ES6+ JavaScript support
- Canvas 2D context
- Web Audio API
- Fetch API
- LocalStorage

### Not Required (But Future Enhancement)
- WebGPU (for real-time filtering)
- WebGL (for advanced visualization)
- Service Workers (for offline mode)

## Deployment Guide

### Development
```bash
python app.py
```
Access: http://localhost:5000

### Production with Gunicorn
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Production with Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY web_app/requirements.txt .
RUN pip install -r requirements.txt
COPY web_app/ .
CMD ["python", "app.py"]
```

### Environment Variables
```
FLASK_ENV=production
FLASK_DEBUG=0
AUDIO_FILE_PATH=/path/to/audio.mp3
```

## Extension Points

### Adding New Filter Types
1. Add design function in `SignalProcessor`
2. Create API endpoint in `app.py`
3. Create UI controls in `index.html`
4. Add visualization in `visualization.js`

### Custom Window Functions
Modify `design_fir_filter()` to support:
- Hann window
- Blackman window
- Kaiser window

### Advanced Visualizations
- Group delay plots
- Phase response
- Pole-zero diagram
- Waterfall plots

## Troubleshooting Guide

### Issue: "Audio file not found"
**Solution**: Verify file path in app.py matches actual location

### Issue: Port already in use
**Solution**: Change port in `app.run()` or kill existing process

### Issue: Slow performance
**Solution**: 
- Reduce FFT size in config
- Use fewer taps for FIR
- Lower IIR order

### Issue: Audio distortion
**Solution**:
- Reduce filter order
- Check frequency range validity
- Verify normalization factor

## File Structure

```
dsp04/
├── run.bat                          # Windows batch startup
├── run.ps1                          # PowerShell startup
├── README.md                        # Main documentation
├── QUICKSTART.md                    # Quick start guide
├── sunflower-street-drumloop...mp3 # Audio file
│
└── web_app/
    ├── app.py                       # Flask application (main backend)
    ├── config.json                  # Configuration file
    ├── index.html                   # HTML template
    ├── requirements.txt             # Python dependencies
    │
    └── static/
        ├── css/
        │   └── style.css            # Application styling
        │
        ├── js/
        │   ├── app.js               # Main app controller
        │   ├── filter-designer.js   # Filter design module
        │   ├── visualization.js     # Visualization engine
        │   └── utils.js             # Utility functions
        │
        └── shaders/
            └── waveform.wgsl        # WebGPU shaders (future)
```

## Dependencies

### Python
- flask==3.0.0
- numpy==1.24.3
- scipy==1.11.4
- librosa==0.10.0
- soundfile==0.12.1

### Browser
- No external JavaScript libraries (vanilla implementation)
- CSS3 support
- Canvas 2D API
- Web Audio API

## Future Enhancements

### Phase 2
- [ ] WebGPU acceleration
- [ ] Real-time signal filtering
- [ ] Group delay visualization
- [ ] Multiple filter types (Chebyshev, Elliptic)

### Phase 3
- [ ] Custom filter import/export
- [ ] Filter chain design
- [ ] Frequency response measurement
- [ ] Cross-platform desktop app (Electron)

### Phase 4
- [ ] Machine learning for optimal filter selection
- [ ] Collaborative filter design
- [ ] Cloud-based processing
- [ ] Mobile app version

## Learning Outcomes

After using this tool, students should understand:

1. **Filter Fundamentals**
   - What filters do and why they're important
   - Difference between FIR and IIR
   - Passband, transition band, stopband

2. **Frequency Response**
   - How to read and interpret frequency plots
   - -3dB points and cutoff frequencies
   - Rolloff slopes

3. **Design Trade-offs**
   - Computational cost vs. performance
   - Stability considerations
   - Phase distortion

4. **Real-world Applications**
   - Audio equalizers
   - Signal conditioning
   - Noise reduction

## References

### Theory
- Oppenheim & Schafer: Discrete-Time Signal Processing
- Parks & Burrus: Digital Filter Design
- Smith: The Scientist and Engineer's Guide to DSP

### Libraries
- scipy.signal: https://docs.scipy.org/doc/scipy/reference/signal.html
- librosa: https://librosa.org/
- NumPy: https://numpy.org/

### Web Technologies
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## License

Educational tool for learning purposes.

## Support & Questions

For technical support:
1. Check browser console (F12) for error messages
2. Review the QUICKSTART.md for common issues
3. Check application logs on the server

---

**Version**: 1.0.0  
**Last Updated**: December 6, 2025  
**Author**: DSP Education Team
