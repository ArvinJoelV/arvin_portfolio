import * as THREE from 'three';
import { gsap } from 'gsap';

// Module-level variables
let container, canvas;
let scene, camera, renderer;
let particleSystem;
let cores = []; // Array to store our 3D cores
let activeCoreIndex = 0;

// Mouse tracking
const mouse = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0
};

// Initialize 3D Scene
export function init3D() {
  canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030303, 0.05);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 8;

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 1.5);
  dirLight1.position.set(5, 5, 5);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xab00ff, 1.2);
  dirLight2.position.set(-5, -5, 5);
  scene.add(dirLight2);

  const pointLight = new THREE.PointLight(0xff007f, 2, 20);
  pointLight.position.set(0, 0, 2);
  scene.add(pointLight);

  // Create Background Particles (Star field)
  createParticles();

  // Create 3D Cores for each section
  createCores();

  // Event Listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);

  // Start Animation Loop
  animate();
}

// Create Particle Field (Background)
function createParticles() {
  const particleCount = window.innerWidth < 768 ? 1000 : 2500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorCyan = new THREE.Color(0x00f0ff);
  const colorPurple = new THREE.Color(0xab00ff);
  const colorDark = new THREE.Color(0x1f1f2e);

  for (let i = 0; i < particleCount * 3; i += 3) {
    // Random position in a sphere/box
    positions[i] = (Math.random() - 0.5) * 35;
    positions[i + 1] = (Math.random() - 0.5) * 35;
    positions[i + 2] = (Math.random() - 0.5) * 25 - 5; // offset backward

    // Interpolate colors between cyan, purple, and dark grey
    const mixVal = Math.random();
    let mixedColor;
    if (mixVal < 0.45) {
      mixedColor = colorDark.clone().lerp(colorCyan, Math.random() * 0.5);
    } else if (mixVal < 0.9) {
      mixedColor = colorDark.clone().lerp(colorPurple, Math.random() * 0.5);
    } else {
      mixedColor = colorCyan.clone().lerp(colorPurple, Math.random());
    }

    colors[i] = mixedColor.r;
    colors[i + 1] = mixedColor.g;
    colors[i + 2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom round particle texture (Canvas drawn)
  const texture = createCircleTexture();

  const material = new THREE.PointsMaterial({
    size: 0.12,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
}

// Generate round soft glow texture for particles
function createCircleTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Create gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Create 3D Cores
function createCores() {
  // We'll create 4 distinct geometry configurations corresponding to sections:
  // 0: Hero -> Glowing detailed Sphere
  // 1: About -> Complex Torus Knot
  // 2: Projects -> Sharp Icosahedron
  // 3: Timeline & Contact -> Tall, rotating Octahedron / Double Pyramid
  
  const coreGeometries = [
    new THREE.IcosahedronGeometry(2, 2),                  // Hero (Detailed faceted Sphere)
    new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16),      // About (Complex flowing shape)
    new THREE.IcosahedronGeometry(1.8, 0),                  // Projects (Sharp low-poly crystal)
    new THREE.OctahedronGeometry(2.0, 0)                  // Timeline/Contact (Elegant diamond)
  ];

  const coreMaterials = [
    { wireColor: 0x00f0ff, solidColor: 0x002c30, activeColor: 0x00f0ff },
    { wireColor: 0xab00ff, solidColor: 0x240038, activeColor: 0xab00ff },
    { wireColor: 0xff007f, solidColor: 0x3b001d, activeColor: 0xff007f },
    { wireColor: 0x00f0ff, solidColor: 0x0b1f2e, activeColor: 0xab00ff }
  ];

  for (let i = 0; i < coreGeometries.length; i++) {
    const group = new THREE.Group();

    // 1. Wireframe Outer Mesh
    const wireMat = new THREE.MeshBasicMaterial({
      color: coreMaterials[i].wireColor,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const wireMesh = new THREE.Mesh(coreGeometries[i], wireMat);
    group.add(wireMesh);

    // 2. Solid Translucent Inner Core (giving it volume)
    const solidMat = new THREE.MeshPhongMaterial({
      color: coreMaterials[i].solidColor,
      transparent: true,
      opacity: 0.35,
      flatShading: true,
      shininess: 80,
      specular: 0xffffff
    });
    const solidMesh = new THREE.Mesh(coreGeometries[i], solidMat);
    group.add(solidMesh);

    // 3. Glowing Vertex Points
    const pointsMat = new THREE.PointsMaterial({
      color: coreMaterials[i].activeColor,
      size: 0.15,
      map: createCircleTexture(),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pointsMesh = new THREE.Points(coreGeometries[i], pointsMat);
    group.add(pointsMesh);

    // Set initial transform
    group.position.set(0, 0, 0);
    
    // Position offset for layout alignment (desktop vs mobile)
    alignCorePosition(group, i);

    // Hide cores that aren't the first one (Hero)
    if (i !== 0) {
      group.scale.set(0.001, 0.001, 0.001);
      group.visible = false;
    }

    scene.add(group);
    cores.push(group);
  }
}

// Position layout helper depending on screen size
function alignCorePosition(group, index) {
  const isDesktop = window.innerWidth >= 1024;
  
  if (isDesktop) {
    // On desktop, push it to the right half of the screen so text on left is readable
    group.position.x = 2.5;
    group.position.y = 0;
  } else {
    // On mobile, keep it centered but push it slightly back / up
    group.position.x = 0;
    group.position.y = 1.0; // above mobile hero copy
  }
}

// Transition between cores based on index
export function transitionToCore(index) {
  if (index === activeCoreIndex || index >= cores.length) return;

  const prevCore = cores[activeCoreIndex];
  const newCore = cores[index];

  activeCoreIndex = index;

  // 1. Shrink and Fade Out Previous Core
  gsap.to(prevCore.scale, {
    x: 0.001,
    y: 0.001,
    z: 0.001,
    duration: 1.0,
    ease: 'power3.inOut',
    onComplete: () => {
      prevCore.visible = false;
    }
  });

  // Rotate rapidly during transition out
  gsap.to(prevCore.rotation, {
    x: prevCore.rotation.x + 3,
    y: prevCore.rotation.y + 3,
    duration: 1.0,
    ease: 'power3.inOut'
  });

  // 2. Prepare and Reveal New Core
  newCore.visible = true;
  
  // Align positions in case window size changed
  alignCorePosition(newCore, index);

  gsap.fromTo(newCore.rotation, 
    { x: newCore.rotation.x - 3, y: newCore.rotation.y - 3 },
    { x: newCore.rotation.x, y: newCore.rotation.y, duration: 1.2, ease: 'power3.out' }
  );

  gsap.to(newCore.scale, {
    x: 1.0,
    y: 1.0,
    z: 1.0,
    duration: 1.2,
    ease: 'power3.out'
  });
}

// Track Mouse Movement for Parallax
function onMouseMove(event) {
  mouse.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouse.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
}

// Handle Window Resizing
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Re-align all core positions
  for (let i = 0; i < cores.length; i++) {
    alignCorePosition(cores[i], i);
  }
}

// Core animation loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth mouse parallax (lerp)
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Apply parallax to camera or scene
  if (scene) {
    scene.rotation.y = mouse.x * 0.15;
    scene.rotation.x = mouse.y * 0.15;
  }

  // Drift starfield particles
  if (particleSystem) {
    particleSystem.rotation.y += 0.0006;
    particleSystem.rotation.x += 0.0003;
    
    // Mouse interaction with particles
    particleSystem.position.x = mouse.x * 0.5;
    particleSystem.position.y = -mouse.y * 0.5;
  }

  // Rotate active central core
  if (cores[activeCoreIndex] && cores[activeCoreIndex].visible) {
    const activeCore = cores[activeCoreIndex];
    activeCore.rotation.y += 0.007;
    activeCore.rotation.x += 0.004;
    
    // Soft floating movement (sin wave)
    const elapsedTime = clock.getElapsedTime();
    activeCore.position.y = (window.innerWidth >= 1024 ? 0 : 1.0) + Math.sin(elapsedTime * 1.5) * 0.15;
  }

  renderer.render(scene, camera);
}

// Use Three.js Clock for delta timing
const clock = new THREE.Clock();
