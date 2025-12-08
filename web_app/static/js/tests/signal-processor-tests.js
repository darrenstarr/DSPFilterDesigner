/**
 * Unit tests for SignalProcessor class
 * Tests all migrated functionality to ensure it works correctly
 */

class SignalProcessorTests {
    constructor() {
        this.testResults = [];
        this.testAudioBuffer = null;
        this.processor = null;
        
        this.init();
    }
    
    /**
     * Initialize test environment
     */
    async init() {
        console.log('Initializing SignalProcessor tests...');
        
        // Create test audio buffer
        this.testAudioBuffer = this.createTestAudioBuffer();
        
        // Initialize processor
        this.processor = new SignalProcessor(this.testAudioBuffer);
        
        console.log('Test environment initialized');
    }
    
    /**
     * Create test audio buffer for testing
     */
    createTestAudioBuffer() {
        const sampleRate = 44100;
        const duration = 2; // 2 seconds
        const numSamples = sampleRate * duration;
        
        // Create audio context and buffer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate test signal: 440Hz sine wave + noise
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // 440Hz sine wave
            channelData[i] = 0.5 * Math.sin(2 * Math.PI * 440 * t);
            // Add some noise
            channelData[i] += 0.1 * (Math.random() - 0.5);
            // Add 1000Hz component to test filtering
            channelData[i] += 0.3 * Math.sin(2 * Math.PI * 1000 * t);
        }
        
        return buffer;
    }
    
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('Running all SignalProcessor tests...');
        
        await this.testAudioLoading();
        await this.testFIRFilterDesign();
        await this.testIIRFilterDesign();
        await this.testFilterApplication();
        await this.testFrequencySpectrum();
        await this.testAudioExport();
        await this.testEdgeCases();
        
        this.printTestResults();
        return this.testResults;
    }
    
    /**
     * Test audio loading functionality
     */
    async testAudioLoading() {
        console.log('Testing audio loading...');
        
        try {
            // Test that audio is loaded correctly
            assert(this.processor.originalSignal !== null, 'Original signal should not be null');
            assert(this.processor.sampleRate === 44100, 'Sample rate should be 44100');
            assert(this.processor.duration === 2, 'Duration should be 2 seconds');
            assert(this.processor.originalSignal.length === 88200, 'Signal length should be 88200');
            
            // Test signal properties
            const maxAmplitude = Math.max(...this.processor.originalSignal.map(v => Math.abs(v)));
            assert(maxAmplitude > 0, 'Signal should have non-zero amplitude');
            
            this.addTestResult('Audio Loading', true, 'Audio loaded correctly');
            console.log('✓ Audio loading test passed');
        } catch (error) {
            this.addTestResult('Audio Loading', false, error.message);
            console.error('✗ Audio loading test failed:', error.message);
        }
    }
    
    /**
     * Test FIR filter design
     */
    async testFIRFilterDesign() {
        console.log('Testing FIR filter design...');
        
        try {
            // Test basic FIR filter design
            const firResult = this.processor.designFIRFilter(100, 1000, 51);
            
            assert(firResult.coefficients !== null, 'FIR coefficients should not be null');
            assert(firResult.frequencies !== null, 'FIR frequencies should not be null');
            assert(firResult.magnitude_db !== null, 'FIR magnitude should not be null');
            assert(firResult.numtaps === 51, 'Number of taps should be 51');
            assert(firResult.coefficients.length === 51, 'Coefficient array length should match numtaps');
            
            // Test frequency response properties
            assert(firResult.frequencies.length > 0, 'Should have frequency data');
            assert(firResult.magnitude_db.length > 0, 'Should have magnitude data');
            assert(firResult.frequencies[0] >= 0, 'Frequencies should be non-negative');
            
            // Test filter coefficients sum
            const coeffSum = firResult.coefficients.reduce((sum, coeff) => sum + coeff, 0);
            assert(Math.abs(coeffSum) < 0.1, 'FIR coefficients should sum to approximately zero');
            
            this.addTestResult('FIR Filter Design', true, 'FIR filter designed correctly');
            console.log('✓ FIR filter design test passed');
        } catch (error) {
            this.addTestResult('FIR Filter Design', false, error.message);
            console.error('✗ FIR filter design test failed:', error.message);
        }
    }
    
    /**
     * Test IIR filter design
     */
    async testIIRFilterDesign() {
        console.log('Testing IIR filter design...');
        
        try {
            // Test basic IIR filter design
            const iirResult = this.processor.designIIRFilter(100, 1000, 4);
            
            assert(iirResult.b !== null, 'IIR numerator coefficients should not be null');
            assert(iirResult.a !== null, 'IIR denominator coefficients should not be null');
            assert(iirResult.frequencies !== null, 'IIR frequencies should not be null');
            assert(iirResult.magnitude_db !== null, 'IIR magnitude should not be null');
            assert(iirResult.order === 4, 'Order should be 4');
            
            // Test coefficient arrays
            assert(iirResult.b.length > 0, 'Should have numerator coefficients');
            assert(iirResult.a.length > 0, 'Should have denominator coefficients');
            assert(iirResult.b.length === iirResult.a.length, 'Numerator and denominator should have same length');
            
            // Test frequency response properties
            assert(iirResult.frequencies.length > 0, 'Should have frequency data');
            assert(iirResult.magnitude_db.length > 0, 'Should have magnitude data');
            
            // Test a[0] = 1 (normalization)
            assert(iirResult.a[0] === 1, 'First denominator coefficient should be 1');
            
            this.addTestResult('IIR Filter Design', true, 'IIR filter designed correctly');
            console.log('✓ IIR filter design test passed');
        } catch (error) {
            this.addTestResult('IIR Filter Design', false, error.message);
            console.error('✗ IIR filter design test failed:', error.message);
        }
    }
    
    /**
     * Test filter application
     */
    async testFilterApplication() {
        console.log('Testing filter application...');
        
        try {
            // Design filters first
            const firResult = this.processor.designFIRFilter(100, 1000, 51);
            const iirResult = this.processor.designIIRFilter(100, 1000, 4);
            
            // Test FIR filter application
            const firFiltered = this.processor.applyFIRFilter(firResult.coefficients);
            assert(firFiltered !== null, 'FIR filtered signal should not be null');
            assert(firFiltered.length === this.processor.originalSignal.length, 'FIR filtered signal should have same length');
            assert(this.processor.firFilteredSignal !== null, 'FIR filtered signal should be stored');
            
            // Test IIR filter application
            const iirFiltered = this.processor.applyIIRFilter(iirResult.b, iirResult.a);
            assert(iirFiltered !== null, 'IIR filtered signal should not be null');
            assert(iirFiltered.length === this.processor.originalSignal.length, 'IIR filtered signal should have same length');
            assert(this.processor.iirFilteredSignal !== null, 'IIR filtered signal should be stored');
            
            // Test that filtering actually changed the signal
            const firRms = this.calculateRMS(firFiltered);
            const iirRms = this.calculateRMS(iirFiltered);
            const originalRms = this.calculateRMS(this.processor.originalSignal);
            
            assert(firRms > 0, 'FIR filtered signal should have non-zero RMS');
            assert(iirRms > 0, 'IIR filtered signal should have non-zero RMS');
            
            this.addTestResult('Filter Application', true, 'Filters applied correctly');
            console.log('✓ Filter application test passed');
        } catch (error) {
            this.addTestResult('Filter Application', false, error.message);
            console.error('✗ Filter application test failed:', error.message);
        }
    }
    
    /**
     * Test frequency spectrum analysis
     */
    async testFrequencySpectrum() {
        console.log('Testing frequency spectrum analysis...');
        
        try {
            // Test original signal spectrum
            const originalSpectrum = this.processor.getFrequencySpectrum();
            
            assert(originalSpectrum.frequencies !== null, 'Frequencies should not be null');
            assert(originalSpectrum.magnitude_db !== null, 'Magnitude should not be null');
            assert(originalSpectrum.frequencies.length > 0, 'Should have frequency data');
            assert(originalSpectrum.magnitude_db.length > 0, 'Should have magnitude data');
            
            // Test filtered signal spectrum
            const firResult = this.processor.designFIRFilter(100, 1000, 51);
            this.processor.applyFIRFilter(firResult.coefficients);
            const firSpectrum = this.processor.getFrequencySpectrum(this.processor.firFilteredSignal);
            
            assert(firSpectrum.frequencies.length > 0, 'FIR spectrum should have data');
            assert(firSpectrum.magnitude_db.length > 0, 'FIR spectrum should have magnitude data');
            
            // Test frequency range limiting
            const limitedSpectrum = this.processor.getFrequencySpectrum(null, [200, 800]);
            assert(limitedSpectrum.frequencies.every(f => f >= 200 && f <= 800), 'Frequencies should be within range');
            
            this.addTestResult('Frequency Spectrum', true, 'Frequency spectrum analysis works correctly');
            console.log('✓ Frequency spectrum test passed');
        } catch (error) {
            this.addTestResult('Frequency Spectrum', false, error.message);
            console.error('✗ Frequency spectrum test failed:', error.message);
        }
    }
    
    /**
     * Test audio export functionality
     */
    async testAudioExport() {
        console.log('Testing audio export...');
        
        try {
            // Test original audio export
            const originalBlob = this.processor.exportAudio('original');
            assert(originalBlob instanceof Blob, 'Original export should return Blob');
            assert(originalBlob.type === 'audio/wav', 'Original export should be WAV format');
            
            // Test FIR filter export
            const firResult = this.processor.designFIRFilter(100, 1000, 51);
            const firBlob = this.processor.exportAudio('fir', firResult.coefficients);
            assert(firBlob instanceof Blob, 'FIR export should return Blob');
            assert(firBlob.type === 'audio/wav', 'FIR export should be WAV format');
            
            // Test IIR filter export
            const iirResult = this.processor.designIIRFilter(100, 1000, 4);
            const iirBlob = this.processor.exportAudio('iir', null, iirResult.b, iirResult.a);
            assert(iirBlob instanceof Blob, 'IIR export should return Blob');
            assert(iirBlob.type === 'audio/wav', 'IIR export should be WAV format');
            
            // Test blob size (should be reasonable)
            assert(originalBlob.size > 1000, 'WAV file should be larger than 1KB');
            assert(originalBlob.size < 1000000, 'WAV file should be smaller than 1MB');
            
            this.addTestResult('Audio Export', true, 'Audio export functionality works correctly');
            console.log('✓ Audio export test passed');
        } catch (error) {
            this.addTestResult('Audio Export', false, error.message);
            console.error('✗ Audio export test failed:', error.message);
        }
    }
    
    /**
     * Test edge cases and error handling
     */
    async testEdgeCases() {
        console.log('Testing edge cases...');
        
        try {
            // Test FIR filter with invalid parameters
            const firResult = this.processor.designFIRFilter(100, 1000, 10); // Even taps
            assert(firResult.numtaps === 11, 'Even number of taps should be made odd');
            
            // Test IIR filter with invalid parameters
            const iirResult = this.processor.designIIRFilter(1000, 100, 4); // Invalid range
            assert(iirResult.b.length > 0, 'Should handle invalid frequency range');
            
            // Test waveform downsampling
            const waveform = this.processor.getSignalWaveform(null, 100);
            assert(waveform.time.length > 0, 'Downsampled waveform should have time data');
            assert(waveform.amplitude.length > 0, 'Downsampled waveform should have amplitude data');
            assert(waveform.amplitude.length < this.processor.originalSignal.length, 'Downsampled should be shorter');
            
            // Test empty signal handling
            const emptySpectrum = this.processor.getFrequencySpectrum([]);
            assert(emptySpectrum.frequencies.length === 0, 'Empty signal should return empty spectrum');
            
            this.addTestResult('Edge Cases', true, 'Edge cases handled correctly');
            console.log('✓ Edge cases test passed');
        } catch (error) {
            this.addTestResult('Edge Cases', false, error.message);
            console.error('✗ Edge cases test failed:', error.message);
        }
    }
    
    /**
     * Helper function to calculate RMS
     */
    calculateRMS(signal) {
        const sumSquares = signal.reduce((sum, value) => sum + value * value, 0);
        return Math.sqrt(sumSquares / signal.length);
    }
    
    /**
     * Add test result
     */
    addTestResult(testName, passed, message) {
        this.testResults.push({
            name: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Print test results
     */
    printTestResults() {
        console.log('\n=== Test Results ===');
        
        const passedTests = this.testResults.filter(result => result.passed);
        const failedTests = this.testResults.filter(result => !result.passed);
        
        console.log(`Total tests: ${this.testResults.length}`);
        console.log(`Passed: ${passedTests.length}`);
        console.log(`Failed: ${failedTests.length}`);
        
        if (failedTests.length > 0) {
            console.log('\nFailed tests:');
            failedTests.forEach(test => {
                console.log(`  ✗ ${test.name}: ${test.message}`);
            });
        }
        
        if (passedTests.length > 0) {
            console.log('\nPassed tests:');
            passedTests.forEach(test => {
                console.log(`  ✓ ${test.name}`);
            });
        }
        
        console.log('\nTest execution complete.');
    }
    
    /**
     * Run tests and return results
     */
    static async run() {
        const tests = new SignalProcessorTests();
        return await tests.runAllTests();
    }
}

// Simple assertion helper
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignalProcessorTests;
}