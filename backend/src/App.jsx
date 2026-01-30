import { useState, useMemo, useCallback } from 'react';
import { CharacterGroup } from './components';
import { ENCODING_INFO, ENCODING_TYPES, DEFAULTS } from './constants';
import { textToBinary, calculateEncodingStates } from './utils/encoding';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [encoding, setEncoding] = useState(DEFAULTS.ENCODING);

  // Memoize binary conversion
  const binaryData = useMemo(
    () => (inputText ? textToBinary(inputText) : []),
    [inputText]
  );

  const totalBits = binaryData.length * DEFAULTS.BITS_PER_CHAR;

  // Memoize encoding states calculation
  const encodingStates = useMemo(
    () => calculateEncodingStates(binaryData, encoding),
    [binaryData, encoding]
  );

  // Memoize input handler
  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  // Memoize encoding change handler
  const handleEncodingChange = useCallback((e) => {
    setEncoding(e.target.value);
  }, []);

  // Memoize tab click handler
  const handleTabClick = useCallback((code) => {
    setEncoding(code);
  }, []);

  const currentEncodingInfo = ENCODING_INFO[encoding];

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
                onChange={handleInputChange}
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
                onChange={handleEncodingChange}
              >
                {Object.entries(ENCODING_INFO).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.label}
                  </option>
                ))}
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
            {Object.entries(ENCODING_INFO).map(([code, info]) => (
              <div
                key={code}
                className={`code-tab ${encoding === code ? 'active' : ''}`}
                onClick={() => handleTabClick(code)}
              >
                <i className={`fas fa-${info.icon}`}></i>
                {info.label}
              </div>
            ))}
          </div>

          <div className="pulse-display">
            <div className="pulse-title">
              <span>{currentEncodingInfo.name}</span>
              {binaryData.length > 0 && (
                <span className="bit-count">
                  {binaryData.length} character{binaryData.length !== 1 ? 's' : ''} × 8 bits = {totalBits} bits
                </span>
              )}
            </div>

            {binaryData.length > 0 ? (
              <div className="pulse-grid">
                {binaryData.map(({ char, binary }, index) => (
                  <CharacterGroup
                    key={index}
                    char={char}
                    charIndex={index}
                    binaryString={binary}
                    encoding={encoding}
                    amiStartPolarity={encodingStates[index]?.amiPolarity ?? 1}
                    cmiStartState={encodingStates[index]?.cmiState ?? 0}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-keyboard"></i>
                <p>Enter text above to see the pulse code visualization</p>
              </div>
            )}

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
              {currentEncodingInfo.description}
            </p>
          </div>
        </section>

        {binaryData.length > 0 && (
          <section className="conversion-steps">
            <h3 className="steps-title">
              <i className="fas fa-list-ol"></i> Conversion Process
            </h3>

            <div className="step">
              <div className="step-title">Step 1: String → Character Array</div>
              <div className="step-content">
                "{inputText}" → [{binaryData.map((d) => `'${d.char}'`).join(', ')}]
              </div>
            </div>

            <div className="step">
              <div className="step-title">Step 2: Character Array → ASCII Array</div>
              <div className="step-content">
                {binaryData.map((d) => `'${d.char}' → ${d.ascii}`).join(', ')}
              </div>
            </div>

            <div className="step">
              <div className="step-title">Step 3: ASCII Array → Binary Array</div>
              <div className="step-content">
                {binaryData.map((d) => `${d.ascii} → ${d.binary}`).join(', ')}
              </div>
            </div>

            <div className="step">
              <div className="step-title">Step 4: Binary Array → Digital Pulse Code</div>
              <div className="step-content">
                Applying {currentEncodingInfo.name.split(' ')[0]} encoding to the binary sequence
              </div>
            </div>
          </section>
        )}

        <footer>
          <p>Digital Pulse Code Converter | React Version | Encoding Techniques Visualization</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
