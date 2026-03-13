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

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const ambientLight = new THREE.AmbientLight(0x7dd3fc, 0.45);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1.4, 30, 2);
    pointLight.position.set(5, 4, 12);
    scene.add(pointLight);

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

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const glowGeometry = new THREE.SphereGeometry(0.18, 16, 16);

    nodePositions.forEach((position, index) => {
      const glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
      glow.position.copy(position);
      glow.scale.setScalar(1 + (index % 3) * 0.35);
      group.add(glow);
    });

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
        opacity: 0.16,
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);
    }

    const particleCount = Math.max(80, nodes.length * 26);
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3;
      positions[stride] = (Math.random() - 0.5) * 20;
      positions[stride + 1] = (Math.random() - 0.5) * 12;
      positions[stride + 2] = (Math.random() - 0.5) * 10;
      sizes[index] = 0.45 + Math.random() * 1.15;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

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

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

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

    const render = () => {
      const elapsed = performance.now() * 0.00028;
      group.rotation.y = elapsed * 0.45;
      group.rotation.x = Math.sin(elapsed * 0.7) * 0.08;
      particles.rotation.z = -elapsed * 0.08;
      particles.position.y = Math.sin(elapsed * 0.9) * 0.18;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (
          !(object instanceof THREE.Mesh) &&
          !(object instanceof THREE.Points)
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
