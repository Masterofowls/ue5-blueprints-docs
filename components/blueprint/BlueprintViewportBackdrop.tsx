"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BlueprintNode } from "@/lib/types/blueprint";

interface BlueprintViewportBackdropProps {
  nodes: BlueprintNode[];
}

export default function BlueprintViewportBackdrop({
  nodes,
}: BlueprintViewportBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const lowMemoryDevice =
      "deviceMemory" in navigator &&
      typeof navigator.deviceMemory === "number" &&
      navigator.deviceMemory <= 4;
    const lowCpuDevice =
      typeof navigator.hardwareConcurrency === "number" &&
      navigator.hardwareConcurrency <= 6;
    const mobileViewport = window.innerWidth < 768;
    const mobileProfile =
      coarsePointerQuery.matches ||
      mobileViewport ||
      lowMemoryDevice ||
      lowCpuDevice;
    const reduceMotion = reducedMotionQuery.matches;
    const shouldAnimate = !reduceMotion;
    const particleCount = shouldAnimate
      ? Math.max(
          mobileProfile ? 24 : 56,
          nodes.length * (mobileProfile ? 8 : 16),
        )
      : 0;
    const maxFps = mobileProfile ? 24 : 40;
    const frameInterval = 1000 / maxFps;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !mobileProfile,
      powerPreference: mobileProfile ? "low-power" : "high-performance",
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, mobileProfile ? 1 : 1.5),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const ambientLight = new THREE.AmbientLight(
      0x7dd3fc,
      mobileProfile ? 0.32 : 0.45,
    );
    scene.add(ambientLight);

    if (!mobileProfile) {
      const pointLight = new THREE.PointLight(0x3b82f6, 1.2, 30, 2);
      pointLight.position.set(5, 4, 12);
      scene.add(pointLight);
    }

    const group = new THREE.Group();
    scene.add(group);

    const bounds = nodes.reduce(
      (accumulator, node) => ({
        minX: Math.min(accumulator.minX, node.position.x),
        maxX: Math.max(accumulator.maxX, node.position.x),
        minY: Math.min(accumulator.minY, node.position.y),
        maxY: Math.max(accumulator.maxY, node.position.y),
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
    );

    const rangeX =
      Number.isFinite(bounds.maxX - bounds.minX) && bounds.maxX > bounds.minX
        ? bounds.maxX - bounds.minX
        : 1200;
    const rangeY =
      Number.isFinite(bounds.maxY - bounds.minY) && bounds.maxY > bounds.minY
        ? bounds.maxY - bounds.minY
        : 800;

    const nodePositions = nodes.map((node, index) => {
      const normalizedX = ((node.position.x - bounds.minX) / rangeX - 0.5) * 12;
      const normalizedY = -((node.position.y - bounds.minY) / rangeY - 0.5) * 7;
      const normalizedZ = ((index % 5) - 2) * 0.24;

      return new THREE.Vector3(normalizedX, normalizedY, normalizedZ);
    });

    const glowGeometry = new THREE.SphereGeometry(
      0.18,
      mobileProfile ? 8 : 14,
      mobileProfile ? 8 : 14,
    );
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: mobileProfile ? 0.14 : 0.2,
      depthWrite: false,
    });
    const glowMesh = new THREE.InstancedMesh(
      glowGeometry,
      glowMaterial,
      nodePositions.length,
    );
    const instanceMatrix = new THREE.Matrix4();
    const instanceScale = new THREE.Vector3();

    nodePositions.forEach((position, index) => {
      instanceScale.setScalar(1 + (index % 3) * (mobileProfile ? 0.22 : 0.35));
      instanceMatrix.compose(position, new THREE.Quaternion(), instanceScale);
      glowMesh.setMatrixAt(index, instanceMatrix);
    });

    glowMesh.instanceMatrix.needsUpdate = true;
    group.add(glowMesh);

    if (nodePositions.length > 1) {
      const lineSegments: number[] = [];

      for (let index = 0; index < nodePositions.length - 1; index += 1) {
        const current = nodePositions[index];
        const next = nodePositions[index + 1];
        lineSegments.push(
          current.x,
          current.y,
          current.z,
          next.x,
          next.y,
          next.z,
        );
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(lineSegments, 3),
      );

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: mobileProfile ? 0.1 : 0.16,
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);
    }

    let particles: THREE.Points<
      THREE.BufferGeometry,
      THREE.ShaderMaterial
    > | null = null;

    if (particleCount > 0) {
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let index = 0; index < particleCount; index += 1) {
        const stride = index * 3;
        positions[stride] = (Math.random() - 0.5) * 20;
        positions[stride + 1] = (Math.random() - 0.5) * 12;
        positions[stride + 2] = (Math.random() - 0.5) * 10;
        sizes[index] =
          (mobileProfile ? 0.4 : 0.45) +
          Math.random() * (mobileProfile ? 0.7 : 1.15);
      }

      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      particlesGeometry.setAttribute(
        "size",
        new THREE.BufferAttribute(sizes, 1),
      );

      const particlesMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          colorA: { value: new THREE.Color("#38bdf8") },
          colorB: { value: new THREE.Color("#22d3ee") },
        },
        vertexShader: `
          attribute float size;
          varying float vMix;

          void main() {
            vMix = clamp((position.z + 5.0) / 10.0, 0.0, 1.0);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * 10.0 * (1.0 / max(0.35, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying float vMix;

          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            float alpha = smoothstep(0.5, 0.0, dist) * 0.6;
            vec3 color = mix(colorA, colorB, vMix);
            gl_FragColor = vec4(color, alpha);
          }
        `,
      });

      particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
    }

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(container);

    let animationFrame = 0;
    let isVisible = document.visibilityState === "visible";
    let isInViewport = true;
    let lastFrameTime = 0;

    const renderScene = (elapsed: number) => {
      group.rotation.y = elapsed * (mobileProfile ? 0.2 : 0.45);
      group.rotation.x =
        Math.sin(elapsed * 0.7) * (mobileProfile ? 0.04 : 0.08);

      if (particles) {
        particles.rotation.z = -elapsed * (mobileProfile ? 0.04 : 0.08);
        particles.position.y =
          Math.sin(elapsed * 0.9) * (mobileProfile ? 0.1 : 0.18);
      }

      renderer.render(scene, camera);
    };

    const trySchedule = () => {
      if (!shouldAnimate || !isVisible || !isInViewport) {
        return;
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const render = (timestamp: number) => {
      if (!isVisible || !isInViewport) {
        animationFrame = 0;
        return;
      }

      if (timestamp - lastFrameTime < frameInterval) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      lastFrameTime = timestamp;
      renderScene(timestamp * 0.00028);
      animationFrame = window.requestAnimationFrame(render);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry?.isIntersecting ?? true;

        if (!isInViewport && animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
          return;
        }

        if (isInViewport && !animationFrame) {
          trySchedule();
        }
      },
      {
        threshold: 0.05,
      },
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";

      if (!isVisible && animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        return;
      }

      if (isVisible && !animationFrame) {
        trySchedule();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (shouldAnimate) {
      trySchedule();
    } else {
      renderScene(0);
    }

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (
          !(object instanceof THREE.Mesh) &&
          !(object instanceof THREE.Points) &&
          !(object instanceof THREE.LineSegments) &&
          !(object instanceof THREE.InstancedMesh)
        ) {
          return;
        }

        object.geometry.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            material.dispose();
          });
          return;
        }

        object.material.dispose();
      });
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [nodes]);

  return (
    <div
      ref={containerRef}
      className="blueprint-editor-shell__three"
      aria-hidden="true"
    />
  );
}
