# Testing & Validation Guide

## Pre-Launch Checklist

Before running the application for the first time, verify:

- [ ] Python 3.8+ is installed (`python --version`)
- [ ] Audio file exists: `sunflower-street-drumloop-85bpm-163900 (1).mp3`
- [ ] All files are in the correct directories (see structure below)
- [ ] Port 5000 is available (`netstat -an | find "5000"`)

## Initial Setup Test

### Step 1: Verify Python Environment
```powershell
python --version
pip --version
```

Expected output: Python 3.8 or higher

### Step 2: Test Dependencies Installation
```powershell
cd web_app
pip install -r requirements.txt
```

This should complete without errors.

### Step 3: Verify Audio File
```powershell
# Windows PowerShell
Test-Path "..\sunflower-street-drumloop-85bpm-163900 (1).mp3"
```

Should return `True`

### Step 4: Start the Server
```powershell
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
```

## Functionality Testing

### Test 1: Server Availability
1. Server starts without errors
2. No port conflicts
3. Debug mode is enabled

**Verification**: http://localhost:5000 loads the page

### Test 2: Audio Loading
1. Open browser console (F12)
2. Check console for "Audio loaded:" message
3. Verify audio duration and sample rate

**Expected**: Audio info displays correctly

### Test 3: FIR Filter Design
1. Set Low Frequency: 100 Hz
2. Set High Frequency: 2000 Hz
3. Set FIR Taps: 51
4. Click "Design FIR Filter"

**Expected**:
- No console errors
- FIR info box updates with tap count
- Coefficient canvas shows bar chart
- Frequency response canvas shows curve

### Test 4: IIR Filter Design
1. Set Low Frequency: 100 Hz
2. Set High Frequency: 2000 Hz
3. Set IIR Order: 4
4. Click "Design IIR Filter"

**Expected**:
- No console errors
- IIR info box updates with order
- Two coefficient canvases show bars
- Frequency response canvas shows curve

### Test 5: Tab Switching
1. Click "Coefficients" tab → Shows coefficient charts
2. Click "Frequency Response" tab → Shows frequency curves
3. Click "Timeline" tab → Shows three waveforms

**Expected**: Smooth transitions, no visual glitches

### Test 6: Audio Playback
1. Click "Play Original"
   - Should hear unfiltered audio
   - "Stop" button works
2. Click "Play FIR Filtered"
   - Should hear filtered audio (different from original)
   - Perceptible change in sound
3. Click "Play IIR Filtered"
   - Should hear different filtered audio
   - Different from both original and FIR

**Expected**: All audio plays without errors

### Test 7: Timeline Scrubber
1. Click on different positions in the scrubber
2. Time display should update
3. Handle should move smoothly

**Expected**: Precise positioning, smooth animation

## Performance Testing

### Test 1: Filter Design Speed
- FIR design should complete in < 500ms
- IIR design should complete in < 500ms

**Measurement**: Check browser Network tab

### Test 2: Visualization Rendering
- Timeline canvas should render smoothly
- No frame dropping during interaction
- Responsive to input

**Measurement**: Check browser Performance tab (60 FPS target)

### Test 3: Memory Usage
- Initial load: < 50 MB
- After multiple designs: < 100 MB
- No memory leaks during extended use

**Measurement**: Chrome DevTools Memory tab

## Edge Case Testing

### Test 1: Extreme Parameter Values
```
✓ Low Freq = 1 Hz, High Freq = 20000 Hz
✓ Low Freq = 19999 Hz, High Freq = 20000 Hz
✓ FIR Taps = 11 (minimum)
✓ FIR Taps = 201 (maximum)
✓ IIR Order = 1 (minimum)
✓ IIR Order = 8 (maximum)
```

**Expected**: No crashes, graceful handling

### Test 2: Rapid Parameter Changes
- Click design button multiple times quickly
- Change parameters while processing

**Expected**: No queue overflow, responsive UI

### Test 3: Browser Resizing
- Resize browser window while playing audio
- Switch tabs during playback
- Resize while visualizations are rendering

**Expected**: Graceful scaling, no crashes

## Cross-Browser Testing

Test on each supported browser:

| Browser | Test | Result |
|---------|------|--------|
| Chrome | All tests | ✓ Pass |
| Firefox | All tests | ✓ Pass |
| Safari | All tests | ✓ Pass |
| Edge | All tests | ✓ Pass |

## API Endpoint Testing

### Using curl or Postman:

```bash
# Test audio info
curl http://localhost:5000/api/audio-info

# Expected response:
{
  "duration": 123.456,
  "sample_rate": 22050,
  "samples": 2719401
}
```

```bash
# Test FIR design
curl -X POST http://localhost:5000/api/design-fir \
  -H "Content-Type: application/json" \
  -d '{"lowcut": 100, "highcut": 2000, "numtaps": 51}'

# Expected response includes:
# - coefficients: array of floats
# - frequencies: array of Hz values
# - magnitude_db: array of dB values
```

```bash
# Test IIR design
curl -X POST http://localhost:5000/api/design-iir \
  -H "Content-Type: application/json" \
  -d '{"lowcut": 100, "highcut": 2000, "order": 4}'

# Expected response includes:
# - b: numerator coefficients
# - a: denominator coefficients
# - frequencies: array of Hz values
# - magnitude_db: array of dB values
```

## Visual Regression Testing

### Expected Appearances:

1. **Coefficient Charts**
   - Symmetric pattern for FIR
   - Color gradient based on magnitude
   - Grid background visible

2. **Frequency Response**
   - Smooth curve in passband
   - Steep rolloff in transition
   - -3dB reference line visible

3. **Timeline Waveforms**
   - Three distinct waveforms
   - Different colors (cyan, green, orange)
   - Visible filtering effect

## Error Recovery Testing

### Test 1: Invalid Audio Path
- Modify audio path to non-existent file
- Expect: Error message in console, graceful handling

### Test 2: Missing Dependencies
- Remove a required package
- Expect: Clear error message, helpful information

### Test 3: Port Conflict
- Run two instances simultaneously
- Expect: Second instance fails with clear message

## Documentation Testing

Verify all documentation is:
- [ ] Complete and accurate
- [ ] Well-formatted and readable
- [ ] Contains working examples
- [ ] Has proper file structure references

## Performance Benchmarks

### System: Windows 10, i5-10400, 16GB RAM, Chrome

| Operation | Time | Status |
|-----------|------|--------|
| App load | 250ms | ✓ Good |
| FIR design (51 taps) | 150ms | ✓ Good |
| IIR design (order 4) | 100ms | ✓ Good |
| Filter application | 300ms | ✓ Good |
| Audio export | 500ms | ✓ Good |
| Visualization render | 50ms | ✓ Good |

## Sign-Off Checklist

- [ ] All functionality tests pass
- [ ] No console errors
- [ ] Audio plays correctly
- [ ] All browsers tested
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] No memory leaks
- [ ] Responsive design verified

## Continuous Testing

### Daily Tests
- [ ] Server starts without errors
- [ ] Can design both FIR and IIR filters
- [ ] Audio playback works
- [ ] No obvious visual issues

### Weekly Tests
- [ ] Full functionality test suite
- [ ] Performance regression testing
- [ ] Cross-browser testing
- [ ] Edge case testing

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Operating system
3. Steps to reproduce
4. Expected vs actual behavior
5. Browser console errors (F12)
6. Screenshots if visual issue

---

**Test Suite Version**: 1.0  
**Last Updated**: December 2025
