/**
 * Filter Designer - Handles FIR and IIR filter design and application
 * Updated to use client-side signal processing
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
        this.signalProcessor = null;
        this.audioBuffer = null;
    }

    /**
     * Initialize audio information and load audio file
     */
    async loadAudioInfo() {
        try {
            // Load the audio file
            const audioFile = 'sunflower-street-drumloop-85bpm-163900 (1).mp3';
            this.audioBuffer = await this.loadAudioFile(audioFile);
            
            // Initialize signal processor
            this.signalProcessor = new SignalProcessor(this.audioBuffer);
            
            // Set audio info
            this.audioInfo = {
                duration: this.signalProcessor.duration,
                sampleRate: this.signalProcessor.sampleRate,
                samples: this.signalProcessor.originalSignal.length
            };
            
            console.log('Audio loaded:', this.audioInfo);
            return this.audioInfo;
        } catch (error) {
            console.error('Error loading audio info:', error);
            throw error;
        }
    }

    /**
     * Load audio file using Web Audio API
     */
    async loadAudioFile(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', error);
            throw error;
        }
    }

    /**
     * Design FIR filter
     */
    async designFIR(lowcut, highcut, numtaps) {
        try {
            if (!this.signalProcessor) {
                throw new Error('Signal processor not initialized');
            }

            const data = this.signalProcessor.designFIRFilter(
                parseFloat(lowcut),
                parseFloat(highcut),
                parseInt(numtaps)
            );

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
            if (!this.signalProcessor) {
                throw new Error('Signal processor not initialized');
            }

            const data = this.signalProcessor.designIIRFilter(
                parseFloat(lowcut),
                parseFloat(highcut),
                parseInt(order)
            );

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
                const firSignal = this.signalProcessor.applyFIRFilter(this.firCoefficients);
                this.firFiltered = this.signalProcessor.getSignalWaveform(firSignal);
            }

            // Apply IIR filter
            if (this.iirB && this.iirA) {
                const iirSignal = this.signalProcessor.applyIIRFilter(this.iirB, this.iirA);
                this.iirFiltered = this.signalProcessor.getSignalWaveform(iirSignal);
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
            if (!this.signalProcessor) {
                throw new Error('Signal processor not initialized');
            }
            return this.signalProcessor.getSignalWaveform();
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
            if (!this.signalProcessor) {
                throw new Error('Signal processor not initialized');
            }

            let blob;
            if (filterType === 'fir' && this.firCoefficients) {
                blob = this.signalProcessor.exportAudio('fir', this.firCoefficients);
            } else if (filterType === 'iir' && this.iirB && this.iirA) {
                blob = this.signalProcessor.exportAudio('iir', null, this.iirB, this.iirA);
            } else if (filterType === 'original') {
                blob = this.signalProcessor.exportAudio('original');
            } else {
                throw new Error('Invalid filter type or missing parameters');
            }

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
