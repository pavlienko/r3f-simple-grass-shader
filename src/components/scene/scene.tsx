import { useTexture, Plane, useGLTF, Sky } from "@react-three/drei";
import {
  Canvas,
  extend,
  ReactThreeFiber,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Perf } from "r3f-perf";
import { GLTF, ShaderPass, FXAAShader } from "three-stdlib";
import { MainShader } from "../shaders/mainShader";
import { GroundShader } from "../shaders/groundShader";
import grassModel from "../../assets/grass.glb";
import grassTex from "../../assets/grass-new.png";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mainShader: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof MainShader
      >;
      groundShader: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof GroundShader
      >;
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
      shaderPass: ReactThreeFiber.Node<ShaderPass, typeof ShaderPass>;
    }
  }
}

type FieldProps = { count: number };
type GLTFResult = GLTF & { nodes: { grass: THREE.Mesh } };

useGLTF.preload(grassModel);
extend({ MainShader, GroundShader, OrbitControls, ShaderPass });

function Controls() {
  const ref = useRef<OrbitControls>(null!);
  const { camera, gl } = useThree();
  useFrame(() => ref.current.update());
  return (
    <orbitControls
      ref={ref}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
    />
  );
}

const Field: React.FC<FieldProps> = ({ count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const [grassTexture] = useTexture([grassTex]);
  const { nodes } = useGLTF(grassModel) as GLTFResult;

  // precompute offsets & rotations once
  const offsets = Float32Array.from(
    new Array(count).flatMap(() => [
      THREE.MathUtils.randFloat(-10, 10),
      0,
      THREE.MathUtils.randFloat(-10, 10),
    ])
  );
  const rotations = Float32Array.from(
    new Array(count).flatMap(() => [THREE.MathUtils.randFloat(0, Math.PI * 2)])
  );

  // pass uniforms
  const uniforms = {
    uTime: { value: 0 },
    uTexture: { value: grassTexture },
  };

  useFrame((_, delta) => {
    shaderRef.current.uniforms.uTime.value += delta * 0.15;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[nodes.grass.geometry, undefined, count]}
      rotation-x={Math.PI}
      position={[0, 2, 0]}
    >
      <instancedBufferAttribute attach="attributes-offset" args={[offsets, 3]} />
      <instancedBufferAttribute
        attach="attributes-rotation"
        args={[rotations, 1]}
      />
      <mainShader ref={shaderRef} side={THREE.DoubleSide} uniforms={uniforms} transparent />
    </instancedMesh>
  );
};

let fxaa = FXAAShader;
fxaa.uniforms.resolution.value = new THREE.Vector2(
  1 / window.innerWidth,
  1 / window.innerHeight
);

const Scene: React.FC = () => (
  <Canvas
    style={{ width: "100vw", height: "100vh" }}
    camera={{ position: [12, 17, -12], fov: 35 }}
    onCreated={({ gl }) => {
      gl.toneMapping = THREE.ReinhardToneMapping;
    }}
  >
    <Controls />
    <Sky distance={450000} sunPosition={[0, 1, 0]} />
    <Suspense fallback={null}>
      <ambientLight intensity={1} />
      <Plane args={[21.2, 21.2]} rotation-x={-Math.PI / 2}>
        <groundShader />
      </Plane>
      <Field count={700} />
    </Suspense>
    <Perf showGraph={false} />
    <Effects>
      {/* only FXAA now, no heavy multisampling */}
      <shaderPass args={[fxaa]} />
    </Effects>
  </Canvas>
);

export default Scene;
