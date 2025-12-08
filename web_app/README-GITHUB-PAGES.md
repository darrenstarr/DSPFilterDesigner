# DSP Filter Tool - GitHub Pages Deployment

This is a client-side digital signal processing filter design tool that runs entirely in the browser, making it perfect for GitHub Pages hosting.

## Features

- **FIR Filter Design**: Design Finite Impulse Response filters with customizable parameters
- **IIR Filter Design**: Design Infinite Impulse Response filters with customizable parameters  
- **Real-time Audio Processing**: Apply filters to audio files directly in the browser
- **Frequency Spectrum Analysis**: Visualize frequency response and spectrum analysis
- **Audio Export**: Export filtered audio as WAV files
- **Client-side Processing**: No server required - runs entirely in the browser

## How to Use

1. Open `index.html` in a web browser
2. Load an audio file (WAV, MP3, or other supported formats)
3. Design FIR or IIR filters using the filter designer interface
4. Apply filters to the audio signal
5. View frequency spectrum analysis
6. Export filtered audio as WAV files

## GitHub Pages Deployment

This project is designed to work with GitHub Pages. Simply:

1. Create a new GitHub repository
2. Push this code to the repository
3. Enable GitHub Pages in the repository settings
4. The site will be available at `https://yourusername.github.io/your-repo-name`

## File Structure

```
web_app/
├── index.html              # Main application entry point
├── static/
│   ├── css/
│   │   └── style.css       # Application styles
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── filter-designer.js  # Filter design functionality
│   │   ├── signal-processor.js # Client-side signal processing library
│   │   ├── utils.js        # Utility functions
│   │   └── visualization.js # Visualization components
│   └── shaders/
│       └── waveform.wgsl   # WebGPU shaders
└── tests/
    ├── integration-test.html    # End-to-end integration tests
    ├── signal-processor-tests.js # Unit tests for signal processing
    └── test-runner.html         # Test execution interface
```

## Testing

Run the comprehensive test suite to verify the migration:

1. **Unit Tests**: Open `static/js/tests/test-runner.html` in a browser
2. **Integration Tests**: Open `static/js/tests/integration-test.html` in a browser

The tests validate:
- Audio loading and processing
- FIR and IIR filter design
- Filter application
- Frequency spectrum analysis
- Audio export functionality

## Technical Details

### Client-side Signal Processing

All signal processing has been migrated from Python/Flask to JavaScript:

- **FIR Filter Design**: Window method with Hamming, Hanning, Blackman, or rectangular windows
- **IIR Filter Design**: Butterworth filter design with bilinear transform
- **FFT Implementation**: Fast Fourier Transform for frequency analysis
- **Audio Processing**: Web Audio API for audio loading and processing
- **WAV Export**: Client-side WAV file generation

### Browser Compatibility

- Modern browsers with Web Audio API support
- WebGL for GPU-accelerated visualization
- ES6+ JavaScript features

### Performance Considerations

- All processing happens in the browser
- No server load or bandwidth usage for audio processing
- Efficient FFT algorithms for real-time analysis
- Canvas-based visualization for smooth rendering

## Migration from Server-side to Client-side

This project was originally built with a Flask backend for signal processing. The migration to client-side processing involved:

1. **Signal Processing Library**: Created `signal-processor.js` with equivalent functionality
2. **Audio Processing**: Replaced server-side audio loading with Web Audio API
3. **Filter Design**: Implemented FIR and IIR filter algorithms in JavaScript
4. **Visualization**: Moved frequency analysis to client-side FFT
5. **Export**: Added client-side WAV file generation
6. **Testing**: Comprehensive test suite to validate migration

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is open source and available under the MIT License.