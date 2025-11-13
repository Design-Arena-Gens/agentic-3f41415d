import { useMemo, useRef, useEffect, useCallback } from 'react';
import { Vector3 } from 'three';
import create from 'zustand';

const keyFrom = (x, y, z) => `${x},${y},${z}`;
const parseKey = (k) => k.split(',').map(Number);

const useBlocksStore = create((set, get) => ({
  blocks: new Set(),
  add: (pos) => set((state) => {
    const k = keyFrom(pos.x, pos.y, pos.z);
    if (!state.blocks.has(k)) {
      const next = new Set(state.blocks);
      next.add(k);
      return { blocks: next };
    }
    return state;
  }),
  remove: (pos) => set((state) => {
    const k = keyFrom(pos.x, pos.y, pos.z);
    if (state.blocks.has(k)) {
      const next = new Set(state.blocks);
      next.delete(k);
      return { blocks: next };
    }
    return state;
  }),
}));

function Ground({ size = 40, onClick }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={onClick}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#6b705c" roughness={1} />
    </mesh>
  );
}

const faceNormals = [
  new Vector3(1, 0, 0),
  new Vector3(-1, 0, 0),
  new Vector3(0, 1, 0),
  new Vector3(0, -1, 0),
  new Vector3(0, 0, 1),
  new Vector3(0, 0, -1),
];

export default function World() {
  const add = useBlocksStore((s) => s.add);
  const remove = useBlocksStore((s) => s.remove);
  const blocksSet = useBlocksStore((s) => s.blocks);

  // Seed initial platform one-time
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const seed = [];
    for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) seed.push([x, 0, z]);
    seed.forEach(([x, y, z]) => add(new Vector3(x, y, z)));
  }, [add]);

  const onBlockPointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      const button = e.nativeEvent?.button ?? 0; // 0 left, 2 right
      const obj = e.object;
      if (!obj) return;

      const p = obj.position.clone().round();

      if (button === 2) {
        // remove this block
        remove(p);
        return;
      }

      // place adjacent block based on face normal
      const fi = e.faceIndex ?? 0;
      const face = Math.floor(fi / 2);
      const normal = faceNormals[face] ?? new Vector3(0, 1, 0);
      const target = p.add(normal).round();
      add(target);
    },
    [add, remove]
  );

  const onBlockContextMenu = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      const p = e.object?.position?.clone()?.round();
      if (p) remove(p);
    },
    [remove]
  );

  const onGroundClick = useCallback(
    (e) => {
      e.stopPropagation();
      const p = e.point.clone().add(new Vector3(0, 0.5, 0)).floor();
      add(p);
    },
    [add]
  );

  const blocksArray = useMemo(() => Array.from(blocksSet).map(parseKey), [blocksSet]);

  return (
    <group>
      <Ground onClick={onGroundClick} />
      {blocksArray.map(([x, y, z]) => (
        <mesh
          key={`${x},${y},${z}`}
          position={[x, y, z]}
          castShadow
          receiveShadow
          onPointerDown={onBlockPointerDown}
          onContextMenu={onBlockContextMenu}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={y === 0 ? '#86c06c' : '#cb997e'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
