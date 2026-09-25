// 3D hero: the page opens on a photo of a white Porsche 911, then this scene fades in over it:
// the same white 911 drives in, wheels turning, and parks under the Zeus sign, which powers on.
// If WebGL or the model fails, or the visitor prefers reduced motion, the photo simply stays.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// "Free Porsche 911 Carrera 4S" by Karol Miklas, CC BY-SA 4.0 (credited in the site footer)
// https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
const MODEL_URL = 'models/porsche-911.glb';
const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/';
const LOGO_URL = 'logo-hd.png';

const BG = 0x0B0D10;
const BLUE = 0x10A0F0;

// How long the opening photo stays up before the 3D scene takes over
const PHOTO_INTRO_MS = 3500;
const DRIVE_IN = 3.2;
const START_X = -14;
const WHEEL_RADIUS = 0.34;
// Cap on how fast the wheels appear to turn (radians/second). The rims have 10 spokes, so at real
// driving speed they turn ~one spoke per frame and look frozen (the "wagon wheel" effect).
// Below this cap the spokes always read as rolling forward.
const MAX_WHEEL_SPIN = 9;

const pageStart = performance.now();
const hero = document.querySelector('.hero');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// For testing: ?freeze=2.5 shows the scene frozen 2.5s into the drive-in
const freezeParam = new URLSearchParams(location.search).get('freeze');
const freezeTime = freezeParam === null ? null : parseFloat(freezeParam) || 0;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

if (hero && !reduceMotion && webglAvailable()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.domElement.className = 'hero-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 9, 22);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const lookAt = new THREE.Vector3();

  // ── Floor: dark, slightly glossy, with a faint blue grid
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.5, metalness: 0.4, envMapIntensity: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(60, 60, BLUE, BLUE);
  grid.material.transparent = true;
  grid.material.opacity = 0.12;
  grid.material.depthWrite = false;
  grid.position.y = 0.002;
  scene.add(grid);

  // ── Back wall with the Zeus logo sign
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 20),
    new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.95, metalness: 0 })
  );
  wall.position.set(0, 10, -5);
  scene.add(wall);

  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 0.05),
    new THREE.MeshBasicMaterial({ color: 0xFB4102, toneMapped: false })
  );
  strip.position.set(0, 0.35, -4.96);
  scene.add(strip);

  // Blue halo around the sign (hollow in the middle so it doesn't wash out the blue lettering)
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 7),
    new THREE.MeshBasicMaterial({
      map: haloTexture(), color: BLUE, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false
    })
  );
  glow.position.set(0, 2.05, -4.97);
  glow.renderOrder = 1;
  scene.add(glow);

  // Dark backing plate so the logo reads like a lit sign against the wall
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 4.2),
    new THREE.MeshBasicMaterial({
      map: radialGlowTexture(), color: 0x05070a, transparent: true, opacity: 0,
      depthWrite: false, toneMapped: false, fog: false
    })
  );
  plate.position.set(0, 2.05, -4.96);
  plate.renderOrder = 2;
  scene.add(plate);

  const logoMaterial = new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, depthWrite: false, opacity: 0, fog: false });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6 * 246 / 338), logoMaterial);
  logo.position.set(0, 2.05, -4.95);
  logo.renderOrder = 3;
  scene.add(logo);

  // ── Lights (the room environment does most of the work on the paint)
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.PointLight(BLUE, 0, 12, 2);
  rim.position.set(0, 2.2, -3.5);
  scene.add(rim);

  // ── Car
  const car = new THREE.Group();
  scene.add(car);
  const wheels = [];

  const paint = new THREE.MeshPhysicalMaterial({
    color: 0xf4f5f7, metalness: 0.15, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.03
  });

  // ── Load the car and the sign, then start once the opening photo has had its moment
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(draco);

  Promise.all([
    new Promise((resolve, reject) => gltfLoader.load(MODEL_URL, resolve, undefined, reject)),
    new Promise((resolve, reject) => new THREE.TextureLoader().load(LOGO_URL, resolve, undefined, reject))
  ]).then(([gltf, logoTex]) => {
    logoTex.colorSpace = THREE.SRGBColorSpace;
    logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    logoMaterial.map = logoTex;
    logoMaterial.needsUpdate = true;
    setUpCar(gltf.scene);
    hero.prepend(renderer.domElement);
    resize();

    const wait = freezeTime !== null ? 0 : Math.max(0, PHOTO_INTRO_MS - (performance.now() - pageStart));
    setTimeout(() => {
      start = performance.now();
      renderFrame(start);
      hero.classList.add('hero--3d');
      running = freezeTime === null;
      updateLoop();
    }, wait);
  }).catch(() => {
    renderer.domElement.remove();
  });

  function setUpCar(model) {
    model.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      if (o.material.name === 'paint') o.material = paint;
      // The model's grey see-through clear-coat shell dulls white paint; our paint has its own clearcoat
      if (o.material.name === 'coat') o.visible = false;
    });

    // Each axle group holds both wheels as shared meshes (three.js strips the dots from node names,
    // so "Cylinder.000" loads as "Cylinder000"). One pair of wheels is modelled steered ~20°, so spinning
    // a whole axle makes them wobble. Instead, split each axle into its left and right wheel, measure each
    // tyre's true axis from its shape, turn the wheel straight so the car drives in cleanly, and spin it
    // about its own centre.
    // The brake calipers ("Material.001") get straightened the same way but don't spin.
    ['Cylinder000', 'Cylinder001'].forEach((name) => {
      const axle = model.getObjectByName(name);
      if (!axle) return;
      const parts = axle.children.filter((c) => c.isMesh && c.material.name !== 'Material.001');
      const calipers = axle.children.filter((c) => c.isMesh && c.material.name === 'Material.001');
      const tyre = parts.find((c) => c.material.name === 'rubber');
      if (!tyre) return;
      [-1, 1].forEach((side) => {
        const centre = sideBox(tyre.geometry, side).getCenter(new THREE.Vector3());
        const axis = tyreAxis(tyre.geometry, side, centre);
        // pivot spins about x at the wheel centre; straighten turns the wheel's own axis onto x
        const pivot = new THREE.Object3D();
        pivot.position.copy(centre);
        axle.add(pivot);
        const straighten = new THREE.Object3D();
        straighten.quaternion.setFromUnitVectors(axis, new THREE.Vector3(1, 0, 0));
        pivot.add(straighten);
        parts.forEach((part) => {
          const half = new THREE.Mesh(sideGeometry(part.geometry, side), part.material);
          half.position.copy(centre).negate();
          straighten.add(half);
        });
        wheels.push(pivot);

        const brake = new THREE.Object3D();
        brake.position.copy(centre);
        brake.quaternion.copy(straighten.quaternion);
        axle.add(brake);
        calipers.forEach((caliper) => {
          const half = new THREE.Mesh(sideGeometry(caliper.geometry, side), caliper.material);
          half.position.copy(centre).negate();
          brake.add(half);
        });
      });
      [...parts, ...calipers].forEach((mesh) => axle.remove(mesh));
    });

    // The model's nose points down +Z; turn it to face +X (screen right), sit it on the floor at the origin
    model.rotation.y = Math.PI / 2;
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const mid = box.getCenter(new THREE.Vector3());
    model.position.set(-mid.x, -box.min.y, -mid.z);

    // Soft contact shadow under the car
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: radialGlowTexture(), color: 0x000000, transparent: true, opacity: 0.85,
        depthWrite: false, toneMapped: false, fog: false
      })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(box.max.x - box.min.x + 1.4, box.max.z - box.min.z + 1, 1);
    shadow.position.y = 0.005;
    shadow.renderOrder = 4;
    car.add(shadow);
    car.add(model);
  }

  // ── Sizing: keep the car framed on any screen shape
  function resize() {
    const w = hero.clientWidth;
    const h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!running && start) renderFrame(performance.now());
  }
  new ResizeObserver(resize).observe(hero);

  function cameraDistance() {
    // Wide screens show the car with plenty of wall; narrow phones just fit the car
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
    const width = camera.aspect < 1 ? 7 : 13;
    return THREE.MathUtils.clamp(width / (2 * Math.tan(hfov / 2)), 10, 28);
  }

  // ── Animation
  let start = 0;
  let running = false;
  let wheelSpin = 0;
  let lastX = START_X;
  let lastNow = 0;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const carX = (t) => START_X * (1 - easeOut(Math.min(t / DRIVE_IN, 1)));

  function renderFrame(now) {
    const t = freezeTime !== null ? freezeTime : (now - start) / 1000;

    // Drive in and park; wheels roll with the distance travelled (capped so the spokes visibly turn)
    const x = carX(t);
    if (freezeTime !== null) {
      wheelSpin = (x - START_X) / WHEEL_RADIUS;
    } else {
      const dt = lastNow ? Math.min((now - lastNow) / 1000, 0.1) : 0;
      wheelSpin += Math.min((x - lastX) / WHEEL_RADIUS, MAX_WHEEL_SPIN * dt);
    }
    lastX = x;
    lastNow = now;
    car.position.x = x;
    wheels.forEach((w) => { w.rotation.x = wheelSpin; });

    // Sign flickers on as the car arrives, then breathes gently
    const on = THREE.MathUtils.smoothstep(t, DRIVE_IN - 1.2, DRIVE_IN + 0.3);
    const flicker = t > DRIVE_IN - 1.2 && t < DRIVE_IN ? (Math.sin(t * 60) > 0.2 ? 1 : 0.35) : 1;
    const breathe = 0.85 + 0.15 * Math.sin(t * 1.6);
    logoMaterial.opacity = on * flicker;
    plate.material.opacity = 0.9 * on;
    glow.material.opacity = 0.55 * on * flicker * breathe;
    rim.intensity = 30 * on * breathe;

    // Slow cinematic orbit once parked
    const orbitT = Math.max(0, t - DRIVE_IN);
    const angle = 0.25 + 0.28 * Math.sin(orbitT * 0.25);
    const dist = cameraDistance();
    scene.fog.near = dist + 3;
    scene.fog.far = dist + 16;
    // On tall phone screens aim lower so the car sits in the top half, above the text
    lookAt.set(0, camera.aspect < 1 ? -2.4 : -0.35, -1.5);
    camera.position.set(Math.sin(angle) * dist, 1.7, Math.cos(angle) * dist - 1.5);
    camera.lookAt(lookAt);

    renderer.render(scene, camera);
  }

  // Only animate while the hero is on screen
  let visible = true;
  const loop = (now) => renderFrame(now);
  function updateLoop() {
    renderer.setAnimationLoop(visible && running ? loop : null);
  }
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    updateLoop();
  }).observe(hero);
}

// Bounding box of the vertices on one side (x < 0 or x > 0) of a two-wheel axle mesh
function sideBox(geometry, side) {
  const pos = geometry.attributes.position;
  const box = new THREE.Box3();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (Math.sign(v.x) === side) box.expandByPoint(v);
  }
  return box;
}

// A tyre is a flat ring, so its vertices spread least along the axle: the axis is the direction of
// smallest spread (smallest eigenvector of their covariance), pointing towards +x for a consistent spin
function tyreAxis(geometry, side, centre) {
  const pos = geometry.attributes.position;
  const c = [0, 0, 0, 0, 0, 0]; // xx, yy, zz, xy, xz, yz
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    if (Math.sign(v.x) !== side) continue;
    v.sub(centre);
    c[0] += v.x * v.x; c[1] += v.y * v.y; c[2] += v.z * v.z;
    c[3] += v.x * v.y; c[4] += v.x * v.z; c[5] += v.y * v.z;
  }
  // Power iteration on (trace·I − C) converges to C's smallest eigenvector
  const tr = c[0] + c[1] + c[2];
  const m = new THREE.Matrix3().set(
    tr - c[0], -c[3], -c[4],
    -c[3], tr - c[1], -c[5],
    -c[4], -c[5], tr - c[2]
  );
  const axis = new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < 64; i++) axis.applyMatrix3(m).normalize();
  if (axis.x < 0) axis.negate();
  return axis;
}

// A copy of a two-wheel axle mesh keeping only the triangles on one side (shares the vertex data)
function sideGeometry(geometry, side) {
  const pos = geometry.attributes.position;
  const src = geometry.index ? geometry.index.array : [...Array(pos.count).keys()];
  const kept = [];
  for (let i = 0; i < src.length; i += 3) {
    const x = pos.getX(src[i]) + pos.getX(src[i + 1]) + pos.getX(src[i + 2]);
    if (Math.sign(x) === side) kept.push(src[i], src[i + 1], src[i + 2]);
  }
  const half = new THREE.BufferGeometry();
  for (const [key, attr] of Object.entries(geometry.attributes)) half.setAttribute(key, attr);
  half.setIndex(kept);
  return half;
}

function haloTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.05)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.25)');
  grad.addColorStop(0.62, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function radialGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
