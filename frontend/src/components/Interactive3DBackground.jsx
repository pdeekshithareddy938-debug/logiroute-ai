import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * LogiRoute AI - Interactive 3D Background with Scroll-Driven Depth & Mouse Parallax
 */
export default function Interactive3DBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040811, 0.03);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.0);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 4, 30);
    cyanLight.position.set(-6, 4, 4);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xd4af37, 3, 30);
    goldLight.position.set(6, -2, 2);
    scene.add(goldLight);

    // Floating 3D Cyber Wireframe Rings
    const ringsGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(3.5, 0.04, 16, 60);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.4 });
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.35 });

    const ring1 = new THREE.Mesh(ringGeo, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.03, 16, 50), ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ringsGroup.add(ring1, ring2);
    scene.add(ringsGroup);

    // Deep Star & Pulse Particle Field
    const pCount = 500;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 50;
      pPos[i + 1] = (Math.random() - 0.5) * 30;
      pPos[i + 2] = (Math.random() - 0.5) * 50;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.16,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Ground Cyber Grid
    const grid = new THREE.GridHelper(60, 40, 0x0284c7, 0x0f172a);
    grid.position.y = -4;
    scene.add(grid);

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollY = 0;
    let targetScrollY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY || document.documentElement.scrollTop;
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth damping
      mouseX += (targetMouseX - mouseX) * delta * 3;
      mouseY += (targetMouseY - mouseY) * delta * 3;
      scrollY += (targetScrollY - scrollY) * delta * 3;

      // Rotate 3D rings
      ringsGroup.rotation.y = time * 0.25;
      ringsGroup.rotation.x = Math.sin(time * 0.2) * 0.2;
      ringsGroup.position.y = Math.sin(time * 0.8) * 0.3;

      // Scroll-driven camera displacement
      const scrollFactor = scrollY * 0.005;
      camera.position.x = mouseX * 2;
      camera.position.y = 3 + mouseY * 1.5 - scrollFactor * 0.5;
      camera.position.z = 12 - scrollFactor * 2;
      camera.lookAt(0, 0 - scrollFactor * 0.5, 0);

      // Rotate particle stars
      particles.rotation.y = time * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
    />
  );
}
