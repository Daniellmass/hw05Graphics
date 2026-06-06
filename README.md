# Computer Graphics - Exercise 5 - WebGL Bowling Alley

## Getting Started
1. Clone this repository to your local machine
2. Make sure you have Node.js installed
3. Start the local web server: `node index.js`
4. Open your browser and go to http://localhost:8000

## Complete Instructions
**All detailed instructions, requirements, and specifications can be found in:**
`bowling_exercise_instructions.html`

## Group Members
**MANDATORY: Add the full names of all group members here:**
- Daniel Mass
- Yair Tzach

## How to Run
1. Clone this repository to your local machine
2. Make sure you have Node.js installed
3. Run: `node index.js`
4. Open http://localhost:8000 in your browser

## Additional Features
- Triangular lane arrows using `THREE.ShapeGeometry` for a realistic arrowhead appearance
- Pin shape built with `THREE.LatheGeometry` for an accurate bowling pin silhouette
- Bowling ball with three finger holes (two adjacent + one offset thumb hole) using oriented cylinders
- Pin deck area with a distinct darker surface behind the pins
- UI framework with a 10-frame scorecard and controls panel, ready for HW06

## Known Issues and Limitations
- No physics, ball rolling, pin collision, or scoring — these are reserved for HW06
- Finger holes on the bowling ball are visual only (dark cylinders, not actual geometry cutouts)

## External Assets
- Three.js r128 via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- OrbitControls.js — vendored from the Three.js r128 examples
