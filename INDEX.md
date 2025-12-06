# Digital Signal Processing - IIR & FIR Filter Design Tool

A comprehensive, interactive web-based learning tool for digital signal processing with focus on bandpass filter design, analysis, and real-time audio processing.

## 🚀 Quick Start

### Fastest Way to Run (Windows)
1. Double-click **`run.bat`** in this directory
2. Wait for the browser to open at http://localhost:5000
3. Start designing filters!

### Using PowerShell (Windows)
```powershell
.\run.ps1
```

### Manual Setup (All Platforms)
```bash
cd web_app
python -m venv venv

# Windows
venv\Scripts\activate.bat

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Then open: **http://localhost:5000**

## 📋 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step tutorial and first-time user guide
- **[README.md](README.md)** - Complete feature documentation
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Technical architecture and deep dive

## ✨ Features

### Interactive Filter Design
- **FIR Filters**: Design with configurable tap count (11-201)
  - Hamming window method
  - Linear phase response
  - Stable by design
  
- **IIR Filters**: Design with configurable order (1-8)
  - Butterworth topology
  - Efficient coefficient count
  - Non-linear phase

### Multiple Visualization Modes
- **Coefficients View**: See filter tap weights as bar charts
- **Frequency Response**: View magnitude response with -3dB reference line
- **Timeline View**: Compare original and filtered waveforms side-by-side

### Audio Processing & Playback
- Load MP3 audio files
- Apply real-time filtering
- Playback original and filtered versions
- Timeline scrubber for navigation
- Export filtered audio as WAV

## 🎯 What You Can Learn

1. **Filter Fundamentals**
   - What filters do and why they matter
   - FIR vs IIR characteristics
   - Passband, transition band, stopband concepts

2. **Frequency Domain Analysis**
   - Reading frequency response plots
   - Understanding -3dB cutoff points
   - Observing rolloff behavior

3. **Design Trade-offs**
   - How filter order/taps affect response
   - Computational cost vs performance
   - Phase distortion effects

4. **Real-world Applications**
   - Audio equalization
   - Noise filtering
   - Signal conditioning

## 📁 Project Structure

```
dsp04/
├── run.bat                    # ⭐ Windows quick start
├── run.ps1                    # ⭐ PowerShell quick start
├── README.md                  # Complete documentation
├── QUICKSTART.md              # Tutorial & guide
├── DOCUMENTATION.md           # Technical details
├── audio_file.mp3             # Audio to process
│
└── web_app/
    ├── app.py                 # Flask backend + signal processing
    ├── index.html             # Web interface
    ├── config.json            # Configuration
    ├── requirements.txt       # Python packages
    │
    └── static/
        ├── css/style.css      # Dark theme styling
        ├── js/                # JavaScript modules
        │   ├── app.js         # Main controller
        │   ├── filter-designer.js   # Filter design
        │   ├── visualization.js     # Rendering engine
        │   └── utils.js       # Helper functions
        └── shaders/           # WebGPU shaders (future)
```

## 🛠️ Technology Stack

**Backend**
- Python 3.8+
- Flask web framework
- NumPy & SciPy for signal processing
- Librosa for audio loading
- SoundFile for audio export

**Frontend**
- Vanilla JavaScript (ES6+)
- HTML5 Canvas for visualization
- Web Audio API for playback
- CSS3 with custom design system

## 🎓 Usage Example

### Basic Workflow
1. Open http://localhost:5000
2. Set frequency range: 100 Hz - 2000 Hz
3. Click "Design FIR Filter"
4. Observe coefficients and frequency response
5. Click "Design IIR Filter" for comparison
6. Switch to "Timeline" tab to see results
7. Click "Play FIR Filtered" to hear the effect

### Exploration Ideas
- **Experiment 1**: Change FIR taps from 21 to 101 and observe steeper rolloff
- **Experiment 2**: Change IIR order from 2 to 6 and see the dramatic difference
- **Experiment 3**: Try different frequency bands (bass, mid, treble)
- **Experiment 4**: Compare how much audio changes with different filters

## 📊 Understanding the UI

### Control Panel (Left Side)
- **Band Selection**: Set low and high cutoff frequencies
- **FIR Design**: Choose number of taps, click design button
- **IIR Design**: Choose filter order, click design button
- **Playback Controls**: Play original or filtered versions

### Visualization Panel (Right Side)
- **Coefficients Tab**: Bar charts of filter weights
- **Frequency Response Tab**: Magnitude plots in dB
- **Timeline Tab**: All waveforms stacked vertically
  - Cyan: Original signal
  - Green: FIR filtered
  - Orange: IIR filtered

## 🔧 Customization

### Change Audio File
Edit `web_app/app.py` line with `AUDIO_FILE`:
```python
AUDIO_FILE = Path(__file__).parent.parent / "your_audio.mp3"
```

### Change Default Frequencies
Edit `web_app/static/js/app.js`:
```javascript
document.getElementById('lowcut').value = 200;  // Hz
document.getElementById('highcut').value = 3000; // Hz
```

### Change Color Scheme
Edit `web_app/static/css/style.css`:
- `--primary-color`: Main UI color
- `--accent`: Highlight color
- `--bg-dark`: Background color

## ⚡ Performance Tips

- Use lower filter orders for faster processing
- Reduce FIR taps to speed up design
- Chrome/Edge generally faster than Firefox
- Close other browser tabs for best performance

## 🌐 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | ✅ Full | Best performance |
| Firefox 88+ | ✅ Full | Good compatibility |
| Safari 14+ | ✅ Full | Slightly slower |
| Edge 90+ | ✅ Full | Like Chrome |

## 🐛 Troubleshooting

### Issue: "Audio file not found"
→ Verify the MP3 file is in the `dsp04` directory (not `web_app`)

### Issue: Port 5000 already in use
→ Edit `web_app/app.py` and change port to 8000 or 9000

### Issue: Slow performance
→ Reduce filter order/taps or try a different browser

### Issue: No sound when playing
→ Check browser volume, try another browser, check console for errors (F12)

## 📚 Educational Resources

### In This Tool
- Real-time filter coefficient visualization
- Interactive frequency response plots
- Audio examples showing actual filter effects
- Side-by-side comparison of FIR and IIR

### Online Resources
- SciPy Signal Processing: https://docs.scipy.org/doc/scipy/reference/signal.html
- DSP Guide: https://www.dspguide.com/
- Khan Academy - Digital Signal Processing

## 🚀 Future Enhancements

- WebGPU acceleration for real-time filtering
- More filter types (Chebyshev, Elliptic)
- Group delay and phase response plots
- Filter chain design
- Mobile app version

## 📝 License

Educational tool for learning purposes.

## 🤝 Support

For issues:
1. Check browser console (F12) for error messages
2. Review [QUICKSTART.md](QUICKSTART.md) for common issues
3. Check [DOCUMENTATION.md](DOCUMENTATION.md) for technical details

---

**Version**: 1.0.0  
**Created**: December 2025

Enjoy learning digital signal processing! 🎓
