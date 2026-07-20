import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { type ActiveUser, mockUsers } from '../utils/mockData';
import Avatar from './Avatar';

interface GlobeProps {
  onSelectUser: (user: ActiveUser) => void;
  selectedUser: ActiveUser | null;
  users?: ActiveUser[];
  pulseTrigger?: number;
}

export const Globe: React.FC<GlobeProps> = ({ onSelectUser, selectedUser, users = [], pulseTrigger = 0 }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredUser, setHoveredUser] = useState<ActiveUser | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeUserPin, setActiveUserPin] = useState<ActiveUser | null>(null);

  const activeUsersList = users.length > 0 ? users : mockUsers;
  const pulseIntensityRef = useRef(0);

  useEffect(() => {
    if (pulseTrigger && pulseTrigger > 0) {
      pulseIntensityRef.current = 4.0;
    }
  }, [pulseTrigger]);

  // Keep references to access in events
  const stateRef = useRef({
    autoRotateSpeed: 0.0025,
    isDragging: false,
    isMouseOver: false,
    previousMousePosition: { x: 0, y: 0 },
    targetRotationY: 0,
    targetRotationX: 0,
    currentRotationY: 0,
    currentRotationX: 0,
    hoveredUserId: null as string | null,
    toggledUserId: null as string | null,
  });

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf7f1de, 0.12);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xb0ba99, 0.8);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9d6638, 0.4);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 5. Globe groups
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 5a. Solid inner core
    const coreGeometry = new THREE.SphereGeometry(2.38, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xefe9d2,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    globeGroup.add(coreMesh);

    // 5b. Wireframe grid
    const gridGeometry = new THREE.SphereGeometry(2.4, 24, 24);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x4e220f,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    globeGroup.add(gridMesh);

    // 5c. Outer atmosphere glow helper ring
    const atmosGeometry = new THREE.SphereGeometry(2.45, 32, 32);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0xb0ba99,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    globeGroup.add(atmosMesh);

    // 6. Map User Dots
    const dotsGroup = new THREE.Group();
    globeGroup.add(dotsGroup);

    const userDots: { user: ActiveUser; mesh: THREE.Mesh; pulseRing: THREE.Mesh }[] = [];

    // Spread the dots EVENLY across the whole globe surface via a Fibonacci
    // (golden-spiral) sphere. This is a purely visual placement so the "Global
    // User Heatmap" reads as worldwide coverage instead of one clump over SEA —
    // each customer's real location label (Kuala Lumpur, etc.) is preserved
    // untouched in the tooltip and customer table; only the plotted position is
    // decoupled from lat/lng.
    const surfaceRadius = 2.41;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad
    const total = Math.max(1, activeUsersList.length);
    const positionedUsers = activeUsersList.map((user, i) => {
      // +0.5 centers the sample band so no dot lands exactly on a pole.
      const y = 1 - ((i + 0.5) / total) * 2; // 1 → -1, top to bottom
      const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = goldenAngle * i;
      const pos = new THREE.Vector3(
        Math.cos(theta) * ringRadius,
        y,
        Math.sin(theta) * ringRadius
      ).multiplyScalar(surfaceRadius);
      return { user, pos };
    });

    // Shared flat 5-point star geometry used for every customer marker (built
    // once, reused per-dot; only the material color differs by health status).
    const buildStarGeometry = (outer: number, inner: number, points = 5) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2; // first tip up
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      }
      shape.closePath();
      return new THREE.ShapeGeometry(shape);
    };
    const starGeometry = buildStarGeometry(0.13, 0.055);

    positionedUsers.forEach(({ user, pos }) => {
      // Status colors (deep variants — dots render over the light cream globe)
      let color = 0x276b2b; // healthy
      if (user.healthScore < 40) color = 0xa81e17; // critical
      else if (user.healthScore < 70) color = 0xd97706; // at-risk

      // Core marker — a flat star lying tangent to the globe, facing outward
      const dotMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const dotMesh = new THREE.Mesh(starGeometry, dotMaterial);
      dotMesh.position.copy(pos);
      dotMesh.lookAt(new THREE.Vector3(0, 0, 0));
      dotMesh.userData = { userId: user.id };
      dotsGroup.add(dotMesh);

      // Outer pulsing ring
      const ringGeometry = new THREE.RingGeometry(0.08, 0.14, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      dotsGroup.add(ringMesh);

      userDots.push({ user, mesh: dotMesh, pulseRing: ringMesh });
    });

    // 7. Raycasting for Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Offset tooltip by 15px so it doesn't block the cursor/raycaster
      setTooltipPos({
        x: event.clientX - rect.left + 15,
        y: event.clientY - rect.top + 15,
      });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        userDots.map((d) => d.mesh)
      );

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const userId = hitMesh.userData.userId;

        if (stateRef.current.hoveredUserId !== userId) {
          stateRef.current.hoveredUserId = userId;
          const user = activeUsersList.find((u) => u.id === userId) || null;
          setHoveredUser(user);
          document.body.style.cursor = 'pointer';
        }
      } else {
        if (stateRef.current.hoveredUserId !== null) {
          stateRef.current.hoveredUserId = null;
          setHoveredUser(null);
          document.body.style.cursor = 'default';
        }
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      // Check if clicking close button or card itself to avoid dragging
      const target = event.target as HTMLElement;
      if (target.closest('.pinned-user-card')) {
        return; // Don't trigger scene rotation dragging when clicking the UI card overlay
      }

      stateRef.current.isDragging = true;
      stateRef.current.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseUpOrLeave = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.pinned-user-card')) {
        stateRef.current.isDragging = false;
        return;
      }

      if (stateRef.current.isDragging && event.type === 'mouseup') {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          userDots.map((d) => d.mesh)
        );
        if (intersects.length > 0) {
          const hitMesh = intersects[0].object as THREE.Mesh;
          const userId = hitMesh.userData.userId;
          const user = activeUsersList.find((u) => u.id === userId) || null;
          
          stateRef.current.toggledUserId = userId;
          setActiveUserPin(user);
        }
      }
      stateRef.current.isDragging = false;
    };

    const handleDrag = (event: MouseEvent) => {
      if (!stateRef.current.isDragging) return;

      const deltaX = event.clientX - stateRef.current.previousMousePosition.x;
      const deltaY = event.clientY - stateRef.current.previousMousePosition.y;

      stateRef.current.targetRotationY += deltaX * 0.005;
      stateRef.current.targetRotationX += deltaY * 0.005;

      stateRef.current.targetRotationX = Math.max(
        -Math.PI / 3,
        Math.min(Math.PI / 3, stateRef.current.targetRotationX)
      );

      stateRef.current.previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handleMouseEnter = () => {
      stateRef.current.isMouseOver = true;
    };

    const handleMouseLeave = () => {
      stateRef.current.isMouseOver = false;
      stateRef.current.hoveredUserId = null;
      setHoveredUser(null);
    };

    // Attach event listeners
    const container = mountRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUpOrLeave);
    container.addEventListener('mousemove', handleDrag);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Determine rotation speed
      const hasFocus = stateRef.current.isMouseOver || hoveredUser !== null || activeUserPin !== null;
      const rotationDecelerator = hasFocus ? 0.12 : 1.0; // Slow rotation by 88% on hover
      const baseRotation = stateRef.current.autoRotateSpeed * rotationDecelerator;

      if (!stateRef.current.isDragging) {
        stateRef.current.targetRotationY += baseRotation;
      }

      stateRef.current.currentRotationY +=
        (stateRef.current.targetRotationY - stateRef.current.currentRotationY) * 0.1;
      stateRef.current.currentRotationX +=
        (stateRef.current.targetRotationX - stateRef.current.currentRotationX) * 0.1;

      globeGroup.rotation.y = stateRef.current.currentRotationY;
      globeGroup.rotation.x = stateRef.current.currentRotationX;

      // Handle manual sweep pulse decay
      if (pulseIntensityRef.current > 0) {
        pulseIntensityRef.current -= 0.08;
      }
      const currentManualPulse = Math.max(0, pulseIntensityRef.current);

      userDots.forEach((dot, index) => {
        const basePulse = 1.0 + Math.sin(elapsedTime * 4 + index) * 0.25;
        // Sweeping ripple pulse expanding outward from each dot
        const sweepPulse = currentManualPulse * (1.5 + Math.sin(elapsedTime * 8 - index * 0.8) * 0.5);
        const finalScale = basePulse + sweepPulse;
        
        dot.pulseRing.scale.set(finalScale, finalScale, 1);
        
        const ringMaterial = dot.pulseRing.material as THREE.MeshBasicMaterial;
        if (currentManualPulse > 0) {
          ringMaterial.opacity = Math.max(0.1, 0.4 * (1.0 - (currentManualPulse / 4.0)));
        } else {
          ringMaterial.opacity = 0.4;
        }
        
        dot.pulseRing.lookAt(new THREE.Vector3(0, 0, 0));
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUpOrLeave);
      container.removeEventListener('mousemove', handleDrag);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hoveredUser, activeUserPin, activeUsersList]);

  // If selectedUser is updated from outside, align active pin
  useEffect(() => {
    if (selectedUser) {
      setActiveUserPin(selectedUser);
    }
  }, [selectedUser]);

  return (
    <div className="relative w-full h-[550px] md:h-[600px] flex items-center justify-center">
      {/* Globe Mounting Div */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
      />

      <div className="absolute inset-0 border border-earth-sage/20 rounded-full pointer-events-none scale-90 md:scale-95 animate-[spin_120s_linear_infinite]" />
      <div className="absolute inset-0 border border-dashed border-earth-clay/10 rounded-full pointer-events-none scale-75 animate-[spin_80s_linear_infinite_reverse]" />

      {/* 1. Floating Lightweight Hover Tooltip (Name only, offset from cursor, non-interactive) */}
      {hoveredUser && !activeUserPin && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
          className="z-40 pointer-events-none bg-earth-cocoa text-earth-bg border border-earth-cocoa px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg text-left"
        >
          {hoveredUser.name} <span className="opacity-70 font-medium">({hoveredUser.location})</span>
        </div>
      )}

      {/* 2. Stationary Pinned Client Details Card (Top-Right of Globe Container, highly interactive) */}
      {activeUserPin && (
        <div
          className="pinned-user-card absolute top-4 right-4 z-30 bg-[#F7F1DE]/95 backdrop-blur-xl border border-earth-cocoa/20 rounded-2xl p-4 shadow-2xl w-64 text-left flex flex-col gap-3 transition-all duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setActiveUserPin(null)}
            className="absolute top-2 right-3 text-earth-cocoa/50 hover:text-earth-cocoa text-base font-bold transition-colors cursor-pointer"
            aria-label="Close details"
          >
            &times;
          </button>

          {/* User details */}
          <div className="flex items-center gap-3 pr-4">
            <Avatar
              name={activeUserPin.name}
              className="w-10 h-10 text-sm rounded-full border border-earth-sage"
            />
            <div>
              <h4 className="text-earth-cocoa font-bold text-sm leading-tight">
                {activeUserPin.name}
              </h4>
              <p className="text-earth-cocoa/70 text-xs">{activeUserPin.location}</p>
            </div>
          </div>

          <hr className="border-earth-sage/35" />

          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#efe9d2]/60 p-2 rounded-xl border border-earth-sage/20">
              <span className="text-earth-cocoa/60 block mb-0.5">Health Score</span>
              <span
                className={`font-bold text-sm ${
                  activeUserPin.healthScore > 70
                    ? 'text-status-healthy-deep'
                    : activeUserPin.healthScore > 40
                    ? 'text-status-risk-deep'
                    : 'text-status-critical-deep'
                }`}
              >
                {activeUserPin.healthScore}/100
              </span>
            </div>
            <div className="bg-[#efe9d2]/60 p-2 rounded-xl border border-earth-sage/20">
              <span className="text-earth-cocoa/60 block mb-0.5">Risk of Leaving</span>
              <span
                className={`font-bold text-sm ${
                  activeUserPin.churnProbability < 15
                    ? 'text-status-healthy-deep'
                    : activeUserPin.churnProbability < 50
                    ? 'text-status-risk-deep'
                    : 'text-status-critical-deep'
                }`}
              >
                {activeUserPin.churnProbability}%
              </span>
            </div>
          </div>

          {/* Warning flags */}
          {activeUserPin.warningFlags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {activeUserPin.warningFlags.map((flag) => (
                <span
                  key={flag}
                  className="bg-status-risk-deep/10 border border-status-risk-deep/35 text-status-risk-deep px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider"
                >
                  {flag}
                </span>
              ))}
            </div>
          )}

          {/* Navigation link */}
          <button
            onClick={() => onSelectUser(activeUserPin)}
            className="w-full bg-earth-cocoa hover:bg-earth-clay text-earth-bg rounded-xl py-2.5 text-xs font-bold shadow-lg shadow-earth-cocoa/20 transition-all duration-200 cursor-pointer"
          >
            View Customer Details
          </button>
        </div>
      )}

      {/* Floating controls legend overlay */}
      <div className="absolute bottom-4 left-4 bg-[#F7F1DE]/90 backdrop-blur-md border border-earth-sage/30 rounded-xl p-3 text-[10px] text-earth-cocoa/80 flex flex-col gap-1.5 pointer-events-none shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-healthy-deep animate-pulse" />
          <span className="font-medium">Healthy Account (&gt;70)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-risk-deep animate-pulse" />
          <span className="font-medium">At-Risk Monitor (40-70)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-critical-deep animate-pulse" />
          <span className="font-medium">Critical Warning (&lt;40)</span>
        </div>
        <div className="mt-1 pt-1.5 border-t border-earth-sage/20 text-earth-cocoa/50">
          * Drag globe to rotate, Click star to pin client details
        </div>
      </div>
    </div>
  );
};
