/**
 * Filter Designer - Handles FIR and IIR filter design and application
 */

class FilterDesigner {
    constructor() {
        this.firCoefficients = null;
        this.firFrequencies = null;
        this.firMagnitude = null;

        this.iirB = null;
        this.iirA = null;
        this.iirFrequencies = null;
        this.iirMagnitude = null;

        this.firFiltered = null;
        this.iirFiltered = null;

        this.audioInfo = null;
    }

    /**
     * Initialize audio information
     */
    async loadAudioInfo() {
        try {
            this.audioInfo = await Utils.fetchJSON('/api/audio-info');
            console.log('Audio loaded:', this.audioInfo);
            return this.audioInfo;
        } catch (error) {
            console.error('Error loading audio info:', error);
            throw error;
        }
    }

    /**
     * Design FIR filter
     */
    async designFIR(lowcut, highcut, numtaps) {
        try {
            const data = await Utils.postJSON('/api/design-fir', {
                lowcut: parseFloat(lowcut),
                highcut: parseFloat(highcut),
                numtaps: parseInt(numtaps)
            });

            this.firCoefficients = data.coefficients;
            this.firFrequencies = data.frequencies;
            this.firMagnitude = data.magnitude_db;

            return data;
        } catch (error) {
            console.error('Error designing FIR filter:', error);
            throw error;
        }
    }

    /**
     * Design IIR filter
     */
    async designIIR(lowcut, highcut, order) {
        try {
            const data = await Utils.postJSON('/api/design-iir', {
                lowcut: parseFloat(lowcut),
                highcut: parseFloat(highcut),
                order: parseInt(order)
            });

            this.iirB = data.b;
            this.iirA = data.a;
            this.iirFrequencies = data.frequencies;
            this.iirMagnitude = data.magnitude_db;

            return data;
        } catch (error) {
            console.error('Error designing IIR filter:', error);
            throw error;
        }
    }

    /**
     * Apply filters and get filtered signals
     */
    async applyFilters() {
        try {
            // Apply FIR filter
            if (this.firCoefficients) {
                const firData = await Utils.postJSON('/api/apply-filter', {
                    filter_type: 'fir',
                    coefficients: this.firCoefficients
                });
                this.firFiltered = firData.waveform;
            }

            // Apply IIR filter
            if (this.iirB && this.iirA) {
                const iirData = await Utils.postJSON('/api/apply-filter', {
                    filter_type: 'iir',
                    b: this.iirB,
                    a: this.iirA
                });
                this.iirFiltered = iirData.waveform;
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            throw error;
        }
    }

    /**
     * Get original waveform
     */
    async getOriginalWaveform() {
        try {
            return await Utils.postJSON('/api/waveform', {
                type: 'original'
            });
        } catch (error) {
            console.error('Error getting waveform:', error);
            throw error;
        }
    }

    /**
     * Get FIR filter info for display
     */
    getFIRInfo() {
        if (!this.firCoefficients) return null;

        const stats = Utils.getStats(this.firCoefficients);
        return {
            taps: this.firCoefficients.length,
            min: stats.min.toFixed(4),
            max: stats.max.toFixed(4),
            rms: stats.rms.toFixed(4),
            type: 'Hamming Window'
        };
    }

    /**
     * Get IIR filter info for display
     */
    getIIRInfo() {
        if (!this.iirB || !this.iirA) return null;

        const bStats = Utils.getStats(this.iirB);
        const aStats = Utils.getStats(this.iirA);

        return {
            order: this.iirB.length - 1,
            numB: this.iirB.length,
            numA: this.iirA.length,
            type: 'Butterworth',
            bMax: bStats.max.toFixed(4),
            aMax: aStats.max.toFixed(4)
        };
    }

    /**
     * Export filtered audio
     */
    async exportAudio(filterType) {
        try {
            const params = {
                filter_type: filterType
            };

            if (filterType === 'fir' && this.firCoefficients) {
                params.coefficients = this.firCoefficients;
            } else if (filterType === 'iir' && this.iirB && this.iirA) {
                params.b = this.iirB;
                params.a = this.iirA;
            }

            const response = await fetch('/api/audio-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            });

            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error exporting audio:', error);
            throw error;
        }
    }

    /**
     * Clear all designs
     */
    clear() {
        this.firCoefficients = null;
        this.firFrequencies = null;
        this.firMagnitude = null;
        this.iirB = null;
        this.iirA = null;
        this.iirFrequencies = null;
        this.iirMagnitude = null;
        this.firFiltered = null;
        this.iirFiltered = null;
    }
}

// Create global instance
const filterDesigner = new FilterDesigner();
