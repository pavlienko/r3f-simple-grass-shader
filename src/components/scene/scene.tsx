import { useTexture, Plane, useGLTF, Sky } from "@react-three/drei";
import {
  Canvas,
  extend,
  ReactThreeFiber,
  useFrame,
  useThree,
} from "@react-three/fiber";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";
import { MainShader } from "../shader/shader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Perf } from "r3f-perf";
import { GLTF } from "three-stdlib";

import grassModel from "../../assets/grass.glb";
import grassTex from "../../assets/grass.png";

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

type FieldProps = {
  count: number;
};

type GLTFResult = GLTF & {
  nodes: {
    grass: THREE.Mesh;
  };
  materials: {};
};

useGLTF.preload(grassModel);

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

const Field: React.FC<FieldProps> = ({ count }: FieldProps) => {
  const fieldRef = useRef<THREE.InstancedMesh>(null!);
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);

  const { offsetArray } = useMemo(() => {
    const arr = new Array(count).fill(0);
    return {
      offsetArray: Float32Array.from(
        arr.flatMap((_, i) => [
          THREE.MathUtils.randFloat(-10, 10),
          0,
          THREE.MathUtils.randFloat(-10, 10),
        ])
      ),
    };
  }, [count]);

  const [grassTexture] = useTexture([grassTex]);

  const { nodes } = useGLTF(grassModel) as unknown as GLTFResult;
  const geometry = useMemo(() => {
    return nodes.grass.geometry;
  }, [nodes]);

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
  });

  return (
    <instancedMesh
      ref={fieldRef}
      args={[undefined, undefined, count]}
      rotation-x={Math.PI}
      position={[0, 2, 0]}
    >
      <primitive object={geometry} attach="geometry">
        <instancedBufferAttribute
          attach="attributes-offset"
          args={[offsetArray, 3]}
        />
      </primitive>
      <mainShader
        ref={shaderRef}
        side={THREE.DoubleSide}
        uniforms={uniforms}
        transparent={true}
      />
    </instancedMesh>
  );
};

const Scene: React.FC = () => {
  return (
    <div>
      <Canvas
        // dpr={[1, 2]}
        style={{ width: "100vw", height: "100vh" }}
        camera={{ position: [12, 17, -12], fov: 35}}
        // onCreated={({ gl }) => gl.toneMapping = THREE.ReinhardToneMapping }
      >
        <Sky />
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <Field count={1000} />
          <Plane args={[21.2, 21.2, 1, 1]} rotation-x={-Math.PI / 2}>
            <meshBasicMaterial color={"#320"} />
          </Plane>
          <Controls />
        </Suspense>
        <Perf showGraph={false} />
      </Canvas>
    </div>
  );
};

export default Scene;
