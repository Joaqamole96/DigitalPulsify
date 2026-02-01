import { memo, useMemo } from 'react';
import { VOLTAGE_COLOR_MAP, VOLTAGE_POSITIONS, VOLTAGE_COLORS, ENCODING_TYPES } from '../constants';

// Voltage position percentages for proper vertical line calculations
const VOLTAGE_PERCENT_2x2 = {
  1: 0,    // +5V at top
  0: 50,   // 0V at middle
  '-1': 100, // -5V at bottom
};

const VOLTAGE_PERCENT_4x4 = {
  1: 25,   // +5V
  0: 50,   // 0V
  '-1': 75, // -5V
};

// Voltage positions as CSS strings
const VOLTAGE_POSITIONS_2x2 = {
  1: '0%',
  0: '50%',
  '-1': '100%',
};

const VOLTAGE_POSITIONS_4x4 = {
  1: '25%',
  0: '50%',
  '-1': '75%',
};

/**
 * Creates a horizontal pulse segment
 */
const createHorizontal = (left, right, voltage, key, voltagePositions) => (
  <div
    key={key}
    className="pulse-segment horizontal-pulse"
    style={{
      left: `${left}%`,
      right: `${100 - right}%`,
      top: voltagePositions[voltage],
      backgroundColor: VOLTAGE_COLOR_MAP[voltage],
    }}
  />
);

/**
 * Creates a vertical pulse segment (timing transition) between two voltage levels
 * @param {number} fromVoltage - Starting voltage level (1, 0, or -1)
 * @param {number} toVoltage - Ending voltage level (1, 0, or -1)
 * @param {string} position - 'center', 'left', or 'right'
 * @param {string} key - React key
 */
const createVerticalTransition = (fromVoltage, toVoltage, position, key, colorOverride, voltagePercent) => {
  const fromPercent = voltagePercent[fromVoltage];
  const toPercent = voltagePercent[toVoltage];
  const top = Math.min(fromPercent, toPercent);
  const bottom = Math.max(fromPercent, toPercent);

  const leftPositions = { center: '50%', left: '25%', right: '75%', edge: '100%' };
  const transitionColor = colorOverride || VOLTAGE_COLORS.TIMING;
  return (
    <div
      key={key}
      className="pulse-segment vertical-pulse"
      style={{
        top: `${top}%`,
        bottom: `${100 - bottom}%`,
        left: leftPositions[position],
        backgroundColor: transitionColor,
      }}
    />
  );
};

const hasMidTransition = (encoding, bitValue) => {
  if (encoding === ENCODING_TYPES.MANCHESTER) return true;
  if (encoding === ENCODING_TYPES.RZ) return true;
  if (encoding === ENCODING_TYPES.CMI && bitValue === '0') return true;
  return false;
};

/**
 * Generates pulse segments based on encoding type
 */
const generatePulse = (encoding, bitValue, amiPolarity, cmiState, voltagePositions, voltagePercent) => {
  const pulses = [];
  const isOne = bitValue === '1';

  switch (encoding) {
    case ENCODING_TYPES.NRZ:
      // Full width at high or low voltage
      pulses.push(createHorizontal(0, 100, isOne ? -1 : 1, 'h1', voltagePositions));
      break;

    case ENCODING_TYPES.RZ: {
      // First half at voltage, second half returns to zero
      const voltage = isOne ? -1 : 1;
      pulses.push(createHorizontal(0, 50, voltage, 'h1', voltagePositions));
      pulses.push(createHorizontal(50, 100, 0, 'h2', voltagePositions));
      // Vertical transition from voltage to zero (0V)
      pulses.push(createVerticalTransition(voltage, 0, 'center', 'v1', null, voltagePercent));
      break;
    }

    case ENCODING_TYPES.MANCHESTER:
      // Transition in middle: 1 = high-to-low, 0 = low-to-high
      if (isOne) {
        pulses.push(createHorizontal(0, 50, 1, 'h1', voltagePositions));
        pulses.push(createHorizontal(50, 100, -1, 'h2', voltagePositions));
        // Transition from +5V to -5V (full height)
        pulses.push(createVerticalTransition(1, -1, 'center', 'v1', null, voltagePercent));
      } else {
        pulses.push(createHorizontal(0, 50, -1, 'h1', voltagePositions));
        pulses.push(createHorizontal(50, 100, 1, 'h2', voltagePositions));
        // Transition from -5V to +5V (full height)
        pulses.push(createVerticalTransition(-1, 1, 'center', 'v1', null, voltagePercent));
      }
      break;

    case ENCODING_TYPES.AMI:
      // 0 = zero voltage, 1 = alternating polarity
      pulses.push(createHorizontal(0, 100, isOne ? amiPolarity : 0, 'h1', voltagePositions));
      break;

    case ENCODING_TYPES.CMI:
      // 1 = full width at alternating 0V / +5V, 0 = 0V then +5V
      if (isOne) {
        pulses.push(createHorizontal(0, 100, cmiState, 'h1', voltagePositions));
      } else {
        // CMI '0' encoding: first half at 0V, second half at +5V
        pulses.push(createHorizontal(0, 50, 0, 'h1', voltagePositions));
        pulses.push(createHorizontal(50, 100, 1, 'h2', voltagePositions));
        // Transition from 0V to +5V (half height)
        pulses.push(createVerticalTransition(0, 1, 'center', 'v1', null, voltagePercent));
      }
      break;

    default:
      break;
  }

  return pulses;
};

/**
 * BitBox - Renders a single bit with pulse visualization
 */
const BitBox = memo(function BitBox({
  bitIndex,
  bitValue,
  encoding,
  amiPolarity,
  cmiState,
  endVoltage,
  nextStartVoltage,
  connectBits,
  connectorColor,
  showMidBitMarkers,
  isActive,
  gridSize,
}) {
  const pulseSegments = useMemo(
    () => {
      const voltagePositions = gridSize === '4x4' ? VOLTAGE_POSITIONS_4x4 : VOLTAGE_POSITIONS_2x2;
      const voltagePercent = gridSize === '4x4' ? VOLTAGE_PERCENT_4x4 : VOLTAGE_PERCENT_2x2;

      const segments = generatePulse(encoding, bitValue, amiPolarity, cmiState, voltagePositions, voltagePercent);

      if (
        connectBits &&
        nextStartVoltage !== null &&
        nextStartVoltage !== undefined &&
        endVoltage !== nextStartVoltage
      ) {
        segments.push(
          createVerticalTransition(endVoltage, nextStartVoltage, 'edge', 'v-connect', connectorColor, voltagePercent)
        );
      }

      if (showMidBitMarkers && hasMidTransition(encoding, bitValue)) {
        segments.push(
          <div key="mid-marker" className="pulse-segment midbit-marker" />
        );
      }

      return segments;
    },
    [
      encoding,
      bitValue,
      amiPolarity,
      cmiState,
      endVoltage,
      nextStartVoltage,
      connectBits,
      connectorColor,
      showMidBitMarkers,
      gridSize,
    ]
  );

  const bitNumber = (bitIndex % 8) + 1;

  return (
    <div className="bit-container">
      <div className={`bit-box ${isActive ? 'active-bit' : ''}`} id={`bit-${bitIndex}`}>
        {/* Voltage reference lines */}
        {gridSize === '4x4' ? (
          <>
            {/* 4x4: lines at 25%, 50%, 75% with empty top/bottom rows */}
            <div className="voltage-line top-line" style={{ top: '25%' }} />
            <div className="voltage-line middle-line" style={{ top: '50%' }} />
            <div className="voltage-line bottom-line" style={{ top: '75%' }} />
          </>
        ) : (
          <>
            {/* 2x2: lines at 0%, 50%, 100% - no empty rows */}
            <div className="voltage-line top-line" style={{ top: '0%' }} />
            <div className="voltage-line middle-line" style={{ top: '50%' }} />
            <div className="voltage-line bottom-line" style={{ top: '100%' }} />
          </>
        )}

        {/* Vertical grid lines: 2x2 = center only, 4x4 = all three */}
        {gridSize === '4x4' && (
          <div className="vertical-line left-line" style={{ left: '25%' }} />
        )}
        <div className="vertical-line center-line" style={{ left: '50%' }} />
        {gridSize === '4x4' && (
          <div className="vertical-line right-line" style={{ left: '75%' }} />
        )}

        {/* Bit cells (2x2 grid) */}
        {[0, 1, 2, 3].map((cell) => (
          <div key={cell} className="bit-cell" />
        ))}

        {/* Pulse visualization */}
        {pulseSegments}
      </div>
      <div className="bit-label">
        <span>Bit {bitNumber}</span>
        <span>({bitValue})</span>
      </div>
    </div>
  );
});

export default BitBox;
