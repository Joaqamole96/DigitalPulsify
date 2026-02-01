import { memo, useMemo } from 'react';
import BitBox from './BitBox';
import { ENCODING_TYPES } from '../constants';

const getBitVoltages = (encoding, bitValue, amiPolarity, cmiState) => {
  const isOne = bitValue === '1';

  switch (encoding) {
    case ENCODING_TYPES.NRZ: {
      const voltage = isOne ? -1 : 1;
      return { startVoltage: voltage, endVoltage: voltage };
    }
    case ENCODING_TYPES.RZ: {
      const voltage = isOne ? -1 : 1;
      return { startVoltage: voltage, endVoltage: 0 };
    }
    case ENCODING_TYPES.MANCHESTER:
      return isOne
        ? { startVoltage: 1, endVoltage: -1 }
        : { startVoltage: -1, endVoltage: 1 };
    case ENCODING_TYPES.AMI: {
      const voltage = isOne ? amiPolarity : 0;
      return { startVoltage: voltage, endVoltage: voltage };
    }
    case ENCODING_TYPES.CMI:
      return isOne
        ? { startVoltage: cmiState, endVoltage: cmiState }
        : { startVoltage: 0, endVoltage: 1 };
    default:
      return { startVoltage: 0, endVoltage: 0 };
  }
};

/**
 * Process bits for a character, calculating encoding states for each bit
 */
const processBits = (binaryString, charIndex, encoding, amiStartPolarity, cmiStartState) => {
  let amiPolarity = amiStartPolarity;
  let cmiState = cmiStartState;

  return binaryString.split('').map((bit, bitIndex) => {
    const globalIndex = charIndex * 8 + bitIndex;
    const currentAmiPolarity = amiPolarity;
    const currentCmiState = cmiState;
    const { startVoltage, endVoltage } = getBitVoltages(
      encoding,
      bit,
      currentAmiPolarity,
      currentCmiState
    );

    // Update state for next iteration
    if (encoding === ENCODING_TYPES.AMI && bit === '1') {
      amiPolarity *= -1;
    }
    if (encoding === ENCODING_TYPES.CMI && bit === '1') {
      cmiState = cmiState === 0 ? 1 : 0;
    }

    return {
      bit,
      globalIndex,
      amiPolarity: currentAmiPolarity,
      cmiState: currentCmiState,
      startVoltage,
      endVoltage,
    };
  });
};

/**
 * CharacterGroup - Renders all 8 bits for a single character
 */
const CharacterGroup = memo(function CharacterGroup({
  char,
  charIndex,
  binaryString,
  encoding,
  amiStartPolarity,
  cmiStartState,
  nextBinaryString,
  nextAmiStartPolarity,
  nextCmiStartState,
  connectBits,
  connectorColor,
  showMidBitMarkers,
  activeBitIndex,
  gridSize,
}) {
  const bits = useMemo(
    () => processBits(binaryString, charIndex, encoding, amiStartPolarity, cmiStartState),
    [binaryString, charIndex, encoding, amiStartPolarity, cmiStartState]
  );

  const nextGroupFirstStartVoltage = useMemo(() => {
    if (!nextBinaryString) return null;
    const firstBit = nextBinaryString[0];
    return getBitVoltages(encoding, firstBit, nextAmiStartPolarity, nextCmiStartState).startVoltage;
  }, [nextBinaryString, encoding, nextAmiStartPolarity, nextCmiStartState]);

  return (
    <div className="char-group">
      <div className="char-label">{`Char ${charIndex + 1}: '${char}'`}</div>
      <div className="bits-row">
        {bits.map(({ bit, globalIndex, amiPolarity, cmiState, endVoltage }, index) => (
          <BitBox
            key={globalIndex}
            bitIndex={globalIndex}
            bitValue={bit}
            encoding={encoding}
            amiPolarity={amiPolarity}
            cmiState={cmiState}
            endVoltage={endVoltage}
            nextStartVoltage={
              index < bits.length - 1
                ? bits[index + 1].startVoltage
                : nextGroupFirstStartVoltage
            }
            connectBits={connectBits}
            connectorColor={connectorColor}
            showMidBitMarkers={showMidBitMarkers}
            isActive={activeBitIndex === globalIndex}
            gridSize={gridSize}
          />
        ))}
      </div>
    </div>
  );
});

export default CharacterGroup;
