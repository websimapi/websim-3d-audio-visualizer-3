let audioContext, analyser, source;
let scene, camera, renderer;
let particles, cube;
let tweenGroup = new TWEEN.Group();

const init = () => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({canvas: document.getElementById('visualizer'), antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  camera.position.z = 5;
  
  // Create central cube
  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshPhongMaterial({
    color: 0x3498db,
    wireframe: true,
    wireframeLinewidth: 2
  });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // Create particles
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  for(let i=0; i<particleCount*3; i+=3) {
    positions[i] = (Math.random() - 0.5) * 10;
    positions[i+1] = (Math.random() - 0.5) * 10;
    positions[i+2] = (Math.random() - 0.5) * 10;
  }
  
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
  });
  
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0x2ecc71, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
};

const handleAudio = (file) => {
  if(source) {
    source.stop();
    audioContext.close();
  }
  
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  
  const bufferSource = audioContext.createBufferSource();
  const reader = new FileReader();
  
  reader.onload = function(e) {
    audioContext.decodeAudioData(e.target.result, function(buffer) {
      source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start(0);
      animate();
    });
  };
  
  reader.readAsArrayBuffer(file);
};

const animate = () => {
  requestAnimationFrame(animate);
  TWEEN.update();
  tweenGroup.update();
  
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(frequencyData);
  
  cube.rotation.x += frequencyData[20] * 0.0001;
  cube.rotation.y += frequencyData[40] * 0.0001;
  
  // Particle animation
  const positions = particles.geometry.attributes.position.array;
  for(let i=0; i<positions.length; i+=3) {
    positions[i+2] += frequencyData[i%frequencyData.length] * 0.002 - 0.1;
    if(positions[i+2] > 5) positions[i+2] = -5;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  
  // Light color transition
  const avgFrequency = frequencyData.slice(20, 40).reduce((a,b) => a+b) / 20;
  cube.material.color.setHSL(avgFrequency / 255, 0.8, 0.5);
  
  renderer.render(scene, camera);
};

init();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('audioInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(file) handleAudio(file);
});