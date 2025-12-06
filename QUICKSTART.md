# Quick Start Guide

## Installation & Running

### Option 1: Using Batch Script (Easiest on Windows)
1. Double-click `run.bat`
2. The server will start automatically
3. Open your browser to `http://localhost:5000`

### Option 2: Using PowerShell Script
1. Open PowerShell in this directory
2. Run: `.\run.ps1`
3. The server will start
4. Open your browser to `http://localhost:5000`

### Option 3: Manual Setup
1. Open Command Prompt or PowerShell in the `web_app` directory
2. Create virtual environment: `python -m venv venv`
3. Activate it:
   - Windows CMD: `venv\Scripts\activate.bat`
   - PowerShell: `.\venv\Scripts\Activate.ps1`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the app: `python app.py`
6. Open browser to `http://localhost:5000`

## First Time Using the Tool

1. **Set Frequency Range**
   - Adjust "Low Frequency" to 100 Hz
   - Adjust "High Frequency" to 2000 Hz
   - This creates a bandpass filter between these frequencies

2. **Design FIR Filter**
   - Keep "Number of Taps" at 51
   - Click "Design FIR Filter"
   - You'll see the coefficients and frequency response appear

3. **Design IIR Filter**
   - Keep "Filter Order" at 4
   - Click "Design IIR Filter"
   - Notice the difference from FIR in the frequency response

4. **Compare Results**
   - Click "Timeline" tab to see all three signals
   - Original signal shows the unprocessed audio
   - Two filtered versions show the effect of each filter

5. **Listen to the Difference**
   - Click "Play Original" to hear unfiltered
   - Then click "Play FIR Filtered" or "Play IIR Filtered"
   - Notice how the audio changes

## Understanding the Visualizations

### Coefficients Tab
- **FIR Coefficients**: Shows the filter tap weights
  - Symmetric pattern for linear phase
  - Bar height = coefficient magnitude
- **IIR Coefficients**: 
  - B coefficients (numerator) - feed-forward taps
  - A coefficients (denominator) - feedback taps

### Frequency Response Tab
- **Blue Curve**: Shows filter magnitude response
- **Orange Dashed Line**: Reference level (-3dB point)
- **X-axis**: Frequency in Hz
- **Y-axis**: Magnitude in dB
- **Passband**: Where the curve is high
- **Transition band**: Slope of the curve
- **Stopband**: Where the curve is low

### Timeline Tab
- Three waveforms side by side:
  - **Original Signal** (Cyan): Raw audio waveform
  - **FIR Filtered** (Green): After FIR filter
  - **IIR Filtered** (Orange): After IIR filter
- Use the scrubber to navigate through the audio

## Exploring Different Configurations

### Experiment 1: Effect of FIR Taps
1. Set band: 500 Hz to 1500 Hz
2. Set FIR taps to 21, design filter
3. View frequency response
4. Change to 101 taps, design again
5. Notice the steeper rolloff with more taps

### Experiment 2: Effect of IIR Order
1. Set band: 500 Hz to 1500 Hz
2. Set IIR order to 2, design filter
3. View frequency response
4. Change to 6, design again
5. Notice the much steeper rolloff with higher order

### Experiment 3: Different Frequency Bands
1. Try low frequencies: 50-500 Hz (bass)
2. Try high frequencies: 4000-8000 Hz (treble)
3. Listen to how each filter affects the audio differently

## Tips & Tricks

- **Real-time Updates**: Changes to parameters take effect immediately when you click "Design"
- **Playback Controls**: Can switch between original and filtered audio while playing
- **Timeline Scrubber**: Drag the scrubber to seek through the audio
- **Responsive Design**: Application works on different screen sizes
- **Educational Mode**: Try to predict how changing parameters will affect the frequency response

## Troubleshooting

### "Audio file not found"
- Ensure `sunflower-street-drumloop-85bpm-163900 (1).mp3` is in the `dsp04` directory (parent of `web_app`)

### Port 5000 already in use
- Change the port in `app.py`:
  - Find `app.run(debug=True, port=5000)`
  - Change `5000` to another port like `8000`
  - Access at `http://localhost:8000`

### Slow visualization
- This might happen with very large coefficients arrays
- Reduce the number of taps or order
- Use Chrome/Edge for best performance

### Audio won't play
- Check browser console (F12) for errors
- Ensure audio playback is not muted in browser
- Try a different browser

## Next Steps

Once you're comfortable with basic filter design:

1. **Compare FIR vs IIR**:
   - Design filters with same frequency band
   - Observe differences in coefficient count and phase response

2. **Study Filter Theory**:
   - Read about window functions (Hamming, Hann, Blackman)
   - Learn about Butterworth, Chebyshev, and Elliptic filters

3. **Real-world Applications**:
   - Audio equalizers use bandpass filters
   - Communication systems use these for channel selection
   - Medical devices use them for signal preprocessing

## Learning Resources

- Signal Processing in Python: Check scipy.signal documentation
- Filter Design: Search for "FIR vs IIR filter design"
- Audio Processing: Look up "audio signal processing"

Enjoy learning about digital signal processing!
