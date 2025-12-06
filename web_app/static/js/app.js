/**
 * Main application - Ties everything together
 */

class DSPFilterApp {
    constructor() {
        this.originalWaveform = null;
        this.currentPlaybackTime = 0;
        this.isPlaying = false;
        this.audioContext = null;
        this.currentSource = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Setup audio context
            this.setupAudioContext();

            // Load audio info
            await filterDesigner.loadAudioInfo();

            // Get original waveform
            this.originalWaveform = await filterDesigner.getOriginalWaveform();

            // Setup event listeners
            this.setupEventListeners();

            // Draw initial waveform
            visualization.drawWaveform(
                'original-timeline-canvas',
                this.originalWaveform.time,
                this.originalWaveform.amplitude,
                '#00BCD4',
                'Original Signal'
            );

            // Draw spectrum for original signal
            visualization.drawSpectrum(
                'original-spectrum-canvas',
                this.originalWaveform.amplitude,
                filterDesigner.audioInfo.sampleRate,
                '#00BCD4',
                'original'
            );

            console.log('App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            alert('Error loading audio file. Please check the console.');
        }
    }

    /**
     * Setup Web Audio API
     */
    setupAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Band selection
        document.getElementById('lowcut').addEventListener('change', () => this.onBandChange());
        document.getElementById('highcut').addEventListener('change', () => this.onBandChange());

        // FIR controls
        document.getElementById('fir-taps').addEventListener('input', (e) => {
            document.getElementById('fir-taps-value').textContent = e.target.value;
        });
        document.getElementById('design-fir-btn').addEventListener('click', () => this.onDesignFIR());

        // IIR controls
        document.getElementById('iir-order').addEventListener('input', (e) => {
            document.getElementById('iir-order-value').textContent = e.target.value;
        });
        document.getElementById('design-iir-btn').addEventListener('click', () => this.onDesignIIR());

        // Playback controls
        document.getElementById('play-original').addEventListener('click', () => this.playAudio('original'));
        document.getElementById('play-fir').addEventListener('click', () => this.playAudio('fir'));
        document.getElementById('play-iir').addEventListener('click', () => this.playAudio('iir'));
        document.getElementById('stop-btn').addEventListener('click', () => this.stopAudio());

        // Timeline scrubber
        const scrubber = document.querySelector('.timeline-scrubber');
        scrubber.addEventListener('click', (e) => this.onScrubberClick(e));
        document.querySelector('.scrubber-handle').addEventListener('mousedown', () => this.onScrubberDragStart());

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Handle band frequency change
     */
    onBandChange() {
        // Can add validation or real-time updates here
        console.log('Band changed');
    }

    /**
     * Design FIR filter
     */
    async onDesignFIR() {
        try {
            const lowcut = document.getElementById('lowcut').value;
            const highcut = document.getElementById('highcut').value;
            const numtaps = document.getElementById('fir-taps').value;

            console.log('Designing FIR filter:', { lowcut, highcut, numtaps });

            // Show and initialize progress
            const progressBar = document.getElementById('fir-progress');
            const progressFill = progressBar.querySelector('.progress-fill');
            const statusText = document.getElementById('fir-status');
            
            progressBar.style.display = 'block';
            statusText.style.display = 'block';
            statusText.textContent = 'Designing FIR filter...';
            progressFill.style.width = '0%';
            
            // Start progress animation
            setTimeout(() => { progressFill.style.width = '30%'; }, 50);

            const result = await filterDesigner.designFIR(lowcut, highcut, numtaps);
            progressFill.style.width = '50%';
            statusText.textContent = 'Rendering coefficients...';

            // Draw coefficients
            visualization.drawCoefficients(
                'fir-coefficients-canvas',
                result.coefficients,
                'FIR Filter Coefficients'
            );
            progressFill.style.width = '60%';
            statusText.textContent = 'Rendering frequency response...';

            // Draw frequency response
            visualization.drawFrequencyResponse(
                'fir-frequency-canvas',
                result.frequencies,
                result.magnitude_db,
                'FIR Frequency Response'
            );
            progressFill.style.width = '70%';
            statusText.textContent = 'Applying filter...';

            // Update info
            const info = filterDesigner.getFIRInfo();
            document.getElementById('fir-info').innerHTML = `
                <h3>Filter Info</h3>
                <p><strong>Taps:</strong> ${info.taps}</p>
                <p><strong>Type:</strong> ${info.type}</p>
                <p><strong>RMS:</strong> ${info.rms}</p>
            `;

            // Apply filter
            await filterDesigner.applyFilters();
            progressFill.style.width = '85%';
            statusText.textContent = 'Rendering waveform...';

            // Draw filtered waveform
            if (filterDesigner.firFiltered) {
                visualization.drawWaveform(
                    'fir-timeline-canvas',
                    filterDesigner.firFiltered.time,
                    filterDesigner.firFiltered.amplitude,
                    '#4CAF50',
                    'FIR Filtered Signal'
                );

                // Draw spectrum for FIR filtered signal
                visualization.drawSpectrum(
                    'fir-spectrum-canvas',
                    filterDesigner.firFiltered.amplitude,
                    filterDesigner.audioInfo.sampleRate,
                    '#4CAF50',
                    'fir'
                );
            }

            // Trigger canvas resolution update and force layout recalculation
            window.dispatchEvent(new Event('canvasUpdateNeeded'));
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);

            // Enable playback button
            document.getElementById('play-fir').disabled = false;
            progressFill.style.width = '100%';
            statusText.textContent = 'FIR filter ready';

            // Hide progress after delay
            setTimeout(() => {
                progressBar.style.display = 'none';
                statusText.style.display = 'none';
            }, 800);

            console.log('FIR filter designed successfully');
        } catch (error) {
            console.error('Error designing FIR filter:', error);
            alert('Error designing FIR filter');
            document.getElementById('fir-progress').style.display = 'none';
            document.getElementById('fir-status').style.display = 'none';
        }
    }

    /**
     * Design IIR filter
     */
    async onDesignIIR() {
        try {
            const lowcut = document.getElementById('lowcut').value;
            const highcut = document.getElementById('highcut').value;
            const order = document.getElementById('iir-order').value;

            console.log('Designing IIR filter:', { lowcut, highcut, order });

            // Show and initialize progress
            const progressBar = document.getElementById('iir-progress');
            const progressFill = progressBar.querySelector('.progress-fill');
            const statusText = document.getElementById('iir-status');
            
            progressBar.style.display = 'block';
            statusText.style.display = 'block';
            statusText.textContent = 'Designing IIR filter...';
            progressFill.style.width = '0%';
            
            // Start progress animation
            setTimeout(() => { progressFill.style.width = '30%'; }, 50);

            const result = await filterDesigner.designIIR(lowcut, highcut, order);
            progressFill.style.width = '50%';
            statusText.textContent = 'Rendering coefficients...';

            // Draw coefficients
            visualization.drawCoefficients(
                'iir-b-coefficients-canvas',
                result.b,
                'IIR Numerator Coefficients'
            );

            visualization.drawCoefficients(
                'iir-a-coefficients-canvas',
                result.a,
                'IIR Denominator Coefficients'
            );
            progressFill.style.width = '60%';
            statusText.textContent = 'Rendering frequency response...';

            // Draw frequency response
            visualization.drawFrequencyResponse(
                'iir-frequency-canvas',
                result.frequencies,
                result.magnitude_db,
                'IIR Frequency Response'
            );
            progressFill.style.width = '70%';
            statusText.textContent = 'Applying filter...';

            // Update info
            const info = filterDesigner.getIIRInfo();
            document.getElementById('iir-info').innerHTML = `
                <h3>Filter Info</h3>
                <p><strong>Order:</strong> ${info.order}</p>
                <p><strong>Type:</strong> ${info.type}</p>
                <p><strong>B Coefficients:</strong> ${info.numB}</p>
                <p><strong>A Coefficients:</strong> ${info.numA}</p>
            `;

            // Apply filter
            await filterDesigner.applyFilters();
            progressFill.style.width = '85%';
            statusText.textContent = 'Rendering waveform...';

            // Draw filtered waveform
            if (filterDesigner.iirFiltered) {
                visualization.drawWaveform(
                    'iir-timeline-canvas',
                    filterDesigner.iirFiltered.time,
                    filterDesigner.iirFiltered.amplitude,
                    '#FF9800',
                    'IIR Filtered Signal'
                );

                // Draw spectrum for IIR filtered signal
                visualization.drawSpectrum(
                    'iir-spectrum-canvas',
                    filterDesigner.iirFiltered.amplitude,
                    filterDesigner.audioInfo.sampleRate,
                    '#FF9800',
                    'iir'
                );
            }

            // Trigger canvas resolution update and force layout recalculation
            window.dispatchEvent(new Event('canvasUpdateNeeded'));
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);

            // Enable playback button
            document.getElementById('play-iir').disabled = false;
            progressFill.style.width = '100%';
            statusText.textContent = 'IIR filter ready';

            // Hide progress after delay
            setTimeout(() => {
                progressBar.style.display = 'none';
                statusText.style.display = 'none';
            }, 800);

            console.log('IIR filter designed successfully');
        } catch (error) {
            console.error('Error designing IIR filter:', error);
            alert('Error designing IIR filter');
            document.getElementById('iir-progress').style.display = 'none';
            document.getElementById('iir-status').style.display = 'none';
        }
    }

    /**
     * Play audio
     */
    async playAudio(type) {
        try {
            if (this.isPlaying) {
                this.stopAudio();
            }

            // Get audio blob
            let coefficients = null;
            let b = null;
            let a = null;

            if (type === 'fir') {
                coefficients = filterDesigner.firCoefficients;
            } else if (type === 'iir') {
                b = filterDesigner.iirB;
                a = filterDesigner.iirA;
            }

            const blob = await filterDesigner.exportAudio(type);

            // Create audio element and play
            const url = URL.createObjectURL(blob);
            const audio = document.getElementById('audio-player');
            audio.src = url;
            audio.play();

            this.isPlaying = true;

            audio.onended = () => {
                this.isPlaying = false;
            };

            console.log(`Playing ${type} audio`);
        } catch (error) {
            console.error('Error playing audio:', error);
            alert('Error playing audio');
        }
    }

    /**
     * Stop audio playback
     */
    stopAudio() {
        const audio = document.getElementById('audio-player');
        audio.pause();
        audio.currentTime = 0;
        this.isPlaying = false;
    }

    /**
     * Handle scrubber click
     */
    onScrubberClick(e) {
        const scrubber = e.currentTarget;
        const rect = scrubber.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        this.updateScrubber(percentage);
    }

    /**
     * Handle scrubber drag
     */
    onScrubberDragStart() {
        const handleMouseMove = (e) => {
            const scrubber = document.querySelector('.timeline-scrubber');
            const rect = scrubber.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.updateScrubber(percentage);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    /**
     * Update scrubber position
     */
    updateScrubber(percentage) {
        const track = document.querySelector('.scrubber-track');
        const handle = document.querySelector('.scrubber-handle');

        track.style.width = (percentage * 100) + '%';
        handle.style.left = (percentage * 100) + '%';

        // Update time display
        const totalTime = filterDesigner.audioInfo.duration;
        const currentTime = percentage * totalTime;

        document.getElementById('time-current').textContent = Utils.formatTime(currentTime);
        document.getElementById('time-total').textContent = Utils.formatTime(totalTime);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        // Resize all canvases
        document.querySelectorAll('canvas').forEach(canvas => {
            const id = canvas.id;
            if (id) {
                visualization.setCanvasResolution(id);
            }
        });

        // Redraw visualizations
        this.redrawAllVisualizations();
    }

    /**
     * Redraw all visualizations
     */
    redrawAllVisualizations() {
        if (this.originalWaveform) {
            visualization.drawWaveform(
                'original-timeline-canvas',
                this.originalWaveform.time,
                this.originalWaveform.amplitude,
                '#00BCD4',
                'Original Signal'
            );
        }

        if (filterDesigner.firCoefficients) {
            visualization.drawCoefficients(
                'fir-coefficients-canvas',
                filterDesigner.firCoefficients,
                'FIR Filter Coefficients'
            );

            visualization.drawFrequencyResponse(
                'fir-frequency-canvas',
                filterDesigner.firFrequencies,
                filterDesigner.firMagnitude,
                'FIR Frequency Response'
            );

            if (filterDesigner.firFiltered) {
                visualization.drawWaveform(
                    'fir-timeline-canvas',
                    filterDesigner.firFiltered.time,
                    filterDesigner.firFiltered.amplitude,
                    '#4CAF50',
                    'FIR Filtered Signal'
                );
            }
        }

        if (filterDesigner.iirB) {
            visualization.drawCoefficients(
                'iir-b-coefficients-canvas',
                filterDesigner.iirB,
                'IIR Numerator Coefficients'
            );

            visualization.drawCoefficients(
                'iir-a-coefficients-canvas',
                filterDesigner.iirA,
                'IIR Denominator Coefficients'
            );

            visualization.drawFrequencyResponse(
                'iir-frequency-canvas',
                filterDesigner.iirFrequencies,
                filterDesigner.iirMagnitude,
                'IIR Frequency Response'
            );

            if (filterDesigner.iirFiltered) {
                visualization.drawWaveform(
                    'iir-timeline-canvas',
                    filterDesigner.iirFiltered.time,
                    filterDesigner.iirFiltered.amplitude,
                    '#FF9800',
                    'IIR Filtered Signal'
                );
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DSPFilterApp();
});
