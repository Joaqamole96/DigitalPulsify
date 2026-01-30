# Digital Pulse Code Converter

https://digital-pulsify.vercel.app/

A web application that converts strings into five different digital pulse codes and visualizes them in a 2x2 box format for each bit.

## Features

- Convert any string to digital pulse codes
- Five encoding types supported:
  - Non-Return to Zero (NRZ)
  - Return to Zero (RZ)
  - Manchester
  - Binary AMI
  - Coded Mark Inversion (CMI)
- Visual representation using 2x2 boxes per bit
- Shows voltage levels (+5V, 0V, -5V) as horizontal bars
- Shows pulse timing (full/half) as vertical bars
- Step-by-step conversion process display
- Responsive design for all screen sizes

## How to Use

1. Enter text in the input field
2. Select a pulse code type from the dropdown or tabs
3. Click "Convert to Digital Pulse Code"
4. View the visual representation of the encoded signal

## Encoding Types

### Non-Return to Zero (NRZ)
- High level (+5V) represents '0'
- Low level (-5V) represents '1'
- No return to zero between consecutive bits

### Return to Zero (RZ)
- High pulse (+5V) in first half represents '0'
- Low pulse (-5V) in first half represents '1'
- Always returns to zero in second half

### Manchester
- Transition from low to high represents '0'
- Transition from high to low represents '1'
- Each bit has a transition in the middle

### Binary AMI
- '0' is represented by zero voltage
- '1' is represented by alternating positive (+5V) and negative (-5V) pulses

### Coded Mark Inversion (CMI)
- '0' is represented by a neutral in first half and high in second half
- '1' alternates between neutral and high

## Color Coding

- **Green**: +5V (High)
- **Amber**: 0V (Zero)
- **Red**: -5V (Low)
- **Purple**: Timing (Vertical lines)

## Installation

Simply open `index.html` in a modern web browser. No server or additional dependencies required.

## Browser Compatibility

Works on all modern browsers including Chrome, Firefox, Safari, and Edge.

## License

MIT License
