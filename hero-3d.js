/* ============================================
   GREEN TECH PRESENTATION — 3D CITY SCENE
   Pinned behind Hero + Overview, idle spin + scroll-driven camera
   Falls back to the static hero image on any failure
   ============================================ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const heroSection = document.getElementById('hero');
const overviewSection = document.getElementById('overview');
const canvas = document.getElementById('cityCanvas');
const fallbackImg = document.getElementById('heroFallbackImg');

if (canvas && heroSection && overviewSection) {
  initCityScene();
}

function initCityScene() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 2000);

  // Teal/mint sky, dark ground — matches the site's core palette
  const hemi = new THREE.HemisphereLight(0x9fe6c8, 0x0b1a12, 1.15);
  scene.add(hemi);

  // Cool moonlit key light
  const sun = new THREE.DirectionalLight(0xcdeee0, 1.3);
  sun.position.set(40, 60, 30);
  scene.add(sun);

  // Teal fill from the opposite side
  const fill = new THREE.DirectionalLight(0x2dd4a0, 0.4);
  fill.position.set(-30, 20, -40);
  scene.add(fill);

  // Warm gold rim light for edge highlights, ties in the gold accent
  const rim = new THREE.DirectionalLight(0xf4c95d, 0.55);
  rim.position.set(-10, 15, 25);
  scene.add(rim);

  let model = null;
  let baseCameraDistance = 10;
  let modelRadius = 5;
  let loadedAt = null;

  const loader = new GLTFLoader();
  loader.load(
    'assets/models/city/scene.gltf',
    (gltf) => {
      model = gltf.scene;

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
      modelRadius = maxDim / 2;
      const fovRad = camera.fov * (Math.PI / 180);
      baseCameraDistance = (modelRadius / Math.tan(fovRad / 2)) * 1.65;

      camera.position.set(0, maxDim * 0.28, baseCameraDistance);
      camera.lookAt(0, 0, 0);

      scene.fog = new THREE.Fog(0x0b1a12, baseCameraDistance * 0.9, baseCameraDistance * 3.2);

      scene.add(model);
      loadedAt = performance.now();
    },
    undefined,
    (err) => {
      console.warn('City scene failed to load, keeping static hero image.', err);
    }
  );

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  let heroIntersecting = true;
  let overviewIntersecting = false;
  let sectionsVisible = true;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.target === heroSection) heroIntersecting = entry.isIntersecting;
      if (entry.target === overviewSection) overviewIntersecting = entry.isIntersecting;
    });
    sectionsVisible = heroIntersecting || overviewIntersecting;
  }, { threshold: 0 });
  io.observe(heroSection);
  io.observe(overviewSection);

  let scrollFraction = 0;
  function updateScrollFraction() {
    const totalHeight = heroSection.offsetHeight + overviewSection.offsetHeight;
    scrollFraction = Math.min(Math.max(window.scrollY / totalHeight, 0), 1);
  }
  updateScrollFraction();
  window.addEventListener('scroll', updateScrollFraction, { passive: true });

  const clock = new THREE.Clock();
  const idleSpeed = reduceMotion ? 0 : 0.16;

  function animate() {
    requestAnimationFrame(animate);
    if (!sectionsVisible || document.hidden) return;

    const delta = clock.getDelta();
    let opacity = 0;

    if (model) {
      model.rotation.y += delta * idleSpeed;

      const scrollSpin = scrollFraction * 1.6;
      camera.position.set(
        Math.sin(scrollSpin) * baseCameraDistance * 0.28,
        modelRadius * 0.28 + scrollFraction * modelRadius * 0.32,
        Math.cos(scrollSpin) * baseCameraDistance * (1 - scrollFraction * 0.3)
      );
      camera.lookAt(0, 0, 0);

      const sinceLoad = loadedAt ? (performance.now() - loadedAt) / 1000 : 0;
      const fadeIn = reduceMotion ? 1 : Math.min(sinceLoad / 1.2, 1);

      const fadeOutStart = 0.82;
      const scrollFade = scrollFraction < fadeOutStart
        ? 1
        : Math.max(1 - (scrollFraction - fadeOutStart) / (1 - fadeOutStart), 0);

      const maxOpacity = 0.92;
      opacity = fadeIn * scrollFade * maxOpacity;

      renderer.render(scene, camera);
    }

    canvas.style.opacity = String(opacity);
    if (fallbackImg) fallbackImg.style.opacity = String(1 - opacity);
  }
  animate();
}
