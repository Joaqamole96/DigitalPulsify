// Pulse Code Converter Application

// DOM Elements
const inputString = document.getElementById('inputString');
const pulseType = document.getElementById('pulseType');
const convertBtn = document.getElementById('convertBtn');
const codeTabs = document.getElementById('codeTabs');
const pulseGrid = document.getElementById('pulseGrid');
const currentCodeName = document.getElementById('currentCodeName');
const bitCount = document.getElementById('bitCount');
const pulseDescription = document.getElementById('pulseDescription');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

// Pulse code descriptions
const codeDescriptions = {
    NRZ: "NRZ encoding: High level (+5V) represents '1', low level (-5V) represents '0'. No return to zero between consecutive bits.",
    RZ: "RZ encoding: High pulse (+5V) in first half represents '1', low pulse (-5V) in first half represents '0'. Always returns to zero in second half.",
    Manchester: "Manchester encoding: Transition from high to low represents '1', transition from low to high represents '0'. Each bit has a transition in the middle.",
    AMI: "Binary AMI encoding: '0' is represented by zero voltage. '1' is represented by alternating positive (+5V) and negative (-5V) pulses.",
    CMI: "CMI encoding: '0' is represented by a high level in first half and low in second half. '1' alternates between all high and all low."
};

// Pulse code full names
const codeNames = {
    NRZ: "Non-Return to Zero (NRZ) Encoding",
    RZ: "Return to Zero (RZ) Encoding",
    Manchester: "Manchester Encoding",
    AMI: "Binary AMI Encoding",
    CMI: "Coded Mark Inversion (CMI) Encoding"
};

// Initialize with default conversion
document.addEventListener('DOMContentLoaded', function() {
    convertToPulseCode();
    
    // Add event listeners
    convertBtn.addEventListener('click', convertToPulseCode);
    
    // Tab click events
    codeTabs.addEventListener('click', function(e) {
        if (e.target.classList.contains('code-tab')) {
            // Update active tab
            document.querySelectorAll('.code-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update pulse type dropdown
            pulseType.value = e.target.dataset.code;
            
            // Convert with new pulse type
            convertToPulseCode();
        }
    });
    
    // Pulse type dropdown change event
    pulseType.addEventListener('change', function() {
        // Update active tab
        document.querySelectorAll('.code-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.code === pulseType.value) {
                tab.classList.add('active');
            }
        });
        
        // Convert with new pulse type
        convertToPulseCode();
    });
    
    // Add keyboard shortcut (Ctrl+Enter to convert)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            convertToPulseCode();
        }
    });
});

// Main conversion function
function convertToPulseCode() {
    const text = inputString.value || "Hello";
    const codeType = pulseType.value;
    
    // Update UI
    currentCodeName.textContent = codeNames[codeType];
    pulseDescription.textContent = codeDescriptions[codeType];
    
    // Convert string to character array
    const charArray = text.split('');
    step1.textContent = `"${text}" → [${charArray.map(c => `'${c}'`).join(', ')}]`;
    
    // Convert character array to ASCII array
    const asciiArray = charArray.map(char => char.charCodeAt(0));
    step2.textContent = asciiArray.map((ascii, i) => `'${charArray[i]}' → ${ascii}`).join(', ');
    
    // Convert ASCII array to binary array
    const binaryArray = asciiArray.map(ascii => {
        let binary = ascii.toString(2);
        // Pad to 8 bits
        while (binary.length < 8) binary = '0' + binary;
        return binary;
    });
    step3.textContent = binaryArray.map((binary, i) => `${asciiArray[i]} → ${binary}`).join(', ');
    
    // Update bit count
    const totalBits = binaryArray.join('').length;
    const charCount = charArray.length;
    bitCount.textContent = `${charCount} character${charCount !== 1 ? 's' : ''} × 8 bits = ${totalBits} bits`;
    
    // Generate pulse code visualization
    generatePulseVisualization(binaryArray, codeType);
    
    // Update step 4 description
    step4.textContent = `Applying ${codeNames[codeType].split(' ')[0]} encoding to the binary sequence`;
}

// Generate pulse visualization
function generatePulseVisualization(binaryArray, codeType) {
    // Clear previous visualization
    pulseGrid.innerHTML = '';
    
    // Combine all binary strings
    const binaryString = binaryArray.join('');
    
    // State variables for encodings that need memory
    let amiLastPolarity = 1; // 1 for positive, -1 for negative
    let cmiLastOne = 1; // 1 for high-high, -1 for low-low
    
    // Create visualization for each bit
    for (let i = 0; i < binaryString.length; i++) {
        const bit = binaryString[i];
        const bitContainer = createBitContainer(i, bit, binaryArray);
        
        // Create 2x2 box for the bit
        const bitBox = createBitBox(i);
        
        bitContainer.appendChild(bitBox);
        pulseGrid.appendChild(bitContainer);
        
        // Draw the pulse lines based on encoding type
        drawPulseLines(i, bit, codeType, amiLastPolarity, cmiLastOne);
        
        // Update state for encodings that need it
        if (codeType === 'AMI' && bit === '1') {
            amiLastPolarity *= -1; // Alternate polarity
        }
        
        if (codeType === 'CMI' && bit === '1') {
            cmiLastOne *= -1; // Alternate for consecutive 1s
        }
    }
}

// Create bit container with label
function createBitContainer(index, bit, binaryArray) {
    const bitContainer = document.createElement('div');
    bitContainer.className = 'bit-container';
    
    // Bit label showing position and value
    const bitLabel = document.createElement('div');
    bitLabel.className = 'bit-label';
    
    // Show character index for first bit of each character
    const charIndex = Math.floor(index / 8);
    const bitInChar = index % 8;
    const char = String.fromCharCode(parseInt(binaryArray[charIndex], 2));
    
    if (bitInChar === 0) {
        bitLabel.innerHTML = `<span>Char ${charIndex+1}: '${char}'</span><span>Bit ${bitInChar+1} (${bit})</span>`;
    } else {
        bitLabel.innerHTML = `<span>Bit ${bitInChar+1} (${bit})</span>`;
    }
    
    bitContainer.appendChild(bitLabel);
    return bitContainer;
}

// Create 2x2 bit box
function createBitBox(index) {
    const bitBox = document.createElement('div');
    bitBox.className = 'bit-box';
    bitBox.id = `bit-${index}`;
    
    // Create the four cells of the 2x2 grid
    for (let cell = 0; cell < 4; cell++) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'bit-cell';
        cellDiv.id = `bit-${index}-cell-${cell}`;
        bitBox.appendChild(cellDiv);
    }
    
    return bitBox;
}

// Draw pulse lines for a specific bit
function drawPulseLines(bitIndex, bitValue, encoding, amiLastPolarity, cmiLastOne) {
    const bitBox = document.getElementById(`bit-${bitIndex}`);
    
    // Clear any existing lines
    const existingLines = bitBox.querySelectorAll('.pulse-segment');
    existingLines.forEach(line => line.remove());
    
    // Draw reference lines
    drawReferenceLines(bitBox);
    
    // Draw the actual pulse based on encoding type
    switch(encoding) {
        case 'NRZ':
            drawNRZ(bitBox, bitValue);
            break;
        case 'RZ':
            drawRZ(bitBox, bitValue);
            break;
        case 'Manchester':
            drawManchester(bitBox, bitValue);
            break;
        case 'AMI':
            drawAMI(bitBox, bitValue, amiLastPolarity);
            break;
        case 'CMI':
            drawCMI(bitBox, bitValue, cmiLastOne);
            break;
    }
}

// Draw reference lines (grid)
function drawReferenceLines(bitBox) {
    // Draw horizontal reference lines (top, middle, bottom)
    const horizontalPositions = ['25%', '50%', '75%'];
    horizontalPositions.forEach(pos => {
        const line = document.createElement('div');
        line.className = `voltage-line ${pos === '25%' ? 'top-line' : pos === '50%' ? 'middle-line' : 'bottom-line'}`;
        line.style.top = pos;
        bitBox.appendChild(line);
    });
    
    // Draw vertical reference lines (left, center, right)
    const verticalPositions = ['25%', '50%', '75%'];
    verticalPositions.forEach(pos => {
        const line = document.createElement('div');
        line.className = `vertical-line ${pos === '25%' ? 'left-line' : pos === '50%' ? 'center-line' : 'right-line'}`;
        line.style.left = pos;
        bitBox.appendChild(line);
    });
}

// Helper function to create a horizontal pulse segment
function createHorizontalPulse(bitBox, leftPercent, rightPercent, voltageLevel) {
    const pulse = document.createElement('div');
    pulse.className = 'pulse-segment horizontal-pulse';
    pulse.style.left = `${leftPercent}%`;
    pulse.style.right = `${100 - rightPercent}%`;
    
    // Set vertical position and color based on voltage
    if (voltageLevel === 1) {
        pulse.style.top = '25%'; // +5V
        pulse.style.backgroundColor = '#10b981'; // Green for high
    } else if (voltageLevel === 0) {
        pulse.style.top = '50%'; // 0V
        pulse.style.backgroundColor = '#f59e0b'; // Amber for zero
    } else if (voltageLevel === -1) {
        pulse.style.top = '75%'; // -5V
        pulse.style.backgroundColor = '#ef4444'; // Red for low
    }
    
    bitBox.appendChild(pulse);
    return pulse;
}

// Helper function to create a vertical pulse segment
function createVerticalPulse(bitBox, topPercent, bottomPercent, horizontalPosition) {
    const pulse = document.createElement('div');
    pulse.className = 'pulse-segment vertical-pulse';
    pulse.style.top = `${topPercent}%`;
    pulse.style.bottom = `${100 - bottomPercent}%`;
    
    // Set horizontal position
    if (horizontalPosition === 'left') {
        pulse.style.left = '25%';
    } else if (horizontalPosition === 'center') {
        pulse.style.left = '50%';
    } else if (horizontalPosition === 'right') {
        pulse.style.left = '75%';
    }
    
    pulse.style.backgroundColor = '#8b5cf6'; // Purple for vertical segments
    
    bitBox.appendChild(pulse);
    return pulse;
}

// NRZ encoding: high for 1, low for 0, constant throughout bit
function drawNRZ(bitBox, bit) {
    const voltage = bit === '1' ? 1 : -1;
    createHorizontalPulse(bitBox, 0, 100, voltage);
}

// RZ encoding: pulse in first half, zero in second half
function drawRZ(bitBox, bit) {
    const voltage = bit === '1' ? 1 : -1;
    createHorizontalPulse(bitBox, 0, 50, voltage); // First half
    createHorizontalPulse(bitBox, 50, 100, 0); // Second half (zero)
    
    // Vertical line at the center
    createVerticalPulse(bitBox, 0, 100, 'center');
}

// Manchester encoding: transition in the middle
function drawManchester(bitBox, bit) {
    if (bit === '1') {
        // High to low transition
        createHorizontalPulse(bitBox, 0, 50, 1); // First half high
        createHorizontalPulse(bitBox, 50, 100, -1); // Second half low
    } else {
        // Low to high transition
        createHorizontalPulse(bitBox, 0, 50, -1); // First half low
        createHorizontalPulse(bitBox, 50, 100, 1); // Second half high
    }
    
    // Vertical line at the center
    createVerticalPulse(bitBox, 0, 100, 'center');
}

// AMI encoding: alternating polarity for 1s, zero for 0s
function drawAMI(bitBox, bit, lastPolarity) {
    if (bit === '1') {
        // Use the current polarity
        createHorizontalPulse(bitBox, 0, 100, lastPolarity);
    } else {
        // Zero for 0 bits
        createHorizontalPulse(bitBox, 0, 100, 0);
    }
}

// CMI encoding
function drawCMI(bitBox, bit, lastOne) {
    if (bit === '1') {
        // For 1: alternate between all high and all low
        createHorizontalPulse(bitBox, 0, 100, lastOne);
    } else {
        // For 0: high in first half, low in second half
        createHorizontalPulse(bitBox, 0, 50, 1); // First half high
        createHorizontalPulse(bitBox, 50, 100, -1); // Second half low
        
        // Vertical line at the center
        createVerticalPulse(bitBox, 0, 100, 'center');
    }
}

// Add animation to pulse visualization
function animatePulseVisualization() {
    const pulseSegments = document.querySelectorAll('.pulse-segment');
    
    pulseSegments.forEach(segment => {
        // Reset animation
        segment.style.animation = 'none';
        
        // Trigger reflow to restart animation
        void segment.offsetWidth;
        
        // Add animation
        segment.style.animation = 'pulseAnimation 0.5s ease-in-out';
    });
}

// Add CSS animation for pulse effect
const style = document.createElement('style');
style.textContent = `
@keyframes pulseAnimation {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}
`;
document.head.appendChild(style);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertToPulseCode,
        generatePulseVisualization,
        drawNRZ,
        drawRZ,
        drawManchester,
        drawAMI,
        drawCMI
    };
}