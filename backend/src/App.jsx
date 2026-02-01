import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { CharacterGroup } from './components';
import { ENCODING_INFO, DEFAULTS } from './constants';
import { textToBinary, calculateEncodingStates } from './utils/encoding';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [encoding, setEncoding] = useState(DEFAULTS.ENCODING);
  const [connectBits, setConnectBits] = useState(true);
  const [bitGap, setBitGap] = useState(0);
  const [bitSize, setBitSize] = useState(45);
  const [showGridLines, setShowGridLines] = useState(true);
  const [showBitLabels, setShowBitLabels] = useState(true);
  const [showCharBoundaries, setShowCharBoundaries] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [smoothConnectors, setSmoothConnectors] = useState(true);
  const [connectorColor, setConnectorColor] = useState('#38bdf8');
  const [showMidBitMarkers, setShowMidBitMarkers] = useState(false);
  const [showBinary, setShowBinary] = useState(true);
  const [showAscii, setShowAscii] = useState(true);
  const [animateBits, setAnimateBits] = useState(false);
  const [activeBitIndex, setActiveBitIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const pulseGridRef = useRef(null);

  // Memoize binary conversion
  const binaryData = useMemo(
    () => (inputText ? textToBinary(inputText) : []),
    [inputText]
  );

  const totalBits = binaryData.length * DEFAULTS.BITS_PER_CHAR;
  const totalBitCount = totalBits || 1;
  const bitGroupWidth = bitSize * DEFAULTS.BITS_PER_CHAR + bitGap * (DEFAULTS.BITS_PER_CHAR - 1);

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

  const handleConnectBitsChange = useCallback((e) => {
    setConnectBits(e.target.checked);
  }, []);

  const handleBitGapChange = useCallback((e) => {
    setBitGap(Number(e.target.value));
  }, []);

  const handleBitSizeChange = useCallback((e) => {
    setBitSize(Number(e.target.value));
  }, []);


  const handleShowGridLinesChange = useCallback((e) => {
    setShowGridLines(e.target.checked);
  }, []);

  const handleShowBitLabelsChange = useCallback((e) => {
    setShowBitLabels(e.target.checked);
  }, []);

  const handleShowCharBoundariesChange = useCallback((e) => {
    setShowCharBoundaries(e.target.checked);
  }, []);

  const handleShowLegendChange = useCallback((e) => {
    setShowLegend(e.target.checked);
  }, []);

  const handleSmoothConnectorsChange = useCallback((e) => {
    setSmoothConnectors(e.target.checked);
  }, []);

  const handleConnectorColorChange = useCallback((e) => {
    setConnectorColor(e.target.value);
  }, []);

  const handleShowMidBitMarkersChange = useCallback((e) => {
    setShowMidBitMarkers(e.target.checked);
  }, []);

  const handleShowBinaryChange = useCallback((e) => {
    setShowBinary(e.target.checked);
  }, []);

  const handleShowAsciiChange = useCallback((e) => {
    setShowAscii(e.target.checked);
  }, []);

  const handleAnimateBitsChange = useCallback((e) => {
    setAnimateBits(e.target.checked);
  }, []);

  const toggleOptions = useCallback(() => {
    setShowOptions((prev) => !prev);
  }, []);

  // Memoize tab click handler
  const handleTabClick = useCallback((code) => {
    setEncoding(code);
  }, []);

  useEffect(() => {
    if (!animateBits || totalBits === 0) return;
    const interval = setInterval(() => {
      setActiveBitIndex((prev) => (prev + 1) % totalBitCount);
    }, 400);
    return () => clearInterval(interval);
  }, [animateBits, totalBits, totalBitCount]);

  useEffect(() => {
    setActiveBitIndex(0);
  }, [inputText, encoding]);

  const getComputedStyles = (element) => {
    const styles = window.getComputedStyle(element);
    let cssText = '';
    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      cssText += `${prop}:${styles.getPropertyValue(prop)};`;
    }
    return cssText;
  };

  const cloneWithStyles = (node) => {
    const clone = node.cloneNode(false);
    if (node.nodeType === Node.ELEMENT_NODE) {
      clone.setAttribute('style', getComputedStyles(node));
      clone.style.margin = '0';
    }
    for (const child of node.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        clone.appendChild(cloneWithStyles(child));
      } else if (child.nodeType === Node.TEXT_NODE) {
        clone.appendChild(child.cloneNode(true));
      }
    }
    return clone;
  };

  const buildExportSvg = () => {
    const node = pulseGridRef.current;
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const clone = cloneWithStyles(node);
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    clone.style.overflow = 'visible';

    const serializer = new XMLSerializer();
    const htmlString = serializer.serializeToString(clone);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${htmlString}</div>
      </foreignObject>
    </svg>`;
    return { svg, width, height };
  };

  const downloadSvg = () => {
    const result = buildExportSvg();
    if (!result) return;
    const blob = new Blob([result.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pulse-grid.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const result = buildExportSvg();
    if (!result) return;
    const { svg, width, height } = result;

    const svgBase64 = btoa(unescape(encodeURIComponent(svg)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'pulse-grid.png';
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    img.onerror = () => {
      console.error('Failed to load SVG for PNG export');
    };
    img.src = dataUrl;
  };

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
          <button
            type="button"
            className={`options-toggle ${showOptions ? 'open' : ''}`}
            onClick={toggleOptions}
            aria-label="Toggle options panel"
          >
            {showOptions ? '<' : '>'}
          </button>
          <div className={`options-panel ${showOptions ? 'open' : ''}`}>
            <div className="options-row">
              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-link"></i> Connect Each Bit
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={connectBits}
                    onChange={handleConnectBitsChange}
                  />
                  <span className="toggle-label">Show connectors</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-grip-lines"></i> Grid Lines
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showGridLines}
                    onChange={handleShowGridLinesChange}
                  />
                  <span className="toggle-label">Show grid</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-tag"></i> Bit Labels
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showBitLabels}
                    onChange={handleShowBitLabelsChange}
                  />
                  <span className="toggle-label">Show labels</span>
                </label>
              </div>
            </div>

            <div className="options-row">
              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-border-all"></i> Character Boundaries
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showCharBoundaries}
                    onChange={handleShowCharBoundariesChange}
                  />
                  <span className="toggle-label">Show boundaries</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-list"></i> Legend
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showLegend}
                    onChange={handleShowLegendChange}
                  />
                  <span className="toggle-label">Show legend</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-adjust"></i> Smooth Connectors
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={smoothConnectors}
                    onChange={handleSmoothConnectorsChange}
                  />
                  <span className="toggle-label">Rounded joints</span>
                </label>
              </div>
            </div>

            <div className="options-row">
              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-paint-brush"></i> Connector Color
                </label>
                <input
                  type="color"
                  className="color-input"
                  value={connectorColor}
                  onChange={handleConnectorColorChange}
                />
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-wave-square"></i> Mid-Bit Markers
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showMidBitMarkers}
                    onChange={handleShowMidBitMarkersChange}
                  />
                  <span className="toggle-label">Show markers</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-play"></i> Step-Through Animation
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={animateBits}
                    onChange={handleAnimateBitsChange}
                  />
                  <span className="toggle-label">Animate bits</span>
                </label>
              </div>
            </div>

            <div className="options-row">
              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-arrows-alt-h"></i> Bit Spacing
                </label>
                <div className="slider-row">
                  <input
                    type="range"
                    min="0"
                    max="12"
                    value={bitGap}
                    onChange={handleBitGapChange}
                  />
                  <span className="range-value">{bitGap}px</span>
                </div>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-expand"></i> Bit Size
                </label>
                <div className="slider-row">
                  <input
                    type="range"
                    min="30"
                    max="70"
                    value={bitSize}
                    onChange={handleBitSizeChange}
                  />
                  <span className="range-value">{bitSize}px</span>
                </div>
              </div>

            </div>

            <div className="options-row">
              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-stream"></i> Binary Stream
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showBinary}
                    onChange={handleShowBinaryChange}
                  />
                  <span className="toggle-label">Show binary</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-hashtag"></i> ASCII Values
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={showAscii}
                    onChange={handleShowAsciiChange}
                  />
                  <span className="toggle-label">Show ASCII</span>
                </label>
              </div>

              <div className="option-item">
                <label className="option-title">
                  <i className="fas fa-download"></i> Export
                </label>
                <div className="export-actions">
                  <button type="button" onClick={downloadPng}>PNG</button>
                  <button type="button" onClick={downloadSvg}>SVG</button>
                </div>
              </div>
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
              <div
                ref={pulseGridRef}
                className={`pulse-grid ${showGridLines ? '' : 'hide-grid-lines'} ${
                  showBitLabels ? '' : 'hide-bit-labels'
                } ${showCharBoundaries ? '' : 'hide-char-boundaries'} ${
                  smoothConnectors ? 'smooth-connectors' : 'sharp-connectors'
                }`}
                style={{
                  '--bit-size': `${bitSize}px`,
                  '--bit-gap': `${bitGap}px`,
                  '--bit-group-width': `${bitGroupWidth}px`,
                }}
              >
                {binaryData.map(({ char, binary }, index) => (
                  <CharacterGroup
                    key={index}
                    char={char}
                    charIndex={index}
                    binaryString={binary}
                    encoding={encoding}
                    amiStartPolarity={encodingStates[index]?.amiPolarity ?? 1}
                    cmiStartState={encodingStates[index]?.cmiState ?? 0}
                    nextBinaryString={binaryData[index + 1]?.binary}
                    nextAmiStartPolarity={encodingStates[index + 1]?.amiPolarity ?? 1}
                    nextCmiStartState={encodingStates[index + 1]?.cmiState ?? 0}
                    connectBits={connectBits}
                    connectorColor={connectorColor}
                    showMidBitMarkers={showMidBitMarkers}
                    activeBitIndex={animateBits ? activeBitIndex : null}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-keyboard"></i>
                <p>Enter text above to see the pulse code visualization</p>
              </div>
            )}

            {showLegend && (
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
                <div className="legend-item">
                  <div
                    className="legend-color connector"
                    style={{ backgroundColor: connectorColor }}
                  ></div>
                  <div className="legend-text">Bit Connector</div>
                </div>
              </div>
            )}

            <p className="pulse-description">
              {currentEncodingInfo.description}
            </p>

            {binaryData.length > 0 && (showBinary || showAscii) && (
              <div className="encoding-aids">
                {showBinary && (
                  <div className="encoding-row">
                    <div className="encoding-label">Binary Stream</div>
                    <div className="encoding-value">
                      {binaryData.map((d) => d.binary).join(' ')}
                    </div>
                  </div>
                )}
                {showAscii && (
                  <div className="encoding-row">
                    <div className="encoding-label">ASCII</div>
                    <div className="encoding-value">
                      {binaryData.map((d) => `${d.char}: ${d.ascii}`).join(' | ')}
                    </div>
                  </div>
                )}
              </div>
            )}
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
