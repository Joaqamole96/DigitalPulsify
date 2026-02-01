import { DEFAULTS, ENCODING_TYPES } from '../constants';

/**
 * Convert a single character to its binary representation
 * @param {string} char - Single character
 * @returns {Object} - { char, ascii, binary }
 */
export const charToBinary = (char) => {
  const ascii = char.charCodeAt(0);
  const binary = ascii.toString(2).padStart(DEFAULTS.BITS_PER_CHAR, '0');
  return { char, ascii, binary };
};

/**
 * Convert text string to array of binary data
 * @param {string} text - Input text
 * @returns {Array} - Array of { char, ascii, binary } objects
 */
export const textToBinary = (text) => {
  return text.split('').map(charToBinary);
};

/**
 * Calculate AMI and CMI encoding states for each character
 * @param {Array} binaryData - Array from textToBinary
 * @param {string} encoding - Current encoding type
 * @returns {Array} - Array of { amiPolarity, cmiState } for each character
 */
export const calculateEncodingStates = (binaryData, encoding) => {
  let amiPolarity = 1;
  let cmiState = 0;
  const states = [];

  binaryData.forEach(({ binary }) => {
    states.push({ amiPolarity, cmiState });

    // Update states based on bits in this character
    binary.split('').forEach((bit) => {
      if (bit === '1') {
        if (encoding === ENCODING_TYPES.AMI) {
          amiPolarity *= -1;
        }
        if (encoding === ENCODING_TYPES.CMI) {
          cmiState = cmiState === 0 ? 1 : 0;
        }
      }
    });
  });

  return states;
};

/**
 * Update AMI polarity for next bit
 * @param {number} currentPolarity - Current polarity (1 or -1)
 * @param {string} bit - Current bit value ('0' or '1')
 * @returns {number} - Next polarity
 */
export const getNextAmiPolarity = (currentPolarity, bit) => {
  return bit === '1' ? currentPolarity * -1 : currentPolarity;
};

/**
 * Update CMI state for next bit
 * @param {number} currentState - Current state (0, 1, or -1)
 * @param {string} bit - Current bit value ('0' or '1')
 * @returns {number} - Next state
 */
export const getNextCmiState = (currentState, bit) => {
  if (bit === '1') {
    return currentState === 0 ? 1 : 0;
  }
  return currentState;
};
