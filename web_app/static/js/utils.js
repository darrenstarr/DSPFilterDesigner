/**
 * Utility functions for DSP filter design tool
 */

class Utils {
    /**
     * Format time in seconds to MM:SS format
     */
    static formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Convert Hz to a readable format
     */
    static formatFrequency(hz) {
        if (hz >= 1000) {
            return `${(hz / 1000).toFixed(1)} kHz`;
        }
        return `${hz.toFixed(0)} Hz`;
    }

    /**
     * Convert dB to linear scale
     */
    static dbToLinear(db) {
        return Math.pow(10, db / 20);
    }

    /**
     * Convert linear to dB scale
     */
    static linearToDb(linear) {
        return 20 * Math.log10(Math.abs(linear) + 1e-10);
    }

    /**
     * Normalize array to [-1, 1] range
     */
    static normalize(array) {
        const max = Math.max(...array.map(v => Math.abs(v)));
        if (max === 0) return array;
        return array.map(v => v / max);
    }

    /**
     * Downsample array by factor
     */
    static downsample(array, factor) {
        const result = [];
        for (let i = 0; i < array.length; i += factor) {
            result.push(array[i]);
        }
        return result;
    }

    /**
     * Get statistics from array
     */
    static getStats(array) {
        const abs = array.map(v => Math.abs(v));
        return {
            min: Math.min(...array),
            max: Math.max(...array),
            absMin: Math.min(...abs),
            absMax: Math.max(...abs),
            mean: array.reduce((a, b) => a + b, 0) / array.length,
            rms: Math.sqrt(array.reduce((sum, v) => sum + v * v, 0) / array.length)
        };
    }

    /**
     * Perform FFT (using simple implementation for small samples)
     */
    static fft(samples) {
        // This is a placeholder - in production, use FFTJS library
        return samples;
    }

    /**
     * Generate frequency axis for plotting
     */
    static generateFrequencyAxis(numPoints, sampleRate, freqRange = null) {
        const nyquist = sampleRate / 2;
        const freqs = [];
        
        for (let i = 0; i < numPoints; i++) {
            const freq = (i / numPoints) * nyquist;
            if (!freqRange || (freq >= freqRange[0] && freq <= freqRange[1])) {
                freqs.push(freq);
            }
        }
        
        return freqs;
    }

    /**
     * Interpolate value between two points
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Create a colormap value
     */
    static getColor(value, min, max, colorScheme = 'viridis') {
        const normalized = (value - min) / (max - min);
        const clamped = Math.max(0, Math.min(1, normalized));

        // Simple viridis-like colormap
        if (colorScheme === 'viridis') {
            if (clamped < 0.25) {
                const t = clamped / 0.25;
                return `rgb(${Math.floor(68 + (29 - 68) * t)}, ${Math.floor(1 + (172 - 1) * t)}, ${Math.floor(84 + (255 - 84) * t)})`;
            } else if (clamped < 0.5) {
                const t = (clamped - 0.25) / 0.25;
                return `rgb(${Math.floor(29 + (63 - 29) * t)}, ${Math.floor(172 + (227 - 172) * t)}, ${Math.floor(255 + (56 - 255) * t)})`;
            } else if (clamped < 0.75) {
                const t = (clamped - 0.5) / 0.25;
                return `rgb(${Math.floor(63 + (253 - 63) * t)}, ${Math.floor(227 + (231 - 227) * t)}, ${Math.floor(56 + (37 - 56) * t)})`;
            } else {
                const t = (clamped - 0.75) / 0.25;
                return `rgb(${Math.floor(253 + (240 - 253) * t)}, ${Math.floor(231)}, ${Math.floor(37)})`;
            }
        }

        // Blue to red
        return `hsl(${(1 - clamped) * 240}, 100%, 50%)`;
    }

    /**
     * Fetch with error handling
     */
    static async fetchJSON(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    /**
     * Post JSON data
     */
    static async postJSON(url, data) {
        return this.fetchJSON(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
