import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Eye,
  Sliders,
  Volume2,
  VolumeX,
  Zap,
  Radio,
  Maximize2,
  Minimize2
} from 'lucide-react';

/**
 * LogiRoute AI - Interactive 3D WebGL Canvas
 * Powered by Three.js with Scroll-Driven Flight Path, 3D Drone & Culinary Meshes
 */
export default function Interactive3DDeliveryCanvas({
  scrollProgress = 0,
  activeThermalState = 'CHILLED',
  onCheckpointChange,
  isHeroMode = false
}) {
  const mountRef = useRef(null);
  const [cameraMode, setCameraMode] = useState('cinematic'); // 'cinematic' | 'orbit' | 'radar' | 'payload'
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hudTelemetry, setHudTelemetry] = useState({
    speed: 34,
    altitude: 42,
    temp: 3.8,
    phase: 'EN-ROUTE CORRIDOR ALPHA',
    fps: 60
  });

  // Mutable animation state references
  const stateRef = useRef({
    scroll: scrollProgress,
    targetScroll: scrollProgress,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    drone: null,
    propellers: [],
    cryoRing: null,
    thrusterParticles: null,
    floatingItems: [],
    curve: null,
    camera: null,
    scene: null,
    renderer: null,
    clock: new THREE.Clock(),
    thermalColor: new THREE.Color(0x06b6d4),
    audioCtx: null,
    audioGain: null
  });

  // Sync scrollProgress prop into animation state
  useEffect(() => {
    stateRef.current.targetScroll = Math.max(0, Math.min(1, scrollProgress));
  }, [scrollProgress]);

  // Update thermal color theme based on activeThermalState
  useEffect(() => {
    const colorMap = {
      HOT: 0xf97316,     // Warm coral / fire orange
      CHILLED: 0x06b6d4, // Cyan cryo glow
      FROZEN: 0x60a5fa   // Ice blue subzero
    };
    const targetHex = colorMap[activeThermalState] || 0x06b6d4;
    stateRef.current.thermalColor.setHex(targetHex);

    if (stateRef.current.cryoRing) {
      stateRef.current.cryoRing.material.color.setHex(targetHex);
      stateRef.current.cryoRing.material.emissive.setHex(targetHex);
    }
  }, [activeThermalState]);

  // Initialize Web Audio API for interactive subtle cyber soundscape
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        gain.connect(ctx.destination);

        // Soft ambient drone hum
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Low A2 hum
        osc.connect(gain);
        osc.start();

        stateRef.current.audioCtx = ctx;
        stateRef.current.audioGain = gain;
        setSoundEnabled(true);
      } catch (e) {
        console.warn('Web Audio not supported', e);
      }
    } else {
      if (stateRef.current.audioCtx) {
        stateRef.current.audioCtx.close();
        stateRef.current.audioCtx = null;
      }
      setSoundEnabled(false);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Atmospheric Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070e1a, 0.025);
    stateRef.current.scene = scene;

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 4, 14);
    stateRef.current.camera = camera;

    // 3. WebGL Renderer with High-Performance Settings
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    stateRef.current.renderer = renderer;

    // 4. Studio & Volumetric Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 4.5);
    mainSpot.position.set(10, 20, 15);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.8;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const cyanRim = new THREE.DirectionalLight(0x06b6d4, 3.2);
    cyanRim.position.set(-15, -5, -10);
    scene.add(cyanRim);

    const goldAccent = new THREE.PointLight(0xd4af37, 2.5, 30);
    goldAccent.position.set(5, -2, 5);
    scene.add(goldAccent);

    // 5. 3D Spline Flight Highway (Curved Path Through Space)
    const curvePoints = [
      new THREE.Vector3(0, 1.5, 8),      // Checkpoint 0: Dispatch Hub
      new THREE.Vector3(4, 3.2, 0),      // Checkpoint 1: Climb over Corridor
      new THREE.Vector3(-3, 2.0, -10),   // Checkpoint 2: Cryo Tunnel Curve
      new THREE.Vector3(2, 4.0, -20),    // Checkpoint 3: High-Altitude Cruise
      new THREE.Vector3(0, 0.5, -30),    // Checkpoint 4: Final Doorstep Descend
    ];
    const flightCurve = new THREE.CatmullRomCurve3(curvePoints);
    flightCurve.curveType = 'centripetal';
    flightCurve.tension = 0.4;
    stateRef.current.curve = flightCurve;

    // Tube Ribbon Visualizing the Cybernetic Route
    const tubeGeo = new THREE.TubeGeometry(flightCurve, 120, 0.12, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const flightRibbon = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(flightRibbon);

    // Glowing Waypoint Gate Rings Along the Flight Path
    const gateGeo = new THREE.TorusGeometry(1.4, 0.05, 16, 40);
    const gateMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });

    [0.15, 0.45, 0.75, 0.98].forEach((t, i) => {
      const pt = flightCurve.getPointAt(t);
      const tangent = flightCurve.getTangentAt(t).normalize();
      const gate = new THREE.Mesh(gateGeo, gateMat);
      gate.position.copy(pt);
      gate.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      scene.add(gate);
    });

    // 6. Cybernetic Ground Grid & Neon Road Plane
    const gridHelper = new THREE.GridHelper(80, 50, 0x0284c7, 0x0f172a);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // 7. Ambient Particle Stars & Ice/Thermal Dust
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 60;
      positions[i + 1] = Math.random() * 25 - 2;
      positions[i + 2] = (Math.random() - 0.5) * 60;
      scales[i / 3] = Math.random() * 2 + 0.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(particleGeo, particleMat);
    scene.add(starField);

    // 8. Sculpt the 3D AI Delivery Drone Vehicle
    const droneGroup = new THREE.Group();

    // Central Aerodynamic Chassis (Metallic Obsidian / Cyan Pearl)
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.4, 2.2);
    // Bevel effect through scaling & material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0a1120,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    droneGroup.add(bodyMesh);

    // Aerodynamic Cockpit Glass Canopy
    const cockpitGeo = new THREE.SphereGeometry(0.55, 24, 16);
    cockpitGeo.scale(1, 0.45, 1.8);
    const cockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.8,
      transparent: true,
      opacity: 0.9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.2
    });
    const cockpitMesh = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpitMesh.position.set(0, 0.32, -0.2);
    droneGroup.add(cockpitMesh);

    // Central Thermal Cryo-Vault Storage Box (Carrying the payload)
    const vaultGeo = new THREE.BoxGeometry(0.95, 0.65, 0.95);
    const vaultMat = new THREE.MeshStandardMaterial({
      color: 0x020617,
      metalness: 0.95,
      roughness: 0.15
    });
    const vaultMesh = new THREE.Mesh(vaultGeo, vaultMat);
    vaultMesh.position.set(0, -0.35, 0.1);
    droneGroup.add(vaultMesh);

    // Glowing Cryo Temperature Ring Indicator around payload
    const cryoRingGeo = new THREE.TorusGeometry(0.68, 0.04, 16, 32);
    const cryoRingMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });
    const cryoRing = new THREE.Mesh(cryoRingGeo, cryoRingMat);
    cryoRing.rotation.x = Math.PI / 2;
    cryoRing.position.set(0, -0.35, 0.1);
    droneGroup.add(cryoRing);
    stateRef.current.cryoRing = cryoRing;

    // 4 Quad-Rotor Carbon Arms
    const armPositions = [
      [1.3, 0.1, 1.0],
      [-1.3, 0.1, 1.0],
      [1.3, 0.1, -1.0],
      [-1.3, 0.1, -1.0]
    ];
    const armMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.3 });
    const rotorRingMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2
    });
    const bladeMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7 });

    const propellers = [];

    armPositions.forEach(([x, y, z]) => {
      // Carbon Wing Arm
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), armMat);
      arm.position.set(x * 0.5, y, z * 0.5);
      arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, 0, z).normalize());
      droneGroup.add(arm);

      // Outer Rotor Shroud Ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 12, 28), rotorRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, y + 0.1, z);
      droneGroup.add(ring);

      // Spinning Dual-Blades
      const propGroup = new THREE.Group();
      propGroup.position.set(x, y + 0.12, z);

      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.015, 0.08), bladeMat);
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.85), bladeMat);
      propGroup.add(b1, b2);
      droneGroup.add(propGroup);
      propellers.push(propGroup);
    });
    stateRef.current.propellers = propellers;

    // Forward Dual Laser Headlights (Glowing Cones)
    const beamGeo = new THREE.ConeGeometry(0.4, 3.5, 16, 1, true);
    beamGeo.translate(0, -1.75, 0);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const beamL = new THREE.Mesh(beamGeo, beamMat);
    beamL.position.set(-0.45, 0, -1.2);
    droneGroup.add(beamL);

    const beamR = new THREE.Mesh(beamGeo, beamMat);
    beamR.position.set(0.45, 0, -1.2);
    droneGroup.add(beamR);

    scene.add(droneGroup);
    stateRef.current.drone = droneGroup;

    // 9. Procedural 3D Holographic Grocery Assets (Orbiting)
    const floatingItems = [];

    // Asset A: 3D Cold Brew Flask
    const bottleGroup = new THREE.Group();
    const bottleBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.9, 16),
      new THREE.MeshPhysicalMaterial({
        color: 0x3b1d08,
        roughness: 0.1,
        transmission: 0.8,
        thickness: 0.6,
        transparent: true,
        opacity: 0.85
      })
    );
    const bottleCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 })
    );
    bottleCap.position.y = 0.55;
    bottleGroup.add(bottleBody, bottleCap);
    bottleGroup.scale.set(0.7, 0.7, 0.7);
    scene.add(bottleGroup);
    floatingItems.push({ mesh: bottleGroup, speed: 0.8, radius: 2.8, angle: 0, vOffset: 0.2 });

    // Asset B: 3D Cryo Gelato Cube (Sub-Zero Crystal)
    const gelatoGroup = new THREE.Group();
    const crystalGeo = new THREE.IcosahedronGeometry(0.42, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.4,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.8,
      transparent: true,
      opacity: 0.9
    });
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    gelatoGroup.add(crystal);
    gelatoGroup.scale.set(0.8, 0.8, 0.8);
    scene.add(gelatoGroup);
    floatingItems.push({ mesh: gelatoGroup, speed: 1.1, radius: 3.2, angle: (Math.PI * 2) / 3, vOffset: -0.4 });

    // Asset C: 3D Golden Truffle Brioche Burger
    const burgerGroup = new THREE.Group();
    const bunTop = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4, metalness: 0.1 })
    );
    const patty = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.16, 16),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 })
    );
    patty.position.y = -0.08;
    const bunBottom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.43, 0.43, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 })
    );
    bunBottom.position.y = -0.22;
    burgerGroup.add(bunTop, patty, bunBottom);
    burgerGroup.scale.set(0.75, 0.75, 0.75);
    scene.add(burgerGroup);
    floatingItems.push({ mesh: burgerGroup, speed: 0.9, radius: 3.0, angle: (Math.PI * 4) / 3, vOffset: 0.3 });

    stateRef.current.floatingItems = floatingItems;

    // 10. Mouse/Pointer Interaction Listener
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.targetMouseX = x;
      stateRef.current.targetMouseY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 11. Handle Container / Window Resizing
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 12. Main 60FPS Render & Scroll-Interpolation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = stateRef.current.clock.getDelta();
      const time = stateRef.current.clock.getElapsedTime();

      // Smooth scroll interpolation (damping)
      stateRef.current.scroll += (stateRef.current.targetScroll - stateRef.current.scroll) * (delta * 4.5);
      const scroll = stateRef.current.scroll;

      // Smooth mouse interpolation
      stateRef.current.mouseX += (stateRef.current.targetMouseX - stateRef.current.mouseX) * (delta * 3.0);
      stateRef.current.mouseY += (stateRef.current.targetMouseY - stateRef.current.mouseY) * (delta * 3.0);

      // Fast Propeller Rotation
      propellers.forEach((p, idx) => {
        p.rotation.y += (idx % 2 === 0 ? 1 : -1) * 28 * delta;
      });

      // Drone Position Along 3D Flight Spline
      if (flightCurve && droneGroup) {
        // Map scroll (0 to 1) along the spline curve with clamp
        const splineT = Math.max(0.001, Math.min(0.999, scroll));
        const dronePos = flightCurve.getPointAt(splineT);
        const droneTangent = flightCurve.getTangentAt(splineT).normalize();

        // Idle hovering float when static
        const hoverFloat = Math.sin(time * 3.2) * 0.12;
        droneGroup.position.set(dronePos.x, dronePos.y + hoverFloat, dronePos.z);

        // Banking tilt when turning
        const lookTarget = dronePos.clone().add(droneTangent);
        droneGroup.lookAt(lookTarget);

        // Add subtle banking angle based on horizontal curvature & mouse
        const bankAngle = (droneTangent.x * -0.6) + (stateRef.current.mouseX * 0.25);
        droneGroup.rotateZ(bankAngle);
        droneGroup.rotateX(stateRef.current.mouseY * 0.15);
      }

      // Orbiting 3D Culinary Items
      floatingItems.forEach((item) => {
        item.angle += item.speed * delta;
        const x = droneGroup.position.x + Math.cos(item.angle) * item.radius;
        const z = droneGroup.position.z + Math.sin(item.angle) * item.radius;
        const y = droneGroup.position.y + item.vOffset + Math.sin(time * 2 + item.angle) * 0.25;

        item.mesh.position.set(x, y, z);
        item.mesh.rotation.y += 1.2 * delta;
        item.mesh.rotation.x = Math.sin(time + item.angle) * 0.2;
      });

      // Ambient Starfield Drift
      starField.rotation.y += 0.05 * delta;
      starField.position.z = droneGroup.position.z;

      // Dynamic Camera Positioning Based on Selected Camera Mode & Scroll Progress
      if (droneGroup && camera) {
        if (cameraMode === 'cinematic') {
          // Swooping Cinematic Chase Cam
          const camOffset = new THREE.Vector3(
            Math.sin(scroll * Math.PI) * 3 + stateRef.current.mouseX * 1.5,
            2.2 + (1 - scroll) * 1.8 + stateRef.current.mouseY * 0.8,
            5.8 + (1 - scroll) * 2.5
          );
          const desiredCamPos = droneGroup.position.clone().add(camOffset);
          camera.position.lerp(desiredCamPos, delta * 3.5);

          const lookTarget = droneGroup.position.clone().add(new THREE.Vector3(0, 0.3, -2));
          camera.lookAt(lookTarget);
        } else if (cameraMode === 'orbit') {
          // 360 Showcase Cam
          const orbitAngle = time * 0.5 + scroll * Math.PI * 2;
          camera.position.set(
            droneGroup.position.x + Math.cos(orbitAngle) * 6,
            droneGroup.position.y + 2.5,
            droneGroup.position.z + Math.sin(orbitAngle) * 6
          );
          camera.lookAt(droneGroup.position);
        } else if (cameraMode === 'radar') {
          // Top-Down Tactical Drone Radar Cam
          camera.position.set(droneGroup.position.x, droneGroup.position.y + 12, droneGroup.position.z + 0.1);
          camera.lookAt(droneGroup.position);
        } else if (cameraMode === 'payload') {
          // Close-up Payload Vault View
          const payloadOffset = new THREE.Vector3(0, -0.2, 2.2);
          camera.position.copy(droneGroup.position.clone().add(payloadOffset));
          camera.lookAt(droneGroup.position.clone().add(new THREE.Vector3(0, -0.3, 0)));
        }
      }

      // Audio Frequency Modulation Linked to Virtual Speed & Scroll
      if (stateRef.current.audioCtx && stateRef.current.audioGain) {
        const speedFactor = 1 + scroll * 1.5;
        // Keep gain safe & gentle
        stateRef.current.audioGain.gain.setTargetAtTime(0.04 * (0.8 + scroll * 0.4), time, 0.1);
      }

      // Render Scene
      renderer.render(scene, camera);

      // Periodically Update HUD State
      if (Math.round(time * 10) % 5 === 0) {
        const curSpeed = Math.round(28 + scroll * 18);
        const curAlt = Math.round(38 + (1 - scroll) * 22);
        const curTemp = activeThermalState === 'HOT' ? 68.2 : activeThermalState === 'FROZEN' ? -18.4 : 3.8;
        let phase = 'DISPATCH DEPARTURE (HUB-01)';
        if (scroll > 0.25) phase = 'CORRIDOR ALPHA (3.8°C CRYOPATH)';
        if (scroll > 0.65) phase = 'MICRO-FULFILLMENT STAGING BAY';
        if (scroll > 0.90) phase = 'DOORSTEP TOUCHDOWN (8 MINS SLA)';

        setHudTelemetry({
          speed: curSpeed,
          altitude: curAlt,
          temp: curTemp,
          phase,
          fps: Math.round(1 / Math.max(0.001, delta))
        });
      }
    };

    animate();

    // Cleanup resources on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (stateRef.current.audioCtx) {
        try { stateRef.current.audioCtx.close(); } catch (e) {}
      }

      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [cameraMode, activeThermalState]);

  return (
    <div className="relative w-full h-full min-h-[360px] overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing" />

      {/* Cybernetic Radial Vignette & Depth Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070e1a] via-transparent to-[#070e1a]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-[#070e1a]/90 pointer-events-none" />

      {/* 3D Telemetry HUD Overlay (Top-Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0b192c]/85 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
            3D AI FLEET VECT
          </span>
          <span className="text-[9px] font-mono text-slate-400 border-l border-cyan-900 pl-1.5">
            {hudTelemetry.fps} FPS
          </span>
        </div>

        <div className="bg-[#0b192c]/90 border border-slate-800/80 rounded-xl p-2.5 backdrop-blur-md shadow-xl text-slate-300 font-mono text-[10px] space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">STATUS:</span>
            <span className="text-cyan-400 font-bold">{hudTelemetry.phase}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-[#f3c969] font-bold">{hudTelemetry.speed} KM/H · ALT {hudTelemetry.altitude}M</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">CARGO CORE:</span>
            <span className="text-emerald-400 font-bold">
              {hudTelemetry.temp > 0 ? `+${hudTelemetry.temp}°C` : `${hudTelemetry.temp}°C`} SECURED
            </span>
          </div>
        </div>
      </div>

      {/* Camera Mode Selectors & Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 pointer-events-auto">
        {/* Audio Ambient SFX Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute 3D Thruster Sound' : 'Enable 3D Thruster Sound'}
          className={`p-2 rounded-xl border text-xs font-mono font-bold transition-all backdrop-blur-md cursor-pointer ${
            soundEnabled
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-[#0b192c]/80 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* View Mode Pills */}
        <div className="inline-flex rounded-xl bg-[#0b192c]/85 border border-slate-800 p-0.5 backdrop-blur-md shadow-lg">
          {[
            { id: 'cinematic', label: 'Cinematic' },
            { id: 'orbit', label: '360°' },
            { id: 'radar', label: 'Radar' },
            { id: 'payload', label: 'Vault' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setCameraMode(mode.id)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                cameraMode === mode.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll-Driven Dynamic Progress Bar (Bottom Strip) */}
      <div className="absolute bottom-2 left-3 right-3 z-20 pointer-events-none">
        <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400/80 mb-1">
          <span>01 // HUB DISPATCH</span>
          <span className="text-white font-bold">{Math.round(scrollProgress * 100)}% SCROLL FLIGHT</span>
          <span>04 // DOORSTEP ARRIVAL</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-900/80 border border-cyan-900/40 overflow-hidden backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-[#d4af37] transition-all duration-75 shadow-[0_0_8px_#38bdf8]"
            style={{ width: `${Math.max(4, Math.min(100, scrollProgress * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
