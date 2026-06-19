import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  ShoppingBag, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  ChevronDown, 
  Volume2, 
  VolumeX, 
  Dribbble, 
  Maximize2,
  Trash2,
  CheckCircle,
  Cpu,
  Bookmark
} from 'lucide-react';
import { synth } from './utils/audio';

const PRODUCTS = [
  {
    id: 'aero',
    name: 'Aero Catalyst',
    price: 499,
    primaryColor: '#ff5500',
    lineColor: '#cc4400',
    accentColor: '#ffa166',
    roughness: 0.82,
    metalness: 0.12,
    clearcoat: 0.02,
    description: 'The definitive airless architecture. Highly-engineered elastomeric polymer finished in vibrant high-traction Aero Orange.',
    badge: 'First Edition Gen I'
  },
  {
    id: 'stealth',
    name: 'Stealth Matte',
    price: 499,
    primaryColor: '#0a0a0c',
    lineColor: '#1a1a22',
    accentColor: '#3b3b4f',
    roughness: 0.85,
    metalness: 0.25,
    clearcoat: 0.05,
    description: 'The archetype of advanced professional athletics. Finished in carbon-nano matte shell with deep obsidian rubber channel grooves.',
    badge: 'Enterprise Standard'
  },
  {
    id: 'platinum',
    name: 'Platin Elite',
    price: 549,
    primaryColor: '#8a9597',
    lineColor: '#1d2226',
    accentColor: '#ffffff',
    roughness: 0.45,
    metalness: 0.85,
    clearcoat: 0.15,
    description: 'Bespoke silver-platinum composite finish. Offers professional traction, weighted response, and stunning reflection properties.',
    badge: 'Bespoke Executive'
  },
  {
    id: 'aurum',
    name: 'Aurum Lux',
    price: 649,
    primaryColor: '#d4af37',
    lineColor: '#2b1a03',
    accentColor: '#ffd700',
    roughness: 0.5,
    metalness: 0.95,
    clearcoat: 0.2,
    description: 'Stately genuine gold-fused composite. Features supreme hand-traction pebbled ridges and deep ebony alignment grooves.',
    badge: 'Collector\'s Series'
  }
];

const drawHoneycombAlpha = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Fill black (representing transparent hollow holes)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Custom hexagon grid sizing for ideal proportion (smaller, more intricate cells)
  const hexRadius = 6.2; 
  const w = hexRadius * Math.sqrt(3);
  const h = hexRadius * 1.5;

  // First pass: Draw solid white filled hexagons (they touch/overlap, ensuring no weird gaps/holes in between lobes)
  ctx.fillStyle = '#ffffff';
  for (let y = -hexRadius * 2; y < canvas.height + hexRadius * 2; y += h) {
    const isOdd = Math.round(y / h) % 2 === 0;
    const xStart = isOdd ? -w / 2 : 0;
    for (let x = xStart - w; x < canvas.width + w * 2; x += w) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hX = x + Math.cos(angle) * hexRadius;
        const hY = y + Math.sin(angle) * hexRadius;
        if (i === 0) ctx.moveTo(hX, hY);
        else ctx.lineTo(hX, hY);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // Second pass: Draw smaller black hexagons to punch holes, leaving a pristine solid web
  ctx.fillStyle = '#000000';
  const innerRadius = hexRadius - 1.25; // beautiful structural nylon joints
  for (let y = -hexRadius * 2; y < canvas.height + hexRadius * 2; y += h) {
    const isOdd = Math.round(y / h) % 2 === 0;
    const xStart = isOdd ? -w / 2 : 0;
    for (let x = xStart - w; x < canvas.width + w * 2; x += w) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hX = x + Math.cos(angle) * innerRadius;
        const hY = y + Math.sin(angle) * innerRadius;
        if (i === 0) ctx.moveTo(hX, hY);
        else ctx.lineTo(hX, hY);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  // 3. Keep the actual basketball channels/seams fully solid white (so NO holes on the seams)
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#ffffff';

  // Equatorial seam
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Vertical meridian grooves
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, 0);
  ctx.lineTo(canvas.width * 0.25, canvas.height);
  ctx.moveTo(canvas.width * 0.75, 0);
  ctx.lineTo(canvas.width * 0.75, canvas.height);
  ctx.stroke();

  // Curved wavy seams
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 + Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord);
    else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 - Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord);
    else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();

  return canvas;
};

const drawBaseColor = (primary: string, line: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Solid color composite base
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Generate detailed 3D printed SLS layer line striations (horizontal micro-layers)
  // Our canvas height is 512, width is 1024.
  for (let y = 0; y < canvas.height; y += 2) {
    // shadow streak with organic laser-sintering noise
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.09 + Math.random() * 0.07; 
    ctx.fillRect(0, y, canvas.width, 1);

    // highlight streak
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.03 + Math.random() * 0.05; 
    ctx.fillRect(0, y + 1, canvas.width, 1);
  }
  ctx.globalAlpha = 1.0;

  // 3. Draw standard premium basketball seams (channel grooves)
  ctx.lineWidth = 14;
  ctx.strokeStyle = line;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Equator
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  // Meridian
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, 0);
  ctx.lineTo(canvas.width * 0.25, canvas.height);
  ctx.moveTo(canvas.width * 0.75, 0);
  ctx.lineTo(canvas.width * 0.75, canvas.height);
  ctx.stroke();

  // Sines
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 + Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord);
    else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 - Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord);
    else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();

  // Highlight recessed edges to simulate leather seam channels
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.25, 0); ctx.lineTo(canvas.width * 0.25, canvas.height);
  ctx.moveTo(canvas.width * 0.75, 0); ctx.lineTo(canvas.width * 0.75, canvas.height); ctx.stroke();
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 + Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord); else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x++) {
    const u = x / canvas.width;
    const yCoord = canvas.height / 2 - Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
    if (x === 0) ctx.moveTo(x, yCoord); else ctx.lineTo(x, yCoord);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  return canvas;
};

export default function App() {
  const [activeProduct, setActiveProduct] = useState(PRODUCTS[0]);
  const [customBallConfig, setCustomBallConfig] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // DOM elements references
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Use current product configuration
  const currentDesign = customBallConfig || activeProduct;

  // Real-time refs to synchronize high-frequency state with the single-mount render loop
  const designRef = useRef(currentDesign);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    designRef.current = currentDesign;
  }, [currentDesign]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Keep references to specific WebGL elements for dynamic patching of material properties
  const ballMeshRef = useRef<THREE.Mesh | null>(null);
  const ballMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const innerLightRef = useRef<THREE.PointLight | null>(null);
  const innerCoreMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const accentPointLightRef = useRef<THREE.PointLight | null>(null);
  const baseTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price, 0);

  // Sound Wrappers
  const handleHover = () => {
    if (!isMuted) synth.playHover();
  };

  const handleClick = () => {
    if (!isMuted) synth.playClick();
  };

  const handleAddToCart = () => {
    const item = {
      id: Date.now(),
      name: currentDesign.name || activeProduct.name,
      price: currentDesign.price || activeProduct.price,
      primaryColor: currentDesign.primaryColor,
      accentColor: currentDesign.accentColor,
      badge: currentDesign.badge || 'AI Edition',
    };
    setCart([...cart, item]);
    setIsCartOpen(true);
    if (!isMuted) synth.playSuccess();
  };

  // Toggle Mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Setup Three.js interactive scene exactly ONCE on mount to ensure maximum frame rate and avoid memory leaks
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const container = canvasContainerRef.current;
    
    // Scene & Renderer
    const scene = new THREE.Scene();
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.5, 6.5);

    // Dynamic Fog & Background color to set a pristine cinematic full black space
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.08);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 12;
    controls.minDistance = 3.5;
    controls.enablePan = false;
    controls.enableZoom = false; // Prevent blocking page scroll
    controls.autoRotate = false;
    controls.autoRotateSpeed = 1.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera rotating under the floor
    controls.minPolarAngle = Math.PI / 4;        // Lock in ideal visual isometric slope

    // Create the base map texture. We will paint and update this canvas dynamically on config change.
    const initialDesign = designRef.current;
    const baseCanvas = drawBaseColor(initialDesign.primaryColor, initialDesign.lineColor);
    const baseTexture = new THREE.CanvasTexture(baseCanvas);
    baseTexture.wrapS = THREE.RepeatWrapping;
    baseTexture.wrapT = THREE.RepeatWrapping;
    baseTextureRef.current = baseTexture;

    // Create procedural honeycomb alpha texture to clip transparent airless gaps
    const alphaCanvas = drawHoneycombAlpha();
    const alphaTexture = new THREE.CanvasTexture(alphaCanvas);
    alphaTexture.wrapS = THREE.RepeatWrapping;
    alphaTexture.wrapT = THREE.RepeatWrapping;

    // Create the premium hollow-lattice basketball mesh using highly detailed MeshPhysicalMaterial
    const ballGeometry = new THREE.SphereGeometry(1.6, 80, 80);

    // OUTER SHELL: FrontSide only with pristine clearcoat glaze, showing 3D printed micro-ridges
    const outerMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialDesign.primaryColor),
      map: baseTexture,
      bumpMap: baseTexture,
      bumpScale: 0.04, // Pristine horizontal print SLS line layers look
      alphaMap: alphaTexture,
      transparent: true,
      alphaTest: 0.38, // Discard fully black pixels to render pristine airless holes
      side: THREE.FrontSide, 
      roughness: initialDesign.roughness,
      metalness: initialDesign.metalness,
      clearcoat: initialDesign.clearcoat,
      clearcoatRoughness: 0.25,
    });
    ballMaterialRef.current = outerMaterial;

    // INNER CAVITY: BackSide only with 0.0 shininess, rough, and shadowy velvety dark tone
    const innerMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(initialDesign.primaryColor).clone().multiplyScalar(0.48), // shadow darkened inside
      map: baseTexture,
      bumpMap: baseTexture,
      bumpScale: 0.04,
      alphaMap: alphaTexture,
      transparent: true,
      alphaTest: 0.38,
      side: THREE.BackSide, // BackSide ONLY renders inner shell walls!
      roughness: 1.0, // High roughness: completely non-shiny printed interior!
      metalness: 0.0, // No metalness
      clearcoat: 0.0, // No clearcoat shine
      clearcoatRoughness: 1.0,
    });

    const ballMesh = new THREE.Mesh(ballGeometry, outerMaterial);
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;

    // Add inner mesh inside the outer ball mesh so they transform in perfect unison
    const innerMesh = new THREE.Mesh(ballGeometry, innerMaterial);
    innerMesh.castShadow = true;
    innerMesh.receiveShadow = true;
    ballMesh.add(innerMesh);

    ballMeshRef.current = ballMesh;
    scene.add(ballMesh);

    // High-tech Exhibit Podium Cylinder resting underneath the sphere at the start (Center, Level 1)
    const podiumGeometry = new THREE.CylinderGeometry(1.4, 1.55, 2.5, 32);
    const podiumMaterial = new THREE.MeshStandardMaterial({
      color: 0x111317,
      roughness: 0.3,
      metalness: 0.90,
    });
    const podiumMesh = new THREE.Mesh(podiumGeometry, podiumMaterial);
    podiumMesh.position.set(0, -2.4, 0); // Center tallest podium
    podiumMesh.castShadow = true;
    podiumMesh.receiveShadow = true;
    scene.add(podiumMesh);

    // Left lower Exhibit Podium (Level 2)
    const leftPodiumMesh = new THREE.Mesh(podiumGeometry, podiumMaterial);
    leftPodiumMesh.position.set(-1.8, -2.85, -0.4); // Close and clearly visible as a stepped tiered level
    leftPodiumMesh.castShadow = true;
    leftPodiumMesh.receiveShadow = true;
    scene.add(leftPodiumMesh);

    // Right lower Exhibit Podium (Level 3)
    const rightPodiumMesh = new THREE.Mesh(podiumGeometry, podiumMaterial);
    rightPodiumMesh.position.set(1.8, -3.3, -0.4); // Lowest stepped tier
    rightPodiumMesh.castShadow = true;
    rightPodiumMesh.receiveShadow = true;
    scene.add(rightPodiumMesh);

    // Glowing orange backlit ring atop the main center podium
    const ringGeometry = new THREE.TorusGeometry(1.4, 0.035, 16, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xff5500, // Vibrant orange matching branding accents
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -1.14, 0);
    scene.add(ringMesh);

    // Dimmer orange backlit rings for the side levels
    const sideRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xaa3a00, // less bright orange backlight
      transparent: true,
      opacity: 0.55
    });

    const leftRingMesh = new THREE.Mesh(ringGeometry, sideRingMaterial);
    leftRingMesh.rotation.x = Math.PI / 2;
    leftRingMesh.position.set(-1.8, -1.59, -0.4);
    scene.add(leftRingMesh);

    const rightRingMesh = new THREE.Mesh(ringGeometry, sideRingMaterial);
    rightRingMesh.rotation.x = Math.PI / 2;
    rightRingMesh.position.set(1.8, -2.04, -0.4);
    scene.add(rightRingMesh);

    // Matte dark studio floor (absorbs harsh reflections to prevent blinding white glaring bottom halves)
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x010102,
      roughness: 0.90, // Soft matte surface
      metalness: 0.0,  // Non-metallic prevents reflective white mirror glare completely
    });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.25;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Soft Studio ambient layout light so dark edges are readable
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
    scene.add(ambientLight);

    // Dynamic Tracking Cinematic Follow Spotlight
    const followSpotLight = new THREE.SpotLight(0xffffff, 35, 25, Math.PI * 0.18, 0.6, 0.85);
    followSpotLight.castShadow = true;
    followSpotLight.shadow.mapSize.width = 1024;
    followSpotLight.shadow.mapSize.height = 1024;
    followSpotLight.shadow.bias = -0.0004;
    scene.add(followSpotLight);

    // Highlight light accent
    const accentPointLight = new THREE.PointLight(new THREE.Color(initialDesign.accentColor), 4, 15);
    accentPointLight.position.set(-6, -1, 4);
    accentPointLightRef.current = accentPointLight;
    scene.add(accentPointLight);

    // Click impulse animation state
    let spinVelocity = 0;
    let verticalHopHeight = 0;
    let hopVelocity = 0;
    let idleAngle = 0;

    // Checkpoint targeted parameters for scrolling
    let targetBallX = 0;
    let targetBallY = 0.5;
    let targetBallZ = 0;
    let targetBallRotY = 0;
    let targetSlideFactor = 0;

    // Smooth render parameters
    let currentBallX = 0;
    let currentBallY = 0.5;
    let currentBallZ = 0;
    let currentBallRotY = 0;
    let currentSlideFactor = 0;

    // Handle viewport scrolling checkpoints based on section progress
    const onScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollHeight > 0 ? scrollY / scrollHeight : 0;

      // Section 1: Hero Centered [0.0 - 0.25]
      if (scrollPercent <= 0.25) {
        const factor = scrollPercent / 0.25;
        targetBallX = 0;
        targetBallY = THREE.MathUtils.lerp(0.5, 0.35, factor);
        targetBallZ = 0;
        targetBallRotY = THREE.MathUtils.lerp(0, Math.PI, factor);
        targetSlideFactor = Math.min(scrollPercent / 0.24, 1.0);
      } 
      // Section 2: Detailed Specs / Move Left [0.25 - 0.55]
      else if (scrollPercent <= 0.55) {
        const factor = (scrollPercent - 0.25) / 0.3;
        targetBallX = THREE.MathUtils.lerp(0, -2.4, factor);
        targetBallY = THREE.MathUtils.lerp(0.35, 0.1, factor);
        targetBallZ = THREE.MathUtils.lerp(0, 0.5, factor);
        targetBallRotY = THREE.MathUtils.lerp(Math.PI, -Math.PI * 1.5, factor);
        targetSlideFactor = 1.0;
      }
      // Section 3: Hollow detail closeup / Move Center-Right [0.55 - 0.8]
      else if (scrollPercent <= 0.8) {
        const factor = (scrollPercent - 0.55) / 0.25;
        targetBallX = THREE.MathUtils.lerp(-2.4, 2.6, factor);
        targetBallY = THREE.MathUtils.lerp(0.1, -0.1, factor);
        targetBallZ = THREE.MathUtils.lerp(0.5, 0.8, factor);
        targetBallRotY = THREE.MathUtils.lerp(-Math.PI * 1.5, Math.PI * 2, factor);
        targetSlideFactor = 1.0;
      }
      // Section 4: Acquisition Portal / Move Right & stable [0.8 - 1.0]
      else {
        const factor = (scrollPercent - 0.8) / 0.2;
        targetBallX = THREE.MathUtils.lerp(2.6, 2.4, factor);
        targetBallY = THREE.MathUtils.lerp(-0.1, 0.2, factor);
        targetBallZ = THREE.MathUtils.lerp(0.8, 0.5, factor);
        targetBallRotY = THREE.MathUtils.lerp(Math.PI * 2, Math.PI * 2.8, factor);
        targetSlideFactor = 1.0;
      }
    };

    window.addEventListener('scroll', onScroll);

    // Satisfying Click/Touch interactive Raycasting specifically on the ball Mesh
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Satisfying mouse click-to-hop/bounce interaction specifically on ballMesh intersections
    let startX = 0;
    let startY = 0;
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
    };
    const onMouseUp = (e: MouseEvent) => {
      const diffX = Math.abs(e.clientX - startX);
      const diffY = Math.abs(e.clientY - startY);
      
      // Quick click action with no dragging allows OrbitControl rotation to be completely separate
      if (diffX < 6 && diffY < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ballMesh);

        if (intersects.length > 0) {
          // Boost centrifugal spins and apply satisfying elastic hop
          spinVelocity = 0.22;
          if (hopVelocity === 0) {
            hopVelocity = 0.15;
          }
          if (!isMutedRef.current) {
            synth.playClick();
          }
        }
      }
    };

    // Mobile/tablet touch interactions
    let startTouchX = 0;
    let startTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startTouchX = e.touches[0].clientX;
        startTouchY = e.touches[0].clientY;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const diffX = Math.abs(e.changedTouches[0].clientX - startTouchX);
        const diffY = Math.abs(e.changedTouches[0].clientY - startTouchY);
        if (diffX < 6 && diffY < 6) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((e.changedTouches[0].clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.changedTouches[0].clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(ballMesh);

          if (intersects.length > 0) {
            spinVelocity = 0.22;
            if (hopVelocity === 0) {
              hopVelocity = 0.15;
            }
            if (!isMutedRef.current) {
              synth.playClick();
            }
          }
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    // Standard resize handler using robust ResizeObserver as per guidelines
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    
    resizeObserver.observe(container);

    // Anim loop
    let reqFrameId: number;

    const animate = () => {
      reqFrameId = requestAnimationFrame(animate);

      // Interpolate parameters smoothly to avoid jarring shifts on selection changes
      const design = designRef.current;
      const ballMaterial = ballMaterialRef.current;
      if (ballMaterial) {
        const targetColor = new THREE.Color(design.primaryColor);
        ballMaterial.color.lerp(targetColor, 0.08);
        ballMaterial.roughness = THREE.MathUtils.lerp(ballMaterial.roughness, design.roughness, 0.08);
        ballMaterial.metalness = THREE.MathUtils.lerp(ballMaterial.metalness, design.metalness, 0.08);
        ballMaterial.clearcoat = THREE.MathUtils.lerp(ballMaterial.clearcoat, design.clearcoat || 0.0, 0.08);

        // Dynamically keep inner cavity baseColor matching but dark & non-shiny
        if (ballMeshRef.current && ballMeshRef.current.children.length > 0) {
          const innerChildMesh = ballMeshRef.current.children[0] as THREE.Mesh;
          const innerMat = innerChildMesh.material as THREE.MeshPhysicalMaterial;
          if (innerMat) {
            const innerTargetColor = targetColor.clone().multiplyScalar(0.48);
            innerMat.color.lerp(innerTargetColor, 0.08);
            innerMat.roughness = 1.0; // keep inner surface strictly matte
            innerMat.metalness = 0.0;
            innerMat.clearcoat = 0.0;
          }
        }
      }

      if (accentPointLight) {
        accentPointLight.color.lerp(new THREE.Color(design.accentColor), 0.08);
      }

      // Smooth cinematic scrolling checkpoints interpolation (keeps scroll transitions buttery and handles speed limits)
      const scrollLerpSpeed = 0.045;
      currentBallX = THREE.MathUtils.lerp(currentBallX, targetBallX, scrollLerpSpeed);
      currentBallY = THREE.MathUtils.lerp(currentBallY, targetBallY, scrollLerpSpeed);
      currentBallZ = THREE.MathUtils.lerp(currentBallZ, targetBallZ, scrollLerpSpeed);
      currentBallRotY = THREE.MathUtils.lerp(currentBallRotY, targetBallRotY, scrollLerpSpeed);
      currentSlideFactor = THREE.MathUtils.lerp(currentSlideFactor, targetSlideFactor, scrollLerpSpeed);

      // Slide center podium & main glowing ring
      podiumMesh.position.x = THREE.MathUtils.lerp(0, 10, currentSlideFactor);
      podiumMesh.position.y = THREE.MathUtils.lerp(-2.4, -6.0, currentSlideFactor);
      ringMesh.position.x = THREE.MathUtils.lerp(0, 10, currentSlideFactor);
      ringMesh.position.y = THREE.MathUtils.lerp(-1.14, -4.74, currentSlideFactor);

      // Slide left tiered step & dim ring
      leftPodiumMesh.position.x = THREE.MathUtils.lerp(-1.8, -12.0, currentSlideFactor);
      leftPodiumMesh.position.y = THREE.MathUtils.lerp(-2.85, -6.0, currentSlideFactor);
      leftRingMesh.position.x = THREE.MathUtils.lerp(-1.8, -12.0, currentSlideFactor);
      leftRingMesh.position.y = THREE.MathUtils.lerp(-1.59, -4.74, currentSlideFactor);

      // Slide right tiered step & dim ring
      rightPodiumMesh.position.x = THREE.MathUtils.lerp(1.8, 12.0, currentSlideFactor);
      rightPodiumMesh.position.y = THREE.MathUtils.lerp(-3.3, -6.0, currentSlideFactor);
      rightRingMesh.position.x = THREE.MathUtils.lerp(1.8, 12.0, currentSlideFactor);
      rightRingMesh.position.y = THREE.MathUtils.lerp(-2.04, -4.74, currentSlideFactor);

      // Direct tracking Follow Spotlight at the ball
      followSpotLight.position.set(currentBallX + 1.5, currentBallY + verticalHopHeight + 5.5, currentBallZ + 2.5);
      followSpotLight.target = ballMesh;

      // 1. Decelerate custom click-spin velocity & update rotation angles
      if (spinVelocity > 0.002) {
        idleAngle += spinVelocity;
        spinVelocity *= 0.95; // decay 5% per frame
      } else {
        idleAngle += 0.003; // natural idle rotation
      }
      ballMesh.rotation.y = currentBallRotY + idleAngle;

      // 2. Perform smooth physical vertical hop/bounce
      if (hopVelocity !== 0 || verticalHopHeight > 0) {
        hopVelocity -= 0.007; // simulated gravity acceleration
        verticalHopHeight += hopVelocity;
        
        if (verticalHopHeight <= 0) {
          verticalHopHeight = 0;
          
          // Re-trigger visual squish on floor impact
          if (Math.abs(hopVelocity) > 0.02) {
            ballMesh.scale.set(1.08, 0.91, 1.08); // micro elastomeric squish
            if (!isMutedRef.current) {
              synth.playImpact(Math.abs(hopVelocity) * 1.5);
            }
          }
          
          // Reverse rebound with energy loss
          hopVelocity = -hopVelocity * 0.45;
          if (Math.abs(hopVelocity) < 0.015) {
            hopVelocity = 0;
          }
        }
      }

      // Recover squish scale smoothly
      ballMesh.scale.x = THREE.MathUtils.lerp(ballMesh.scale.x, 1, 0.15);
      ballMesh.scale.y = THREE.MathUtils.lerp(ballMesh.scale.y, 1, 0.15);
      ballMesh.scale.z = THREE.MathUtils.lerp(ballMesh.scale.z, 1, 0.15);

      // Update position continuously to include both scroll and dynamic vertical click hops
      ballMesh.position.set(currentBallX, currentBallY + verticalHopHeight, currentBallZ);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Initial positioning calibration
    onScroll();

    // Clean up Three environment flawlessly on unmount
    return () => {
      cancelAnimationFrame(reqFrameId);
      window.removeEventListener('scroll', onScroll);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      resizeObserver.disconnect();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      ballGeometry.dispose();
      outerMaterial.dispose();
      innerMaterial.dispose();
      baseTexture.dispose();
      alphaTexture.dispose();
      podiumGeometry.dispose();
      podiumMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      sideRingMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  // Update procedural canvas texture MAP dynamically on state transition (colors, lines)
  useEffect(() => {
    if (!baseTextureRef.current) return;

    const texture = baseTextureRef.current;
    const canvas = texture.image as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const design = customBallConfig || activeProduct;

    // Clear and fill base color
    ctx.fillStyle = design.primaryColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Generate detailed 3D printed SLS layer line striations (horizontal micro-layers) so dynamically chosen colors look exact
    for (let y = 0; y < canvas.height; y += 2) {
      // shadow streak
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.14; 
      ctx.fillRect(0, y, canvas.width, 1);

      // highlight streak
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.08; 
      ctx.fillRect(0, y + 1, canvas.width, 1);
    }
    ctx.globalAlpha = 1.0;

    // Channels / Grooves
    ctx.lineWidth = 6;
    ctx.strokeStyle = design.lineColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Equator
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Meridian
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.25, 0);
    ctx.lineTo(canvas.width * 0.25, canvas.height);
    ctx.moveTo(canvas.width * 0.75, 0);
    ctx.lineTo(canvas.width * 0.75, canvas.height);
    ctx.stroke();

    // Sines
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x++) {
      const u = x / canvas.width;
      const yCoord = canvas.height / 2 + Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
      if (x === 0) ctx.moveTo(x, yCoord);
      else ctx.lineTo(x, yCoord);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x++) {
      const u = x / canvas.width;
      const yCoord = canvas.height / 2 - Math.sin(u * Math.PI * 2) * (canvas.height * 0.23);
      if (x === 0) ctx.moveTo(x, yCoord);
      else ctx.lineTo(x, yCoord);
    }
    ctx.stroke();

    texture.needsUpdate = true;
  }, [activeProduct, customBallConfig]);

  return (
    <div className="relative min-h-screen bg-[#06070a] text-gray-200 overflow-x-hidden selection:bg-[#FF5500] selection:text-black">
      {/* Premium Backlit Ambient Glow Orbs */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[65vw] h-[65vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-tr from-[#1e293b]/25 to-transparent blur-[140px] pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute top-[40%] left-[10%] w-[45vw] h-[45vw] max-w-[650px] rounded-full bg-[#FF5500]/4 blur-[160px] pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute top-[75%] right-[5%] w-[50vw] h-[50vw] max-w-[750px] rounded-full bg-[#3b82f6]/5 blur-[170px] pointer-events-none z-0" />

      {/* 3D Viewport Stick Container (Fills background completely with dynamic parallax layers) */}
      <div 
        ref={canvasContainerRef}
        className="fixed inset-0 w-screen h-screen pointer-events-auto z-10"
        style={{ pointerEvents: 'none' }}
      />

      {/* Floating Audio & Preset controls */}
      <div className="fixed top-8 right-8 z-[60] flex items-center gap-4">
        <button 
          onClick={toggleMute}
          onMouseEnter={handleHover}
          className="p-3 bg-black/60 hover:bg-black/90 border border-white/10 rounded-full text-white backdrop-blur-md transition-all duration-300 pointer-events-auto"
          title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button 
          onClick={() => setIsCartOpen(true)}
          onMouseEnter={handleHover}
          className="relative p-3 bg-black/60 hover:bg-black/90 border border-white/10 rounded-full text-white backdrop-blur-md transition-all duration-300 pointer-events-auto"
        >
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white leading-none">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* HEADER / NAVIGATION OVERLAY */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-8 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
            <Dribbble className="text-black w-6 h-6 animate-pulse" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-white text-xl tracking-[0.15em]">SLAM</span>
            <span className="font-display font-medium text-gray-500 text-sm tracking-[0.2em]">AIRLESS</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-12 pointer-events-auto text-xs uppercase tracking-[0.2em] font-mono">
          <a href="#engineered" className="hover:text-white transition-colors duration-300">Engineering</a>
          <a href="#acquire" className="hover:text-white transition-colors duration-300">Acquire</a>
        </div>
      </nav>

      {/* SECTION 1: HERO VIEW [100vh] */}
      <section className="relative h-screen w-full flex flex-col justify-between items-center px-6 md:px-16 pt-[25vh] pb-12 pointer-events-none z-20">
        <div className="text-center space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-white tracking-widest uppercase">
            <Sparkles size={11} className="text-[#FF5500] animate-spin [animation-duration:6s]" /> First Generation Airless Basketball
          </div>
          <h1 className="font-display font-black text-5xl md:text-8xl text-white tracking-tight uppercase leading-[0.9]">
            A LATTICE <br className="md:hidden" /> REVOLUTION
          </h1>
          <p className="text-sm font-mono text-gray-400 tracking-[0.1em] uppercase">
            3D-Printed Generation 1. No inflation. Infinite rebounds.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <span className="text-[9px] font-mono text-white/50 tracking-[0.3em] uppercase">Scroll to explore</span>
          <ChevronDown size={14} className="text-white fill-white animate-bounce" />
        </div>
      </section>

      {/* SECTION 2: SPEC BLUEPRINT [100vh] */}
      <section id="engineered" className="min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-20 relative z-20 pointer-events-none">
        <div className="w-full md:w-5/12 space-y-8 pl-4 md:pl-0 pointer-events-auto text-left">
          <div className="space-y-3">
            <span className="text-xs font-mono text-white/50 tracking-[0.2em] uppercase">BLUEPRINT DIAGNOSTIC</span>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white leading-none tracking-tight">
              AERODYNAMIC <br />PERFECTION
            </h2>
          </div>
          
          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            The airless basketball features a highly complex structural honeycomb lattice, allowing air to pass freely through the sphere rather than compressing. Air drag is significantly cut down while maintaining exact flight path trajectory.
          </p>

          <div className="border-t border-white/10 pt-8 grid grid-cols-2 gap-8 max-w-md">
            <div>
              <div className="text-3xl font-display text-white font-black">510g</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Total Mass Spec</div>
            </div>
            <div>
              <div className="text-3xl font-display text-white font-black">99.8%</div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Bounce Consistency</div>
            </div>
          </div>
        </div>
        
        {/* Invisible right margin to allow Three.js centered object to look offset */}
        <div className="w-full md:w-[45%]" />
      </section>

      {/* SECTION 3: HONEYCOMB DETAILS [100vh] */}
      <section className="min-h-screen w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-20 relative z-20 pointer-events-none">
        <div className="w-full md:w-[45%]" />

        <div className="w-full md:w-5/12 space-y-8 pr-4 md:pr-0 pointer-events-auto text-left">
          <div className="space-y-3">
            <span className="text-xs font-mono text-white/50 tracking-[0.2em] uppercase">STRUCTURAL DENSITIES</span>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white leading-none tracking-tight">
              CUSTOM LATTICE<br />GRID
            </h2>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed max-w-md">
            With standard spheres, micro-fissures and thermal expanding can limit rebound consistency. Slams custom honeycomb lobes deploy elastomeric nodes built with military-grade polymers. Spherically perfect curves.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center shrink-0">
                <Sliders size={18} className="text-[#FF5500]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">120 Lobe Segments</h4>
                <p className="text-xs text-gray-400">Precisely engineered structural vertices to disperse energy uniformly upon court contact.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-white/20 rounded-full flex items-center justify-center shrink-0">
                <Maximize2 size={18} className="text-[#FF5500]" />
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">Official 29.5" Spec</h4>
                <p className="text-xs text-gray-400">Meets exact outer diameter standards. Designed for pristine grip, shot release, and flight spin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CORPORATE CATALOG & ACQUISITION PORTAL */}
      <section id="acquire" className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-20 relative z-20 pointer-events-none bg-gradient-to-t from-black via-[#06070a]/90 to-transparent">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pointer-events-auto">
          {/* Options / Purchase panel */}
          <div className="space-y-8 bg-black/60 border border-white/10 p-8 md:p-10 rounded-3xl backdrop-blur-lg">
            <div className="space-y-3 text-left">
              <span className="text-xs font-mono text-[#FF5500] tracking-widest uppercase">OFFICIAL PROCUREMENT PORTAL</span>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-white tracking-tight leading-none">
                ACQUISITION
              </h2>
              <p className="text-xs text-gray-400">Secure authentic first-edition airless sports spheres. Selected composites are hand-numbered and calibrated directly for execution delivery.</p>
            </div>

            <div className="space-y-6 text-left">
              {/* Built-in editions */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Select Premium Edition</span>
                <div className="grid grid-cols-2 gap-3">
                  {PRODUCTS.map(p => (
                    <button 
                      key={p.id}
                      onClick={() => {
                        handleClick();
                        setCustomBallConfig(null);
                        setActiveProduct(p);
                      }}
                      onMouseEnter={handleHover}
                      className={`p-3 rounded border text-left transition-all ${(!customBallConfig && activeProduct.id === p.id) ? 'border-[#FF5500] bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="text-[10px] font-bold text-white uppercase">{p.name}</div>
                      <div className="text-xs font-mono text-gray-400 mt-1">${p.price}</div>
                    </button>
                  ))}
                </div>
              </div>



              {/* Specs Brief */}
              <div className="p-4 rounded-xl border border-white/5 bg-[#020204]/60 relative overflow-hidden">
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mb-2">Specifications summary</div>
                <h3 className="text-white text-lg font-bold font-display">{currentDesign.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">{currentDesign.description}</p>
              </div>
            </div>

            {/* Total purchase section */}
            <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest block">Total investment</span>
                <span className="text-white text-4xl font-display font-light">${currentDesign.price || '599'}</span>
              </div>
              <button 
                onClick={handleAddToCart}
                onMouseEnter={handleHover}
                className="w-full md:w-auto px-10 py-4 bg-[#FF5500] text-white font-bold text-xs tracking-widest uppercase rounded-sm border border-[#FF5500] hover:bg-white hover:text-black hover:border-white shadow-glow transition-all duration-300 interactive active:scale-95"
              >
                Acquire Sphere
              </button>
            </div>
          </div>

          {/* Technical Diagnostics / Right Column */}
          <div className="space-y-12 pl-4 lg:pl-10 text-left">
            <div className="space-y-4">
              <span className="text-xs font-mono text-[#FF5500] tracking-widest uppercase">Blueprints Specifications</span>
              <h3 className="font-display font-black text-3xl md:text-5xl text-white uppercase leading-none">
                3D PRINTING <br />STANDARDS
              </h3>
            </div>

            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Additive Architecture</div>
                <p className="text-sm text-gray-300">Continuous Liquid Interface Production (CLIP). Built completely loop-seamless with no weld-lines.</p>
              </div>

              <div className="border-b border-white/10 pb-4">
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Elastomeric Matrix</div>
                <p className="text-sm text-gray-300">Specially formulated poly-elastic binder offering 99.8% bounce retention. True rebounding response.</p>
              </div>

              <div>
                <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">Aerodynamic Flow</div>
                <p className="text-sm text-gray-300">8 panel boundaries engineered symmetrically. Tested thoroughly inside specialized wind tunnels.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOPPING CART DRAW PANEL */}
      <div 
        className={`fixed inset-0 z-50 transition-opacity duration-300 p-0 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
        <div 
          className={`absolute top-0 right-0 h-full w-full md:w-[480px] bg-[#0c0c0e] border-l border-white/10 flex flex-col justify-between shadow-2xl transition-transform duration-500 transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display font-black text-white text-2xl tracking-[0.1em]">YOUR CART</h2>
            <button 
              onClick={() => { handleClick(); setIsCartOpen(false); }}
              onMouseEnter={handleHover}
              className="text-gray-400 hover:text-white text-xs font-mono uppercase tracking-[0.2em] border border-white/10 px-3 py-1.5 rounded hover:bg-white/5 transition-all interactive"
            >
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <ShoppingBag size={24} className="text-gray-400" />
                </div>
                <h4 className="text-white text-sm font-bold uppercase tracking-wider">Your Cart is Empty</h4>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">Select one of our premium airless designs or calibrate a customized edition in the laboratory to checkout.</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={item.id} className="flex gap-4 p-4 border border-white/5 bg-white/2 rounded-2xl relative overflow-hidden group">
                  <div className="w-16 h-16 bg-[#020204] rounded-xl flex items-center justify-center border border-white/5 shrink-0">
                    <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: item.primaryColor, border: `2px solid ${item.lineColor}` }} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-white font-bold text-sm tracking-wide">{item.name}</h4>
                        <span className="text-[9px] font-mono text-[#FF5500] uppercase tracking-wider">{item.badge}</span>
                      </div>
                      <button 
                        onClick={() => {
                          handleClick();
                          setCart(cart.filter((_, i) => i !== idx));
                        }}
                        className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded transition-all duration-300 interactive"
                        title="Remove segment"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>



                    <div className="flex justify-between items-center pt-2">
                      <span className="text-white font-mono text-sm font-bold">${item.price}</span>
                      <span className="text-[10px] text-green-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <CheckCircle size={10} /> Certified
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-8 border-t border-white/10 bg-black/60 backdrop-blur-md space-y-6">
              <div className="flex justify-between items-center font-mono">
                <span className="text-gray-400 text-xs tracking-wider uppercase">SUBTOTAL</span>
                <span className="text-white text-3xl font-display font-light">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={() => {
                  handleClick();
                  alert("Thank you for your order! Checkout process completed.");
                  setCart([]);
                  setIsCartOpen(false);
                  if (!isMuted) synth.playSuccess();
                }}
                className="w-full py-4 bg-[#FF5500] hover:bg-white text-white hover:text-black font-bold text-sm tracking-[0.2em] uppercase rounded-sm border border-[#FF5500] hover:border-white shadow-glow transition-all duration-300 interactive"
              >
                PROCEED TO CHECKOUT
              </button>
              <div className="text-center text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                FREE COMPOSITE SHIPPING WORLDWIDE
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
