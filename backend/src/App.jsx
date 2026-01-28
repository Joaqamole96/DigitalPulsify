import { useState, useEffect } from 'react';
import './App.css';

// Reusable BitBox Component
const BitBox = ({ bitIndex, bitValue, encoding, amiPolarity, cmiState }) => {
  const drawPulse = (type, value, polarity, state) => {
    const pulses = [];
    
    // Helper to create pulse elements
    const createHorizontal = (left, right, voltage, key) => {
      const colors = { 1: '#10b981', 0: '#f59e0b', '-1': '#ef4444' };
      const positions = { 1: '25%', 0: '50%', '-1': '75%' };
      
      return (
        <div
          key={key}
          className="pulse-segment horizontal-pulse"
          style={{
            left: `${left}%`,
            right: `${100 - right}%`,
            top: positions[voltage],
            backgroundColor: colors[voltage]
          }}
        />
      );
    };
    
    const createVertical = (top, bottom, position, key) => (
      <div
        key={key}
        className="pulse-segment vertical-pulse"
        style={{
          top: `${top}%`,
          bottom: `${100 - bottom}%`,
          left: position === 'center' ? '50%' : position === 'left' ? '25%' : '75%',
          backgroundColor: '#8b5cf6'
        }}
      />
    );
    
    // Encoding logic
    switch(type) {
      case 'NRZ':
        pulses.push(createHorizontal(0, 100, value === '0' ? 1 : -1, 'h1'));
        break;
        
      case 'RZ':
        pulses.push(createHorizontal(0, 50, value === '0' ? 1 : -1, 'h1'));
        pulses.push(createHorizontal(50, 100, 0, 'h2'));
        // Instead of 0 and 10, use the height of previous bar and next bar
        pulses.push(createVertical(0, 100, 'center', 'v1'));
        break;
        
      case 'Manchester':
        if (value === '1') {
          pulses.push(createHorizontal(0, 50, 1, 'h1'));
          pulses.push(createHorizontal(50, 100, -1, 'h2'));
        } else {
          pulses.push(createHorizontal(0, 50, -1, 'h1'));
          pulses.push(createHorizontal(50, 100, 1, 'h2'));
        }
        pulses.push(createVertical(0, 100, 'center', 'v1'));
        break;
        
      case 'AMI':
        pulses.push(createHorizontal(0, 100, value === '1' ? polarity : 0, 'h1'));
        break;
        
      case 'CMI':
        if (value === '1') {
          pulses.push(createHorizontal(0, 100, state, 'h1'));
        } else {
          pulses.push(createHorizontal(0, 50, 0, 'h1'));
          pulses.push(createHorizontal(50, 100, 1, 'h2'));
          pulses.push(createVertical(0, 100, 'center', 'v1'));
        }
        break;
        
      default:
        break;
    }
    
    return pulses;
  };
  
  return (
    <div className="bit-container">
      <div className="bit-box" id={`bit-${bitIndex}`}>
        {/* Reference grid lines */}
        <div className="voltage-line top-line" style={{ top: '25%' }} />
        <div className="voltage-line middle-line" style={{ top: '50%' }} />
        <div className="voltage-line bottom-line" style={{ top: '75%' }} />
        <div className="vertical-line left-line" style={{ left: '25%' }} />
        <div className="vertical-line center-line" style={{ left: '50%' }} />
        <div className="vertical-line right-line" style={{ left: '75%' }} />
        
        {/* Bit cells */}
        {[0, 1, 2, 3].map(cell => (
          <div key={cell} className="bit-cell" />
        ))}
        
        {/* Pulse visualization */}
        {drawPulse(encoding, bitValue, amiPolarity, cmiState)}
      </div>
      <div className="bit-label">
        <span>Bit {(bitIndex % 8) + 1}</span>
        <span>({bitValue})</span>
      </div>
    </div>
  );
};

// Character Group Component
const CharacterGroup = ({ char, charIndex, binaryString, encoding, amiStartPolarity, cmiStartState }) => {
  let amiPolarity = amiStartPolarity;
  let cmiState = cmiStartState;
  
  const bits = binaryString.split('').map((bit, bitIndex) => {
    const globalIndex = charIndex * 8 + bitIndex;
    const currentAmiPolarity = amiPolarity;
    const currentCmiState = cmiState;
    
    // Update state for next iteration
    if (encoding === 'AMI' && bit === '1') {
      amiPolarity *= -1;
    }
    if (encoding === 'CMI' && bit === '1') {
      cmiState *= -1;
      cmiState += 1;
    }
    
    return {
      bit,
      globalIndex,
      amiPolarity: currentAmiPolarity,
      cmiState: currentCmiState
    };
  });
  
  return (
    <div className="char-group" data-char={`Char ${charIndex + 1}: '${char}'`}>
      <div className="bits-row">
        {bits.map(({ bit, globalIndex, amiPolarity, cmiState }) => (
          <BitBox
            key={globalIndex}
            bitIndex={globalIndex}
            bitValue={bit}
            encoding={encoding}
            amiPolarity={amiPolarity}
            cmiState={cmiState}
          />
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [inputText, setInputText] = useState('Hello');
  const [encoding, setEncoding] = useState('NRZ');
  
  const encodingInfo = {
    NRZ: {
      name: "Non-Return to Zero (NRZ) Encoding",
      description: "NRZ encoding: High level (+5V) represents '1', low level (-5V) represents '0'. No return to zero between consecutive bits."
    },
    RZ: {
      name: "Return to Zero (RZ) Encoding",
      description: "RZ encoding: High pulse (+5V) in first half represents '1', low pulse (-5V) in first half represents '0'. Always returns to zero in second half."
    },
    Manchester: {
      name: "Manchester Encoding",
      description: "Manchester encoding: Transition from high to low represents '1', transition from low to high represents '0'. Each bit has a transition in the middle."
    },
    AMI: {
      name: "Binary AMI Encoding",
      description: "Binary AMI encoding: '0' is represented by zero voltage. '1' is represented by alternating positive (+5V) and negative (-5V) pulses."
    },
    CMI: {
      name: "Coded Mark Inversion (CMI) Encoding",
      description: "CMI encoding: '0' is represented by a high level in first half and low in second half. '1' alternates between all high and all low."
    }
  };
  
  // Convert text to binary
  const textToBinary = (text) => {
    return text.split('').map(char => {
      const binary = char.charCodeAt(0).toString(2).padStart(8, '0');
      return { char, ascii: char.charCodeAt(0), binary };
    });
  };
  
  const binaryData = textToBinary(inputText);
  const totalBits = binaryData.length * 8;
  
  // Calculate AMI/CMI states for each character
  const getEncodingStates = () => {
    let amiPolarity = 1;
    let cmiState = 0;
    const states = [];
    
    binaryData.forEach(({ binary }) => {
      states.push({ amiPolarity, cmiState });
      
      // Update states for this character
      binary.split('').forEach(bit => {
        if (bit === '1') {
          if (encoding === 'AMI') amiPolarity *= -1;
          if (encoding === 'CMI') {
            cmiState *= -1;
            cmiState += 1;
          }
        }
      });
    });
    
    return states;
  };
  
  const encodingStates = getEncodingStates();
  
  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>
            <i className="fas fa-wave-square"></i>
            Digital Pulse Code Converter
          </h1>
          <p className="subtitle">
            Convert strings to digital pulse codes (NRZ, RZ, Manchester, Binary AMI, CMI) and visualize them in a 2x2 box format for each bit.
          </p>
        </header>
        
        <section className="input-section">
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="inputString">
                <i className="fas fa-font"></i> Enter Text to Encode
              </label>
              <input
                type="text"
                id="inputString"
                value={inputText}
                onChange={(e) => setInputText(e.target.value || 'Hello')}
                placeholder="Enter text to convert to pulse codes"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="pulseType">
                <i className="fas fa-code"></i> Select Pulse Code Type
              </label>
              <select
                id="pulseType"
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
              >
                <option value="NRZ">Non-Return to Zero (NRZ)</option>
                <option value="RZ">Return to Zero (RZ)</option>
                <option value="Manchester">Manchester</option>
                <option value="AMI">Binary AMI</option>
                <option value="CMI">Coded Mark Inversion (CMI)</option>
              </select>
            </div>
          </div>
        </section>
        
        <section className="output-section">
          <div className="output-header">
            <h2 className="section-title">
              <i className="fas fa-eye"></i> Digital Pulse Code Visualization
            </h2>
          </div>
          
          <div className="code-selector">
            {Object.keys(encodingInfo).map(code => (
              <div
                key={code}
                className={`code-tab ${encoding === code ? 'active' : ''}`}
                onClick={() => setEncoding(code)}
              >
                <i className={`fas fa-${code === 'NRZ' ? 'minus' : code === 'RZ' ? 'undo' : code === 'Manchester' ? 'exchange-alt' : code === 'AMI' ? 'random' : 'project-diagram'}`}></i>
                {code === 'NRZ' ? 'Non-Return to Zero' : 
                 code === 'RZ' ? 'Return to Zero' :
                 code === 'Manchester' ? 'Manchester' :
                 code === 'AMI' ? 'Binary AMI' : 'CMI'}
              </div>
            ))}
          </div>
          
          <div className="pulse-display">
            <div className="pulse-title">
              <span>{encodingInfo[encoding].name}</span>
              <span className="bit-count">
                {binaryData.length} character{binaryData.length !== 1 ? 's' : ''} × 8 bits = {totalBits} bits
              </span>
            </div>
            
            <div className="pulse-grid">
              {binaryData.map(({ char, binary }, index) => (
                <CharacterGroup
                  key={index}
                  char={char}
                  charIndex={index}
                  binaryString={binary}
                  encoding={encoding}
                  amiStartPolarity={encodingStates[index].amiPolarity}
                  cmiStartState={encodingStates[index].cmiState}
                />
              ))}
            </div>
            
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color high"></div>
                <div className="legend-text">+5V (High)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color zero"></div>
                <div className="legend-text">0V (Zero)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color low"></div>
                <div className="legend-text">-5V (Low)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color timing"></div>
                <div className="legend-text">Timing (Vertical)</div>
              </div>
            </div>
            
            <p className="pulse-description">
              {encodingInfo[encoding].description}
            </p>
          </div>
        </section>
        
        <section className="conversion-steps">
          <h3 className="steps-title">
            <i className="fas fa-list-ol"></i> Conversion Process
          </h3>
          
          <div className="step">
            <div className="step-title">Step 1: String → Character Array</div>
            <div className="step-content">
              "{inputText}" → [{binaryData.map(d => `'${d.char}'`).join(', ')}]
            </div>
          </div>
          
          <div className="step">
            <div className="step-title">Step 2: Character Array → ASCII Array</div>
            <div className="step-content">
              {binaryData.map(d => `'${d.char}' → ${d.ascii}`).join(', ')}
            </div>
          </div>
          
          <div className="step">
            <div className="step-title">Step 3: ASCII Array → Binary Array</div>
            <div className="step-content">
              {binaryData.map(d => `${d.ascii} → ${d.binary}`).join(', ')}
            </div>
          </div>
          
          <div className="step">
            <div className="step-title">Step 4: Binary Array → Digital Pulse Code</div>
            <div className="step-content">
              Applying {encodingInfo[encoding].name.split(' ')[0]} encoding to the binary sequence
            </div>
          </div>
        </section>
        
        <footer>
          <p>Digital Pulse Code Converter | React Version | Encoding Techniques Visualization</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
