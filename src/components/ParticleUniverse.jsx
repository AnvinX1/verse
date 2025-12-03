import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../store/useStore';

// Custom Shader for soft, glowing particles
const vertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    // Circular particle with soft edge
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    float glow = 1.0 - (r * 2.0);
    glow = pow(glow, 1.5); // Sharpen the glow slightly
    gl_FragColor = vec4(vColor, glow);
  }
`;

const ParticleUniverse = () => {
    const pointsRef = useRef();
    const hands = useStore((state) => state.hands);

    // Smoothing Refs
    const smoothedTarget = useRef({ x: 0, y: 0, z: 0 });
    const smoothedExpansion = useRef(1.0);

    const particlesCount = 15000;

    const { positions, colors, sizes, originalPositions } = useMemo(() => {
        const pos = new Float32Array(particlesCount * 3);
        const col = new Float32Array(particlesCount * 3);
        const siz = new Float32Array(particlesCount);
        const origPos = new Float32Array(particlesCount * 3);

        const colorPalette = [
            new THREE.Color('#ffaa33'), // Deep Orange
            new THREE.Color('#ffdd88'), // Gold
            new THREE.Color('#ffffff'), // White
            new THREE.Color('#cc4400'), // Reddish Orange
        ];

        for (let i = 0; i < particlesCount; i++) {
            // Interstellar Gargantua Style
            const isDisk = Math.random() > 0.15; // Most particles in the disk

            let x, y, z;
            let r, theta;

            if (isDisk) {
                // Accretion Disk
                const rBase = Math.random();
                r = 4 + rBase * 16;
                theta = Math.random() * 2 * Math.PI;

                // Flattened disk with slight thickness
                const thickness = 0.5 * (1 - rBase);

                x = r * Math.cos(theta);
                y = (Math.random() - 0.5) * thickness;
                z = r * Math.sin(theta);
            } else {
                // "Lensed" Halo / Vertical scatter
                r = 4 + Math.random() * 5;
                theta = Math.random() * 2 * Math.PI;
                const phi = Math.random() * 2 * Math.PI;

                x = r * Math.sin(phi) * Math.cos(theta);
                y = r * Math.sin(phi) * Math.sin(theta);
                z = r * Math.cos(phi);
            }

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            origPos[i * 3] = x;
            origPos[i * 3 + 1] = y;
            origPos[i * 3 + 2] = z;

            // Colors
            const dist = Math.sqrt(x * x + z * z);
            let color;
            if (dist < 6) {
                color = new THREE.Color('#ffffff'); // Hot center
            } else if (dist < 10) {
                color = new THREE.Color('#ffdd88'); // Gold
            } else {
                color = new THREE.Color('#cc4400'); // Red edge
            }

            color.lerp(colorPalette[Math.floor(Math.random() * colorPalette.length)], 0.3);

            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;

            // Sizes
            siz[i] = Math.random() * 0.15 + 0.02;
        }
        return { positions: pos, colors: col, sizes: siz, originalPositions: origPos };
    }, []);

    // Helper to detect fist (fingertips close to wrist)
    const isFist = (hand) => {
        const wrist = hand[0];
        const tips = [hand[8], hand[12], hand[16], hand[20]]; // Index, Middle, Ring, Pinky tips
        let avgDist = 0;
        for (let tip of tips) {
            const dx = tip.x - wrist.x;
            const dy = tip.y - wrist.y;
            avgDist += Math.sqrt(dx * dx + dy * dy);
        }
        avgDist /= 4;
        return avgDist < 0.1; // Threshold for fist (normalized coords)
    };

    useFrame((state, delta) => {
        if (!pointsRef.current) return;

        const positionsAttribute = pointsRef.current.geometry.attributes.position;
        const currentPositions = positionsAttribute.array;

        // Slow rotation
        pointsRef.current.rotation.y += delta * 0.05;

        let rawTargetX = 0;
        let rawTargetY = 0;
        let rawTargetZ = 0;
        let rawExpansion = 1.0;
        let attractionStrength = 0;
        let isImploding = false;

        // Interaction Logic
        if (hands && hands.length > 0) {
            const mapCoord = (val) => (val - 0.5) * -30;

            if (hands.length === 1) {
                // Single Hand
                const hand = hands[0];
                const hx = mapCoord(hand[9].x);
                const hy = mapCoord(hand[9].y);

                rawTargetX = hx;
                rawTargetY = hy;

                if (isFist(hand)) {
                    // FIST: IMPLOSION
                    attractionStrength = 20.0;
                    rawExpansion = 0.1;
                    isImploding = true;
                } else {
                    // OPEN: Normal Control
                    attractionStrength = 3.0;
                    rawExpansion = 1.0;
                }

            } else if (hands.length >= 2) {
                // Two Hands
                const h1 = hands[0];
                const h2 = hands[1];

                const h1x = mapCoord(h1[9].x);
                const h1y = mapCoord(h1[9].y);
                const h2x = mapCoord(h2[9].x);
                const h2y = mapCoord(h2[9].y);

                rawTargetX = (h1x + h2x) / 2;
                rawTargetY = (h1y + h2y) / 2;

                const dx = h1[9].x - h2[9].x;
                const dy = h1[9].y - h2[9].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                rawExpansion = 0.5 + (dist * 4.0);
                attractionStrength = 5.0;
            }
        }

        // Apply Smoothing
        const lerpFactor = 0.1;

        if (!hands || hands.length === 0) {
            rawTargetX = 0;
            rawTargetY = 0;
            rawTargetZ = 0;
            rawExpansion = 1.0;
            attractionStrength = 0;
        }

        smoothedTarget.current.x += (rawTargetX - smoothedTarget.current.x) * lerpFactor;
        smoothedTarget.current.y += (rawTargetY - smoothedTarget.current.y) * lerpFactor;
        smoothedTarget.current.z += (rawTargetZ - smoothedTarget.current.z) * lerpFactor;
        smoothedExpansion.current += (rawExpansion - smoothedExpansion.current) * lerpFactor;

        const targetX = smoothedTarget.current.x;
        const targetY = smoothedTarget.current.y;
        const targetZ = smoothedTarget.current.z;
        const expansionFactor = smoothedExpansion.current;


        for (let i = 0; i < particlesCount; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            const ox = originalPositions[ix];
            const oy = originalPositions[iy];
            const oz = originalPositions[iz];

            let px = currentPositions[ix];
            let py = currentPositions[iy];
            let pz = currentPositions[iz];

            const tx = ox * expansionFactor;
            const ty = oy * expansionFactor;
            const tz = oz * expansionFactor;

            if (attractionStrength > 0) {
                const destX = targetX + tx;
                const destY = targetY + ty;
                const destZ = targetZ + tz;

                const speed = isImploding ? 10.0 : 2.0;
                px += (destX - px) * delta * speed;
                py += (destY - py) * delta * speed;
                pz += (destZ - pz) * delta * speed;

                if (isImploding) {
                    px += (Math.random() - 0.5) * 0.5;
                    py += (Math.random() - 0.5) * 0.5;
                    pz += (Math.random() - 0.5) * 0.5;
                }

            } else {
                px += (ox - px) * delta * 0.5;
                py += (oy - py) * delta * 0.5;
                pz += (oz - pz) * delta * 0.5;
            }

            px += (Math.random() - 0.5) * 0.02;
            py += (Math.random() - 0.5) * 0.02;
            pz += (Math.random() - 0.5) * 0.02;

            currentPositions[ix] = px;
            currentPositions[iy] = py;
            currentPositions[iz] = pz;
        }

        positionsAttribute.needsUpdate = true;
    });

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    }), []);

    return (
        <group>
            {/* Event Horizon (Black Sphere) */}
            <mesh position={[smoothedTarget.current.x, smoothedTarget.current.y, smoothedTarget.current.z]}>
                <sphereGeometry args={[2.5, 32, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Accretion Halo (Glowing Ring) */}
            <mesh position={[smoothedTarget.current.x, smoothedTarget.current.y, smoothedTarget.current.z]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[4, 0.1, 16, 100]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={0.5} />
            </mesh>

            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particlesCount}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={particlesCount}
                        array={colors}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        count={particlesCount}
                        array={sizes}
                        itemSize={1}
                    />
                </bufferGeometry>
                <primitive object={shaderMaterial} attach="material" />
            </points>
        </group>
    );
};

export default ParticleUniverse;
