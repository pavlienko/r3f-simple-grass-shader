import { useTexture } from "@react-three/drei";
import {
  Canvas,
  extend,
  ReactThreeFiber,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { MainShader } from "../shader/shader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// import grassTex from "../../assets/grass.jpg";
import grassTex from "../../assets/grass.png";
import { DirectionalLight } from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mainShader: ReactThreeFiber.Object3DNode<
        THREE.ShaderMaterial,
        typeof MainShader
      >;
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}

extend({ MainShader });
extend({ OrbitControls });

function Controls() {
  const controls = useRef<OrbitControls>(null!);
  const { camera, gl } = useThree();
  useFrame(() => (controls.current ? controls.current.update() : undefined));
  return (
    <orbitControls
      ref={controls}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
    />
  );
}

const Primitive: React.FC = () => {
  const bush = useRef<THREE.Group>(null!);
  const ref = useRef<THREE.Mesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);
  const pointLight = useRef<THREE.PointLight>(null!);

  const [grassTexture] = useTexture([grassTex]);

  const uniforms = useMemo(
    () => ({
      uTime: {
        type: "f",
        value: 1.0,
      },
      uTexture: {
        type: "t",
        value: grassTexture,
      },
    }),
    [grassTexture]
  );

  useFrame(() => {
    shaderRef.current.uniforms.uTime.value += 0.1;
    pointLight.current.position.y = Math.sin(shaderRef.current.uniforms.uTime.value) + 3;
  });

  const distanceMaterial = new THREE.MeshDistanceMaterial({
    alphaMap: grassTexture,
    alphaTest: 0.5,
  });

  const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map: grassTexture,
    alphaTest: 0.5,
  });
  
  return (
    <group ref={bush}>
      <pointLight
        ref={pointLight}
        position={[1, 1, 1]}
        intensity={10}
        color={"orange"}
        castShadow={true}
        shadowBias={-0.005}
      />
      <mesh
        ref={ref}
        dispose={null}
        position={[0, 1, 0]}
        castShadow
        customDistanceMaterial={distanceMaterial}
        customDepthMaterial={depthMaterial}
      >
        <planeGeometry attach="geometry" args={[2, 2, 5, 5]} />
        <mainShader
          attach="material"
          ref={shaderRef}
          side={THREE.DoubleSide}
          uniforms={uniforms}
          transparent={true}
          shadowSide={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const Scene: React.FC = () => {

  return (
    <div>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [4, 4, -3], fov: 90 }}
        shadows
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />

          <directionalLight
            intensity={1}
            color={"orange"}
            position={[5, 5, 5]}
            castShadow
            shadowBias={-0.005}
          />

          <Primitive />
          <mesh position={[1, 1, 1]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial color={"orange"} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[10, 10, 5, 5]} />
            <meshStandardMaterial color={"green"} wireframe={false} />
          </mesh>
          <Controls />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
