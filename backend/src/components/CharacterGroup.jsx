import { memo, useMemo } from 'react';
import BitBox from './BitBox';
import { ENCODING_TYPES } from '../constants';

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

    // Update state for next iteration
    if (encoding === ENCODING_TYPES.AMI && bit === '1') {
      amiPolarity *= -1;
    }
    if (encoding === ENCODING_TYPES.CMI && bit === '1') {
      cmiState = cmiState === 0 ? 1 : (cmiState === 1 ? -1 : 1);
    }

    return {
      bit,
      globalIndex,
      amiPolarity: currentAmiPolarity,
      cmiState: currentCmiState,
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
}) {
  const bits = useMemo(
    () => processBits(binaryString, charIndex, encoding, amiStartPolarity, cmiStartState),
    [binaryString, charIndex, encoding, amiStartPolarity, cmiStartState]
  );

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
});

export default CharacterGroup;
