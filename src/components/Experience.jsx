import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleUniverse from './ParticleUniverse';

const Experience = () => {
    return (
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ParticleUniverse />

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>

            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            {/* Disabled controls so hand interaction is primary, but kept for setup if needed */}
        </Canvas>
    );
};

export default Experience;
