/**
 * High-performance visualization using Canvas 2D API
 * (WebGPU would be overkill for this, Canvas is more compatible)
 */

class Visualization {
    constructor() {
        this.canvases = new Map();
        this.contexts = new Map();
        this.animationFrames = new Map();

        // Listen for canvas update events
        window.addEventListener('canvasUpdateNeeded', () => {
            this.updateAllCanvasResolutions();
        });
    }

    /**
     * Update all canvas resolutions and trigger redraws
     */
    updateAllCanvasResolutions() {
        // Update all canvas resolutions which will trigger proper scaling
        this.canvases.forEach((canvas, canvasId) => {
            this.setCanvasResolution(canvasId);
        });
    }

    /**
     * Get or create a canvas context
     */
    getContext(canvasId) {
        if (!this.contexts.has(canvasId)) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.error(`Canvas with id ${canvasId} not found`);
                return null;
            }
            this.canvases.set(canvasId, canvas);
            this.contexts.set(canvasId, canvas.getContext('2d'));
            this.setCanvasResolution(canvasId);
        }
        return this.contexts.get(canvasId);
    }

    /**
     * Set canvas resolution for sharp rendering
     */
    setCanvasResolution(canvasId) {
        const canvas = this.canvases.get(canvasId);
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = this.contexts.get(canvasId);
        ctx.scale(dpr, dpr);
        
        // Force a clear and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /**
     * Draw coefficient bars
     */
    drawCoefficients(canvasId, coefficients, title = '') {
        const canvas = this.canvases.get(canvasId);
        const ctx = this.getContext(canvasId);
        if (!ctx || !canvas) return;

        // Ensure canvas has proper dimensions
        this.setCanvasResolution(canvasId);
        
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid
        this.drawGrid(ctx, width, height);

        // Normalize coefficients
        const absCoeffs = coefficients.map(c => Math.abs(c));
        const maxCoeff = Math.max(...absCoeffs);
        
        if (maxCoeff === 0) return;

        const normalized = coefficients.map(c => c / maxCoeff);

        // Draw bars
        const barWidth = width / coefficients.length;
        const centerY = height / 2;
        const scale = (height / 2) * 0.8;
        const labelSpace = 20; // Space for labels at bottom
        const plotHeight = height - labelSpace;
        const adjustedCenterY = plotHeight / 2;

        coefficients.forEach((coeff, i) => {
            const x = i * barWidth;
            const maxAbsCoeff = Math.max(...coefficients.map(c => Math.abs(c)));
            const normalizedValue = coeff / maxAbsCoeff;
            
            // For positive values: bar goes up from center
            // For negative values: bar goes down from center
            const barHeight = normalizedValue * scale;
            const y = normalizedValue > 0 ? 
                adjustedCenterY - barHeight : 
                adjustedCenterY;
            const h = Math.abs(barHeight);

            // Color based on value
            const color = coeff > 0 ? 
                `hsl(200, 100%, ${50 + Math.abs(normalizedValue) * 30}%)` :
                `hsl(0, 100%, ${50 + Math.abs(normalizedValue) * 30}%)`;

            ctx.fillStyle = color;
            ctx.fillRect(x, y, barWidth - 1, h);

            // Border
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, barWidth - 1, h);
            
            // Draw value label on the bar (vertical text)
            if (barWidth > 20) { // Only show values if bars are wide enough
                const labelY = y + h / 2;
                const valueStr = coeff.toFixed(3);
                
                // Only show label if it fits
                if (h > 30) {
                    // Save context state
                    ctx.save();
                    
                    // Translate to center of bar, rotate, then draw
                    ctx.translate(x + barWidth / 2, labelY);
                    ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise
                    
                    // Draw text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(valueStr, 0, 0);
                    
                    // Restore context state
                    ctx.restore();
                }
            }
        });

        // Draw center line
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, adjustedCenterY);
        ctx.lineTo(width, adjustedCenterY);
        ctx.stroke();

        // Add coefficient index labels
        ctx.fillStyle = '#b0b0b0';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Show every nth label to avoid crowding (depends on number of coefficients)
        const labelStep = coefficients.length > 50 ? Math.ceil(coefficients.length / 25) : 
                         coefficients.length > 20 ? Math.ceil(coefficients.length / 15) : 1;
        
        for (let i = 0; i < coefficients.length; i += labelStep) {
            const x = (i + 0.5) * barWidth;
            const y = height - 10;
            ctx.fillText(i.toString(), x, y);
        }

        // Labels
        this.drawLabels(ctx, width, height, title);
    }

    /**
     * Draw frequency response curve
     */
    drawFrequencyResponse(canvasId, frequencies, magnitudeDb, title = '') {
        const canvas = this.canvases.get(canvasId);
        const ctx = this.getContext(canvasId);
        if (!ctx || !canvas) return;

        // Ensure canvas has proper dimensions
        this.setCanvasResolution(canvasId);
        
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid and axes
        this.drawGrid(ctx, width, height);
        this.drawAxes(ctx, width, height, frequencies, magnitudeDb);

        if (frequencies.length === 0 || magnitudeDb.length === 0) return;

        // Normalize dB values for visualization
        const minDb = Math.min(...magnitudeDb);
        const maxDb = Math.max(...magnitudeDb);
        const dbRange = maxDb - minDb;

        const padding = 30;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;

        // Draw curve
        ctx.strokeStyle = '#00BCD4';
        ctx.lineWidth = 2;
        ctx.beginPath();

        let firstPoint = true;
        frequencies.forEach((freq, i) => {
            if (i >= magnitudeDb.length) return;
            
            const x = padding + (freq / frequencies[frequencies.length - 1]) * plotWidth;
            const normalizedDb = dbRange !== 0 ? 
                (magnitudeDb[i] - minDb) / dbRange : 0.5;
            const y = height - padding - normalizedDb * plotHeight;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Fill under curve
        ctx.strokeStyle = 'transparent';
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 188, 212, 0.1)';
        ctx.fill();

        // Draw -3dB line
        const threeDbY = height - padding - (0.5 * plotHeight);
        ctx.strokeStyle = '#FF9800';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, threeDbY);
        ctx.lineTo(width - padding, threeDbY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        this.drawLabels(ctx, width, height, title);
    }

    /**
     * Draw waveform
     */
    drawWaveform(canvasId, time, amplitude, color = '#00BCD4', title = '') {
        const canvas = this.canvases.get(canvasId);
        const ctx = this.getContext(canvasId);
        if (!ctx || !canvas) return;

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Grid
        this.drawGrid(ctx, width, height);

        if (amplitude.length === 0) return;

        // Normalize amplitude
        const maxAmp = Math.max(...amplitude.map(a => Math.abs(a)));
        if (maxAmp === 0) return;
        const normalized = amplitude.map(a => a / maxAmp);

        const padding = 20;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;
        const centerY = height / 2;

        // Draw waveform
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();

        let firstPoint = true;
        normalized.forEach((amp, i) => {
            const x = padding + (i / normalized.length) * plotWidth;
            const y = centerY - amp * plotHeight / 2;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Fill under curve
        ctx.lineTo(width - padding, centerY);
        ctx.lineTo(padding, centerY);
        ctx.closePath();
        ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba').replace('hsl', 'hsla');
        ctx.fill();

        // Center line
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, centerY);
        ctx.lineTo(width - padding, centerY);
        ctx.stroke();

        // Labels
        this.drawLabels(ctx, width, height, title);
    }

    /**
     * Draw grid
     */
    drawGrid(ctx, width, height, divisions = 5) {
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let i = 0; i <= divisions; i++) {
            const x = (width / divisions) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let i = 0; i <= divisions; i++) {
            const y = (height / divisions) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    /**
     * Draw axes
     */
    drawAxes(ctx, width, height, xValues, yValues) {
        const padding = 30;
        
        // X axis
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Y axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // Tick marks and labels
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        // X axis labels
        if (xValues.length > 0) {
            const maxX = Math.max(...xValues);
            for (let i = 0; i <= 5; i++) {
                const x = padding + (i / 5) * (width - 2 * padding);
                const value = (i / 5) * maxX;
                ctx.fillText(Utils.formatFrequency(value), x, height - padding + 15);
            }
        }

        // Y axis labels
        ctx.textAlign = 'right';
        if (yValues.length > 0) {
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);
            const range = maxY - minY;

            for (let i = 0; i <= 5; i++) {
                const y = height - padding - (i / 5) * (height - 2 * padding);
                const value = minY + (i / 5) * range;
                ctx.fillText(value.toFixed(0), padding - 5, y + 3);
            }
        }
    }

    /**
     * Draw labels
     */
    drawLabels(ctx, width, height, title) {
        if (!title) return;

        ctx.fillStyle = '#00BCD4';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(title, 10, 20);
    }

    /**
     * Draw frequency spectrum
     */
    drawSpectrum(canvasId, signal, sampleRate, color = '#00BCD4', signalType = 'original') {
        console.log(`[drawSpectrum] Starting for canvas: ${canvasId}, signal type: ${signalType}`);
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas with id ${canvasId} not found`);
            return;
        }

        // Register canvas if not already done
        if (!this.canvases.has(canvasId)) {
            this.canvases.set(canvasId, canvas);
            const ctx = canvas.getContext('2d');
            this.contexts.set(canvasId, ctx);
            console.log(`[drawSpectrum] Registered canvas: ${canvasId}`);
        }

        // Get context and ensure proper resolution
        const ctx = this.getContext(canvasId);
        if (!ctx) {
            console.error(`[drawSpectrum] Failed to get context for ${canvasId}`);
            return;
        }

        this.setCanvasResolution(canvasId);
        
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        console.log(`[drawSpectrum] Canvas size: ${width}x${height}`);

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        this.drawGrid(ctx, width, height);

        if (!signal || signal.length === 0) {
            console.warn(`[drawSpectrum] No signal data`);
            return;
        }

        // Calculate spectrum using client-side processing
        console.log(`[drawSpectrum] Calculating spectrum...`);
        try {
            const spectrumData = this.calculateSpectrum(signal, sampleRate);
            console.log(`[drawSpectrum] Calculated spectrum data:`, spectrumData);
            this.drawSpectrumData(canvasId, spectrumData, color, sampleRate);
            console.log(`[drawSpectrum] Spectrum drawn`);
        } catch (error) {
            console.error('Error calculating spectrum:', error);
        }
    }

    /**
     * Calculate spectrum data using client-side processing
     */
    calculateSpectrum(signal, sampleRate) {
        try {
            // Convert signal to Float64Array if it's not already
            const signalArray = signal instanceof Float64Array ? signal : new Float64Array(signal);
            
            // Calculate FFT
            const nFFT = Math.pow(2, Math.ceil(Math.log2(signalArray.length)));
            const paddedSignal = new Float64Array(nFFT);
            paddedSignal.set(signalArray.slice(0, nFFT));
            
            // Use SignalProcessor's FFT if available, otherwise use simple implementation
            let spectrum;
            if (typeof SignalProcessor !== 'undefined') {
                const tempProcessor = new SignalProcessor({
                    sampleRate: sampleRate,
                    duration: signalArray.length / sampleRate,
                    getChannelData: () => signalArray
                });
                spectrum = tempProcessor.fft(paddedSignal);
            } else {
                // Fallback to simple FFT implementation
                spectrum = this.simpleFFT(paddedSignal);
            }
            
            // Get positive frequencies only
            const positiveFreqs = this.fftfreq(nFFT, 1/sampleRate).slice(0, nFFT/2);
            const positiveSpectrum = spectrum.slice(0, nFFT/2);
            
            // Convert to dB
            const magnitudeDb = positiveSpectrum.map(complex => {
                const magnitude = Math.sqrt(complex.real * complex.real + complex.imag * complex.imag);
                return 20 * Math.log10(magnitude + 1e-10);
            });
            
            return {
                frequencies: positiveFreqs,
                magnitude_db: magnitudeDb
            };
        } catch (error) {
            console.error('Error in calculateSpectrum:', error);
            return { frequencies: [], magnitude_db: [] };
        }
    }

    /**
     * Simple FFT implementation (fallback)
     */
    simpleFFT(x) {
        const N = x.length;
        if (N <= 1) {
            return x.map(val => ({ real: val, imag: 0 }));
        }
        
        // Divide
        const even = new Float64Array(N / 2);
        const odd = new Float64Array(N / 2);
        
        for (let i = 0; i < N / 2; i++) {
            even[i] = x[2 * i];
            odd[i] = x[2 * i + 1];
        }
        
        // Conquer
        const evenFFT = this.simpleFFT(even);
        const oddFFT = this.simpleFFT(odd);
        
        // Combine
        const result = new Array(N);
        
        for (let k = 0; k < N / 2; k++) {
            const t = {
                real: oddFFT[k].real * Math.cos(-2 * Math.PI * k / N) - oddFFT[k].imag * Math.sin(-2 * Math.PI * k / N),
                imag: oddFFT[k].real * Math.sin(-2 * Math.PI * k / N) + oddFFT[k].imag * Math.cos(-2 * Math.PI * k / N)
            };
            
            result[k] = {
                real: evenFFT[k].real + t.real,
                imag: evenFFT[k].imag + t.imag
            };
            result[k + N / 2] = {
                real: evenFFT[k].real - t.real,
                imag: evenFFT[k].imag - t.imag
            };
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
     * Draw spectrum data on canvas
     */
    drawSpectrumData(canvasId, spectrumData, color, sampleRate) {
        const canvas = this.canvases.get(canvasId);
        const ctx = this.getContext(canvasId);
        if (!ctx || !canvas) {
            console.error(`Canvas ${canvasId} not found for spectrum data`);
            return;
        }

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        // Clear canvas first
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Redraw grid
        this.drawGrid(ctx, width, height);

        const frequencies = spectrumData.frequencies;
        const magnitudes = spectrumData.magnitude_db;

        if (!frequencies || frequencies.length === 0) {
            console.warn('No frequency data available');
            return;
        }

        // Normalize magnitudes for visualization
        const maxMag = Math.max(...magnitudes);
        const minMag = Math.min(...magnitudes);
        const magRange = maxMag - minMag || 1;

        const padding = 10;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;

        // Draw frequency spectrum
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        let firstPoint = true;
        for (let i = 0; i < frequencies.length; i++) {
            const freq = frequencies[i];
            const mag = magnitudes[i];
            
            const x = padding + (freq / (sampleRate / 2)) * plotWidth;
            const normalizedMag = (mag - minMag) / magRange;
            const y = height - padding - normalizedMag * plotHeight;

            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Fill under curve with transparency
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        
        // Parse color and add transparency
        let fillColor = color;
        if (color.startsWith('hsl')) {
            fillColor = color.replace(')', ', 0.15)').replace('hsl', 'hsla');
        } else if (color.startsWith('rgb')) {
            fillColor = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
        }
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    /**
     * Clear canvas
     */
    clear(canvasId) {
        const ctx = this.getContext(canvasId);
        const canvas = this.canvases.get(canvasId);
        if (!ctx || !canvas) return;

        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Dispose of canvas and context
     */
    dispose(canvasId) {
        this.animationFrames.delete(canvasId);
        this.canvases.delete(canvasId);
        this.contexts.delete(canvasId);
    }
}

// Create global instance
const visualization = new Visualization();
