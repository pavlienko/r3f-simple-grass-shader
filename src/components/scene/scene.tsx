import { Canvas, extend, ReactThreeFiber, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { MainShader } from "../shader/shader";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mainShader: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof MainShader
      >;
    }
  }
}

extend({ MainShader });

const Primitive: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame(() => {
    shaderRef.current.uniforms.uTime.value += 0.1;
  });

  return (
    <mesh 
    ref={ref} 
    dispose={null} 
    // rotation-x={[Math.PI / 2]}
    >
      <planeBufferGeometry attach="geometry" args={[2, 2, 5, 5]} />
      <mainShader 
      attach="material" 
      ref={shaderRef} 
      side={THREE.DoubleSide}
      // wireframe={true}
      />
    </mesh>
  );
};

const Scene: React.FC = () => {
  return (
    <div>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [0, 0, 2], fov: 90 }}
      >
        <Suspense fallback={null}>
          <Primitive />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
