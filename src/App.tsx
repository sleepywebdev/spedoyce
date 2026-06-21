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
  Bookmark,
  CreditCard,
  Terminal,
  Key,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Code,
  BookOpen
} from 'lucide-react';
import { synth } from './utils/audio';

const PRODUCTS = [
  {
    id: 'aero',
    name: 'Aero Catalyst',
    price: 199,
    primaryColor: '#ff5500',
    lineColor: '#cc4400',
    accentColor: '#ffa166',
    roughness: 0.82,
    metalness: 0.12,
    clearcoat: 0.02,
    description: 'The definitive airless architecture.',
    badge: 'First Edition Gen I'
  },
  {
    id: 'stealth',
    name: 'Stealth Matte',
    price: 199,
    primaryColor: '#0a0a0c',
    lineColor: '#1a1a22',
    accentColor: '#3b3b4f',
    roughness: 0.85,
    metalness: 0.25,
    clearcoat: 0.05,
    description: 'The archetype of advanced professional athletics.',
    badge: 'Enterprise Standard'
  },
  {
    id: 'platinum',
    name: 'Platin Elite',
    price: 199,
    primaryColor: '#8a9597',
    lineColor: '#1d2226',
    accentColor: '#ffffff',
    roughness: 0.45,
    metalness: 0.85,
    clearcoat: 0.15,
    description: 'Bespoke silver-platinum finish. (Coming Soon)',
    badge: 'Bespoke Executive'
  },
  {
    id: 'aurum',
    name: 'Aurum Lux',
    price: 199,
    primaryColor: '#d4af37',
    lineColor: '#2b1a03',
    accentColor: '#ffd700',
    roughness: 0.5,
    metalness: 0.95,
    clearcoat: 0.2,
    description: 'Stately custom metallic finish. (Coming Soon)',
    badge: 'Collector\'s Series'
  }
];

const drawHoneycombAlpha = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Fill background with solid white (representing the solid lattice structure of the basketball)
  // This automatically fills all "circular trianglish holes in between green/black spaces",
  // leaving only the intended outer circle apertures as actual hollow holes.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Define standard triangular/hexagonal grid coordinates with seamless horizontal wrap.
  // To prevent any visible "vertical seam alignment overlap mismatch" where the left edge joins the right edge:
  // We MUST ensure the width of the canvas is an exact integer multiple of the horizontal lattice period (w).
  // Under U=0 mapping to U=1, this mathematically guarantees a perfectly seamless wrap.
  const N = 152; // 4x smaller holes/cells than the previous N = 38 (38 * 4 = 152)
  const w = canvas.width / N; // Exact horizontal period (w) ~ 6.737px
  
  // From w = hexRadius * Math.sqrt(3), compute the precise matching layout parameters
  const hexRadius = w / Math.sqrt(3); // Precise coordinate node radius ~ 3.8895px
  const h = hexRadius * 1.5;          // Precise vertical step between staggered rows
  const innerRadius = 2.03125;       // Perfect black circular hollow holes (4x smaller than 8.125)

  // Calculate row counts to fully cover the vertical territory
  const startRow = Math.floor(-hexRadius * 2 / h);
  const endRow = Math.ceil((canvas.height + hexRadius * 2) / h);

  // 3. Draw perfect black circular apertures in an equilateral triangular lattice
  // Because the background is solid white, drawing black circles creates perfect circular holes 
  // with no weird separate trianglish secondary holes in between!
  ctx.fillStyle = '#000000';
  for (let rowIdx = startRow; rowIdx <= endRow; rowIdx++) {
    const y = rowIdx * h;
    const isOdd = rowIdx % 2 !== 0;
    const xStart = isOdd ? -w / 2 : 0;
    
    // Slide horizontally across the row, including margins for seamless blending
    for (let x = xStart - w; x < canvas.width + w * 2; x += w) {
      ctx.beginPath();
      ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 4. Overwrite basketball channel grooves with solid white so no holes run through the seams
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

  // High-fidelity Interactive Payment Sandboxed Walkthrough states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'instructions'>('form');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('421');
  const [cardName, setCardName] = useState('EXHIBIT CHAMPION');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [paymentLogs, setPaymentLogs] = useState<string[]>([]);
  
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const startSimulatedPayment = () => {
    handleClick();
    setPaymentStep('processing');
    setPaymentLogs([]);
    
    const logs = [
      "🔄 Initializing Stripe SDK Client with VITE_STRIPE_PUBLISHABLE_KEY...",
      "🔒 Card credentials captured securely directly into elements wrapper...",
      "📤 Contacting Stripe tokenization servers recursively (Safe SSL Pipeline)...",
      "✅ Card verified and parsed into payment token: tok_1NiXF82eZvKYlo2C...",
      "📡 Sending token 'tok_1NiXF82e...' to backend secure endpoint: POST /api/checkout",
      "🔑 Backend verified POST request & validated with internal secret key (STRIPE_SECRET_KEY)...",
      "🏦 Stripe API created real charge description: 'First edition sport airless sphere acquisition'",
      "🎉 Response status: 200 (Success! Charge ID: ch_3MiK912vY)",
      "🔥 Purging cart composite selections and dispatching sound feedback..."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setPaymentLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setPaymentStep('success');
          setCart([]);
          if (!isMuted) synth.playSuccess();
        }
      }, (index + 1) * 750);
    });
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
                  {PRODUCTS.map(p => {
                    const isUpcoming = p.id === 'platinum' || p.id === 'aurum';
                    return (
                      <button 
                        key={p.id}
                        disabled={isUpcoming}
                        onClick={() => {
                          if (isUpcoming) return;
                          handleClick();
                          setCustomBallConfig(null);
                          setActiveProduct(p);
                        }}
                        onMouseEnter={isUpcoming ? undefined : handleHover}
                        style={isUpcoming ? { backgroundColor: '#000000' } : {}}
                        className={`p-3 rounded border text-left transition-all ${
                          isUpcoming 
                            ? 'opacity-40 cursor-not-allowed border-black text-gray-500 shadow-none' 
                            : (!customBallConfig && activeProduct.id === p.id) 
                              ? 'border-[#FF5500] bg-white/5' 
                              : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className={`text-[10px] font-bold uppercase ${isUpcoming ? 'text-gray-500 line-through' : 'text-white'}`}>{p.name}</div>
                          {isUpcoming && (
                            <span className="text-[8px] font-mono text-[#FF5500] border border-[#FF5500]/30 px-1 rounded bg-[#FF5500]/10 uppercase tracking-tight shrink-0 font-bold scale-90 translate-x-1">
                              Soon
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-1">
                          {isUpcoming ? 'COMING SOON' : `$${p.price}`}
                        </div>
                      </button>
                    );
                  })}
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
                <span className="text-white text-4xl font-display font-light">${currentDesign.price || '199'}</span>
              </div>
              <button 
                onClick={handleAddToCart}
                onMouseEnter={handleHover}
                className="w-full md:w-auto px-10 py-4 bg-[#FF5500] text-white font-bold text-xs tracking-widest uppercase rounded-sm border border-[#FF5500] hover:bg-white hover:text-black hover:border-white shadow-glow transition-all duration-300 interactive active:scale-95"
              >
                Buy Now
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
                  setIsCartOpen(false);
                  setIsPaymentOpen(true);
                  setPaymentStep('form');
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

      {/* HIGH-FIDELITY SECURE PAYMENT MODAL */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsPaymentOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-[#0c0c0e] border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl text-left overflow-hidden z-10 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#111115]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center">
                  <CreditCard className="text-[#FF5500]" size={20} />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-base md:text-lg tracking-wider uppercase">SECURE PAYMENT DISPATCH</h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">GATEWAY SANDBOX & VERIFICATION TERMINAL</p>
                </div>
              </div>
              <button 
                onClick={() => { handleClick(); setIsPaymentOpen(false); }}
                className="text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-xs font-mono transition-all uppercase tracking-wider"
              >
                Exit Terminal
              </button>
            </div>

            {/* Inner scrollable area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
              
              {/* Payment Step Manager */}
              {paymentStep === 'form' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left block: Sandbox Terminal inputs */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">ELEMENTS CLIENT WRAPPER ENABLED</span>
                      </div>
                      <h4 className="text-white text-xl font-bold font-display uppercase tracking-tight">DEMO GATEWAY CHECKOUT</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Input simulated credentials below to review execution dynamics. Since we respect standard client security, all transactions are tokenized via sandboxed SSL protocols.
                      </p>
                    </div>

                    {/* Interactive CC mockup */}
                    <div className="bg-gradient-to-br from-[#1b1c24] to-[#0c0d12] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-inner space-y-6">
                      <div className="absolute top-2 right-2 w-28 h-28 bg-[#FF5500]/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">SECURE SYSTEM NODE</span>
                          <span className="text-xs text-white font-mono uppercase tracking-widest font-bold">SLAMS SPORTS INC.</span>
                        </div>
                        <span className="text-[9px] font-mono text-white/40 border border-white/10 px-2.5 py-1 rounded bg-black/40 uppercase tracking-widest">
                          TEST CARD
                        </span>
                      </div>

                      {/* Prefilled card mockup entry */}
                      <div className="space-y-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Card Number</label>
                          <div className="relative">
                            <input 
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#FF5500] text-white text-sm font-mono tracking-[0.2em] px-4 py-3 rounded-md focus:outline-none transition-colors"
                              placeholder="4242 4242 4242 4242"
                            />
                            <CreditCard size={15} className="absolute right-3.5 top-3.5 text-gray-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Expiry</label>
                            <input 
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#FF5500] text-white text-xs font-mono tracking-widest px-4 py-3 rounded-md focus:outline-none transition-colors"
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">CVC</label>
                            <input 
                              type="text"
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full bg-black/60 border border-white/15 focus:border-[#FF5500] text-white text-xs font-mono tracking-widest px-4 py-3 rounded-md focus:outline-none transition-colors"
                              placeholder="CVC"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block font-bold">Cardholder Name</label>
                          <input 
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-black/60 border border-white/15 focus:border-[#FF5500] text-white text-xs font-mono tracking-wider px-4 py-3 rounded-md focus:outline-none transition-colors"
                            placeholder="NAME SURNAME"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Checkout subtotal summary */}
                    <div className="p-4 rounded-xl border border-[#FF5500]/10 bg-[#FF5500]/5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-xs text-gray-400 font-mono uppercase tracking-wider block">Acquisition Target (Cart Subtotal)</span>
                        <span className="text-[10px] text-gray-500 uppercase font-mono">Includes Free Global SLS Composite Shipping</span>
                      </div>
                      <span className="text-white text-2xl font-display font-black tracking-tight">${cartSubtotal.toFixed(2)}</span>
                    </div>

                    <button 
                      onClick={startSimulatedPayment}
                      className="w-full py-4 bg-[#FF5500] hover:bg-white text-white hover:text-black font-bold text-xs tracking-[0.25em] uppercase rounded-sm border border-[#FF5500] hover:border-white shadow-glow transition-all duration-300 interactive active:scale-95"
                    >
                      🔒 Dispatch Secure Purchase
                    </button>
                  </div>

                  {/* Right block: Educational architectural schema */}
                  <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-white/10 lg:pl-8">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-[#FF5500] tracking-widest uppercase">SECURITY STRATEGY</span>
                      <h4 className="text-white text-base font-bold font-display uppercase tracking-wider">KEY DESIGN RULES</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        To guarantee credit credential integrity, active payments must segment client tokenization safely away from raw backend application vaults.
                      </p>
                    </div>

                    {/* Key segment checklist */}
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2.5">
                        <div className="flex items-center gap-2 text-[#FF5500]">
                          <Key size={14} />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">VITE_STRIPE_PUBLISHABLE_KEY</span>
                        </div>
                        <div className="text-[9px] font-mono text-green-400 uppercase tracking-widest font-bold">🔑 PUBLIC / CLIENT ACCESS</div>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          Used globally on the frontend UI element. Instantiates the secure iFrame wrapper component. Safe to output in client bundles.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2.5">
                        <div className="flex items-center gap-2 text-white">
                          <Lock size={14} />
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest">STRIPE_SECRET_KEY</span>
                        </div>
                        <div className="text-[9px] font-mono text-red-400 uppercase tracking-widest font-bold">🚫 STRICTLY SECRET / SERVER SEGMENT ONLY</div>
                        <p className="text-xs text-gray-400 leading-relaxed font-sans">
                          Never allow this private variable inside client JS. Keep strictly inside secret environment variables inside the backend to authenticate transaction flows.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => { handleClick(); setPaymentStep('instructions'); }}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] tracking-widest uppercase rounded border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      🛡️ View Full Integration Code
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Processing simulated checkout logs */}
              {paymentStep === 'processing' && (
                <div className="space-y-6 py-8">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-16 h-16 rounded-full border-4 border-[#FF5500]/20 border-t-[#FF5500] animate-spin flex items-center justify-center">
                      <Cpu className="text-[#FF5500] animate-pulse" size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white text-lg font-bold font-display uppercase tracking-widest">COMPILING PAYMENTS PROCESSOR...</h4>
                      <p className="text-xs text-gray-400">Verifying secure keys and creating encrypted connection tunnels...</p>
                    </div>
                  </div>

                  {/* Terminal emulator container */}
                  <div className="bg-black/90 border border-white/10 rounded-xl p-5 font-mono text-xs text-gray-300 space-y-2 min-h-[220px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                      <Terminal size={12} className="text-[#FF5500]" /> Stripe Pipeline Integration Logs (Active Context)
                    </div>

                    <div className="space-y-1.5 text-left">
                      {paymentLogs.map((log, idx) => (
                        <div key={idx} className="py-0.5 border-l-2 border-[#FF5500] pl-3 text-white">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Success screen receipt */}
              {paymentStep === 'success' && (
                <div className="max-w-md mx-auto text-center py-6 space-y-8">
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shadow-lg animate-bounce">
                      <CheckCircle size={44} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-white text-xl font-bold font-display uppercase tracking-widest">TRANSACTION SUCCESSFUL</h4>
                      <p className="text-xs text-gray-400 font-sans">Order compiled with hand-calibrated printing metrics</p>
                    </div>
                  </div>

                  {/* Receipt block */}
                  <div className="bg-[#111115] border border-white/10 rounded-2xl p-6 space-y-4 font-mono text-xs text-left relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF5500]/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-white/10 pb-3 flex justify-between">
                      <span>OFFICIAL ACQUISITION TRANSACTION</span>
                      <span className="text-[#FF5500]">Slams Sports Inc.</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-400">
                        <span>CERTIFIED BALLS SPEC:</span>
                        <span className="text-white text-right">Premium SLS Airless Ball</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>SHIPPING METHOD:</span>
                        <span className="text-white text-right">Free Premium SLS Global Air</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>CARDHOLDER VERIFIED:</span>
                        <span className="text-white text-right font-bold">{cardName}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>STRIPE CHARGE REF CODE:</span>
                        <span className="text-white font-mono text-[10px] tracking-tight">ch_3MiK912vY9A8</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                      <span className="text-gray-400 text-xs font-bold font-sans">TOTAL SECURELY CHARGED:</span>
                      <span className="text-[#FF5500] text-xl font-bold font-sans">{cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={() => { handleClick(); setIsPaymentOpen(false); }}
                      className="w-full py-4 bg-[#FF5500] hover:bg-white text-white hover:text-black font-bold text-xs tracking-[0.2em] uppercase rounded-sm border border-[#FF5500] hover:border-white shadow-glow transition-all duration-300"
                    >
                      Return to laboratory
                    </button>
                    <button 
                      onClick={() => { handleClick(); setPaymentStep('instructions'); }}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] tracking-widest uppercase rounded border border-white/10"
                    >
                      🛡️ Explore Production Source Codes
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Full technical structural integration guides */}
              {paymentStep === 'instructions' && (
                <div className="space-y-6">
                  <div className="space-y-2 text-left">
                    <button 
                      onClick={() => { handleClick(); setPaymentStep('form'); }}
                      className="text-gray-400 hover:text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-1.5 border border-white/10 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10"
                    >
                      ← Back to payment sandbox
                    </button>
                    <h4 className="text-white text-2xl font-bold font-display uppercase tracking-tight pt-2">PRODUCTION API SOURCE INTEGRATION</h4>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-3xl font-sans">
                      Configure your production keys by declaring variables in <code className="text-gray-200 bg-white/5 px-1.5 py-0.5 rounded font-mono">.env</code>. See standard integration codes for full-stack client/server setup below:
                    </p>
                  </div>

                  {/* Code Tabs */}
                  <div className="space-y-6">
                    {/* Environment decl */}
                    <div className="space-y-2 text-left">
                      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 1: Configure Environment (.env)</div>
                      <div className="relative group bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-white/90">
                        <pre className="overflow-x-auto whitespace-pre no-scrollbar p-1">
{`# ----------------------------------------------------
# 💳 PAYMENT CONFIGURATION METRICS
# ----------------------------------------------------
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_yourPublicKeyHere
STRIPE_SECRET_KEY=sk_live_yourSecretKeyHere`}
                        </pre>
                        <button 
                          onClick={() => handleCopy(`VITE_STRIPE_PUBLISHABLE_KEY=pk_live_yourPublicKeyHere\nSTRIPE_SECRET_KEY=sk_live_yourSecretKeyHere`, 'env')}
                          className="absolute right-3 top-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 p-1.5 rounded transition-all interactive"
                        >
                          {copiedText === 'env' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Client side code */}
                    <div className="space-y-2 text-left">
                      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 2: Client Elements Setup (React / Vite)</div>
                      <div className="relative group bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-white/90">
                        <pre className="overflow-x-auto whitespace-pre no-scrollbar p-1">
{`import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// 🔑 SAFE: Publishable public key is safely deployed to the build asset bundle
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ subtotal }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    // Tokenize credit card details securely with Stripe's API
    const { token, error } = await stripe.createToken(elements.getElement(CardElement));
    
    if (token) {
      // 📡 POST secure token payload to server-side wallet
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.id, amount: subtotal * 100 })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order completed successfully!');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement options={{ style: { base: { color: "#ffffff" } } }} />
   {/* Note: changed Buy Now */}
      <button type="submit" disabled={!stripe} className="bg-orange-500 px-6 py-3">
        Buy Now
      </button>
    </form>
  );
}`}
                        </pre>
                        <button 
                          onClick={() => handleCopy(`import { loadStripe } from '@stripe/stripe-js';\nimport { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';\n// ...`, 'client')}
                          className="absolute right-3 top-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 p-1.5 rounded transition-all interactive"
                        >
                          {copiedText === 'client' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Server side code */}
                    <div className="space-y-2 text-left">
                      <div className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 3: Server Capture Endpoint (Express Node.js)</div>
                      <div className="relative group bg-black border border-white/10 rounded-xl p-4 font-mono text-xs text-white/90">
                        <pre className="overflow-x-auto whitespace-pre no-scrollbar p-1">
{`import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// 🔒 STRICTLY PRIVATE: Initializing stripe client on server-side using private secret key!
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

router.post('/api/checkout', async (req, res) => {
  const { token, amount } = req.body;
  
  try {
    // 🏦 Create real charge inside Stripe secure ledger
    const charge = await stripe.charges.create({
      amount: amount, // amount in cents
      currency: 'usd',
      source: token,
      description: 'Acquisition of First Edition Slams Airless Ball segment',
    });

    res.json({ success: true, chargeId: charge.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});`}
                        </pre>
                        <button 
                          onClick={() => handleCopy(`import express from 'express';\nimport Stripe from 'stripe';\n// ...`, 'server')}
                          className="absolute right-3 top-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 p-1.5 rounded transition-all interactive"
                        >
                          {copiedText === 'server' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Bottom Footer info banner */}
            <div className="p-4 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider text-center sm:text-left gap-2 shrink-0">
              <span className="flex items-center gap-1 text-green-400 font-bold">
                🔒 STRICT SSL 256-BIT ENCRYPTION APPLIED
              </span>
              <span>
                PROVABLY COMPLIANT WITH PCI-DSS STANDARDS
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
