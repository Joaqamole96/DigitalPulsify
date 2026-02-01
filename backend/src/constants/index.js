// Voltage level colors for pulse visualization
export const VOLTAGE_COLORS = {
  HIGH: '#10b981',    // +5V (green)
  ZERO: '#f59e0b',    // 0V (amber)
  LOW: '#ef4444',     // -5V (red)
  TIMING: '#8b5cf6',  // Vertical timing lines (purple)
};

// Map voltage values to colors
export const VOLTAGE_COLOR_MAP = {
  1: VOLTAGE_COLORS.HIGH,
  0: VOLTAGE_COLORS.ZERO,
  '-1': VOLTAGE_COLORS.LOW,
};

// Map voltage values to vertical positions (percentage)
export const VOLTAGE_POSITIONS = {
  1: '0%',    // +5V at top
  0: '50%',   // 0V at middle
  '-1': '100%', // -5V at bottom
};

// Bit box dimensions
export const BIT_BOX = {
  WIDTH: 45,
  HEIGHT: 45,
  MOBILE_WIDTH: 40,
  MOBILE_HEIGHT: 40,
  SMALL_MOBILE_WIDTH: 35,
  SMALL_MOBILE_HEIGHT: 35,
};

// Encoding types
export const ENCODING_TYPES = {
  NRZ: 'NRZ',
  RZ: 'RZ',
  MANCHESTER: 'Manchester',
  AMI: 'AMI',
  CMI: 'CMI',
};

// Encoding information for display
export const ENCODING_INFO = {
  [ENCODING_TYPES.NRZ]: {
    name: 'Non-Return to Zero (NRZ) Encoding',
    description: "NRZ encoding: High level (+5V) represents '1', low level (-5V) represents '0'. No return to zero between consecutive bits.",
    icon: 'minus',
    label: 'Non-Return to Zero',
  },
  [ENCODING_TYPES.RZ]: {
    name: 'Return to Zero (RZ) Encoding',
    description: "RZ encoding: High pulse (+5V) in first half represents '1', low pulse (-5V) in first half represents '0'. Always returns to zero in second half.",
    icon: 'undo',
    label: 'Return to Zero',
  },
  [ENCODING_TYPES.MANCHESTER]: {
    name: 'Manchester Encoding',
    description: "Manchester encoding: Transition from high to low represents '1', transition from low to high represents '0'. Each bit has a transition in the middle.",
    icon: 'exchange-alt',
    label: 'Manchester',
  },
  [ENCODING_TYPES.AMI]: {
    name: 'Binary AMI Encoding',
    description: "Binary AMI encoding: '0' is represented by zero voltage. '1' is represented by alternating positive (+5V) and negative (-5V) pulses.",
    icon: 'random',
    label: 'Binary AMI',
  },
  [ENCODING_TYPES.CMI]: {
    name: 'Coded Mark Inversion (CMI) Encoding',
    description: "CMI encoding: '0' is 0V in the first half and +5V in the second half. '1' alternates between all 0V and all +5V, starting at 0V.",
    icon: 'project-diagram',
    label: 'CMI',
  },
};

// Default values
export const DEFAULTS = {
  INPUT_TEXT: 'Hello',
  ENCODING: ENCODING_TYPES.NRZ,
  BITS_PER_CHAR: 8,
};
