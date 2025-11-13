'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import World from '../components/World';

export default function Page() {
  return (
    <>
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [6, 6, 6], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5,10,5]} intensity={0.9} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <World />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
          <Stats />
        </Canvas>
      </div>
      <div className="ui">
        <div><b>Mindcraft</b> ? voxel sandbox</div>
        <div>Left click: place block</div>
        <div>Right click: remove block</div>
        <div>Scroll: zoom, Drag: rotate</div>
      </div>
    </>
  );
}
