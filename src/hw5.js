import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x1a1a2e);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 20, -20);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -35;
directionalLight.shadow.camera.right = 35;
directionalLight.shadow.camera.top = 35;
directionalLight.shadow.camera.bottom = -35;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 120;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create bowling lane
function createBowlingLane() {
  // Lane surface - just a simple light maple wood surface
  const laneGeometry = new THREE.BoxGeometry(3.5, 0.2, 60);
  const laneMaterial = new THREE.MeshPhongMaterial({
    color: 0xDEB887,  // Light maple wood color
    shininess: 80
  });
  const lane = new THREE.Mesh(laneGeometry, laneMaterial);
  lane.position.set(0, 0, -30);  // Lane extends from Z=0 (foul line) to Z=-60 (pin end)
  lane.receiveShadow = true;
  scene.add(lane);
}

function createApproachArea() {
  // Approach surface — slightly darker wood, 15 units long behind foul line
  const approach = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.21, 15),
    new THREE.MeshPhongMaterial({ color: 0xC8A070, shininess: 50 })
  );
  approach.position.set(0, 0, 7.5);
  approach.receiveShadow = true;
  scene.add(approach);

  // Foul line — thin white bar straddling Z=0
  const foulLine = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.02, 0.07),
    new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
  );
  foulLine.position.set(0, 0.11, 0);
  scene.add(foulLine);

  // Two rows of 5 approach dots
  const dotMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
  const dotXPositions = [-1.2, -0.6, 0, 0.6, 1.2];
  [4, 10].forEach(dotZ => {
    dotXPositions.forEach(dotX => {
      const dot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16),
        dotMat
      );
      dot.position.set(dotX, 0.116, dotZ);
      scene.add(dot);
    });
  });
}

function createGutters() {
  const gutterMat = new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 20 });
  [-1, 1].forEach(side => {
    const gutter = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.15, 60),
      gutterMat
    );
    // Lane spans X ±1.75; gutter center at ±1.9 butts right against the lane edge.
    // Y=-0.025 → gutter top at Y=0.05, which is 0.05 below lane top (Y=0.1).
    gutter.position.set(side * 1.9, -0.025, -30);
    gutter.receiveShadow = true;
    scene.add(gutter);
  });
}

function createLaneArrows() {
  // Triangular arrowhead shape in local XY plane; tip at +Y (toward -Z in world after rotation)
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(0, 0.12);
  arrowShape.lineTo(0.04, -0.08);
  arrowShape.lineTo(-0.04, -0.08);
  arrowShape.closePath();

  const arrowGeo = new THREE.ShapeGeometry(arrowShape);
  const arrowMat = new THREE.MeshPhongMaterial({ color: 0xCC2200, side: THREE.DoubleSide });

  // 7 arrows centered on lane, 0.4 units apart, 15 units from foul line
  [-1.2, -0.8, -0.4, 0, 0.4, 0.8, 1.2].forEach(x => {
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    // rotation.x = -π/2 lays the XY shape flat in XZ plane, tip pointing toward -Z (pins)
    arrow.rotation.x = -Math.PI / 2;
    arrow.position.set(x, 0.101, -15);
    scene.add(arrow);
  });
}

function createPin() {
  const pinGroup = new THREE.Group();

  // Lathe profile: Vector2(radius, height), Y=0 at base, Y=1.25 at apex
  const points = [
    new THREE.Vector2(0.00, 0.000),  // base center (hidden on lane surface)
    new THREE.Vector2(0.19, 0.020),  // base edge
    new THREE.Vector2(0.22, 0.060),  // base flare
    new THREE.Vector2(0.21, 0.200),  // lower body
    new THREE.Vector2(0.22, 0.380),  // widest point
    new THREE.Vector2(0.19, 0.520),  // narrowing
    new THREE.Vector2(0.11, 0.660),  // upper narrowing
    new THREE.Vector2(0.08, 0.760),  // neck (narrowest)
    new THREE.Vector2(0.10, 0.840),  // neck/head transition
    new THREE.Vector2(0.13, 0.930),  // head widest
    new THREE.Vector2(0.12, 1.020),  // upper head
    new THREE.Vector2(0.07, 1.160),  // top curve
    new THREE.Vector2(0.00, 1.250),  // apex
  ];

  const bodyMesh = new THREE.Mesh(
    new THREE.LatheGeometry(points, 20),
    new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 80 })
  );
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  pinGroup.add(bodyMesh);

  // Red stripe centered at the neck (local Y=0.800)
  const stripeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.055, 20),
    new THREE.MeshPhongMaterial({ color: 0xCC0000 })
  );
  stripeMesh.position.y = 0.800;
  stripeMesh.castShadow = true;
  stripeMesh.receiveShadow = true;
  pinGroup.add(stripeMesh);

  return pinGroup;
}

function createPins() {
  // Pin deck — distinct darker surface under and behind the pins
  const deckMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.21, 8),
    new THREE.MeshPhongMaterial({ color: 0xA07840, shininess: 30 })
  );
  deckMesh.position.set(0, 0, -60);  // spans Z=-56 to Z=-64, covers all pins
  deckMesh.receiveShadow = true;
  scene.add(deckMesh);

  const pinPositions = [
    { x:  0.0, z: -57.000 },  // 1 — head pin
    { x: -0.5, z: -57.866 },  // 2
    { x:  0.5, z: -57.866 },  // 3
    { x: -1.0, z: -58.732 },  // 4
    { x:  0.0, z: -58.732 },  // 5
    { x:  1.0, z: -58.732 },  // 6
    { x: -1.5, z: -59.598 },  // 7
    { x: -0.5, z: -59.598 },  // 8
    { x:  0.5, z: -59.598 },  // 9
    { x:  1.5, z: -59.598 },  // 10
  ];

  pinPositions.forEach(({ x, z }) => {
    const pin = createPin();
    pin.position.set(x, 0.105, z);  // Y=0.105 = pin deck top surface
    scene.add(pin);
  });
}

function createBowlingBall() {
  const ballGroup = new THREE.Group();

  // Main sphere — near-black with strong specular for glossy look
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 32, 32),
    new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 150,
      specular: 0x888888,
    })
  );
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  ballGroup.add(sphere);

  // Three finger holes: two adjacent (middle + ring), one offset (thumb).
  // Each hole is a cylinder whose opening sits flush with the sphere surface.
  const holeMat = new THREE.MeshPhongMaterial({ color: 0x050505 });
  const holeDepth = 0.12;

  const holeDirections = [
    new THREE.Vector3( 0.25, 0.95, 0.20).normalize(),  // middle finger
    new THREE.Vector3(-0.25, 0.95, 0.20).normalize(),  // ring finger (adjacent)
    new THREE.Vector3( 0.00, 0.50, 0.87).normalize(),  // thumb (offset ~50° from pair)
  ];

  const cylinderUp = new THREE.Vector3(0, 1, 0);
  holeDirections.forEach(dir => {
    const hole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, holeDepth, 16),
      holeMat
    );
    // Center cylinder so its top opening lies exactly on the sphere surface (r=0.45)
    hole.position.copy(dir.clone().multiplyScalar(0.45 - holeDepth / 2));
    // Rotate default cylinder Y-axis to align with the radial direction
    hole.quaternion.setFromUnitVectors(cylinderUp, dir);
    ballGroup.add(hole);
  });

  // Approach top surface is Y=0.105; ball rests on it with center at Y = 0.105 + 0.45
  ballGroup.position.set(0, 0.555, 5);
  scene.add(ballGroup);
}

function createScorecard() {
  const scorecard = document.createElement('div');
  scorecard.id = 'scorecard';

  const table = document.createElement('table');

  // Frame header row — frames 1–9 span 2 columns, frame 10 spans 3
  const headerRow = document.createElement('tr');
  for (let f = 1; f <= 9; f++) {
    const th = document.createElement('th');
    th.colSpan = 2;
    th.textContent = f;
    headerRow.appendChild(th);
  }
  const th10 = document.createElement('th');
  th10.colSpan = 3;
  th10.textContent = '10';
  headerRow.appendChild(th10);
  table.appendChild(headerRow);

  // Ball-slot row — 2 slots per frame for frames 1–9, 3 slots for frame 10
  const ballRow = document.createElement('tr');
  for (let f = 0; f < 9; f++) {
    for (let b = 0; b < 2; b++) {
      const td = document.createElement('td');
      td.className = 'ball-slot';
      ballRow.appendChild(td);
    }
  }
  for (let b = 0; b < 3; b++) {
    const td = document.createElement('td');
    td.className = 'ball-slot';
    ballRow.appendChild(td);
  }
  table.appendChild(ballRow);

  // Score row — placeholder dashes; HW06 will populate these
  const scoreRow = document.createElement('tr');
  for (let f = 0; f < 9; f++) {
    const td = document.createElement('td');
    td.colSpan = 2;
    td.className = 'frame-score';
    td.textContent = '-';
    scoreRow.appendChild(td);
  }
  const td10 = document.createElement('td');
  td10.colSpan = 3;
  td10.className = 'frame-score';
  td10.textContent = '-';
  scoreRow.appendChild(td10);
  table.appendChild(scoreRow);

  scorecard.appendChild(table);
  document.body.appendChild(scorecard);
}

function createControlsPanel() {
  const panel = document.createElement('div');
  panel.id = 'controls';
  panel.innerHTML = `
    <h3>Controls</h3>
    <ul>
      <li><kbd>O</kbd> Toggle orbit camera</li>
      <li class="hw06-placeholder">&#8592;&#8594; Aim ball <em>(HW06)</em></li>
      <li class="hw06-placeholder"><kbd>Space</kbd> Throw ball <em>(HW06)</em></li>
      <li class="hw06-placeholder">1&ndash;5 Set power <em>(HW06)</em></li>
    </ul>
  `;
  document.body.appendChild(panel);
}

// Create all elements
createBowlingLane();
createApproachArea();
createGutters();
createLaneArrows();
createPins();
createBowlingBall();

// Set camera position for bowler's perspective
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 5, 12);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

createScorecard();
createControlsPanel();

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o" || e.key === "O") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();
