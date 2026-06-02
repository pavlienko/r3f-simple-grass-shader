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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Perf } from "r3f-perf";
import { GLTF, ShaderPass } from "three-stdlib";
import { MainShader } from "../shaders/mainShader";
import { GroundShader } from "../shaders/groundShader";
import grassModel from "../../assets/grass.glb";
import grassTex from "../../assets/grass.png";

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
extend({ GroundShader });
extend({ OrbitControls });
extend({ ShaderPass });

const PLANE_SIZE = 100
const GRASS_COUNT = 25000

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

    const [grassTexture] = useTexture([grassTex]);
    const gl = useThree((state) => state.gl);

    useMemo(() => {
        if (grassTexture) {
            grassTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
            grassTexture.minFilter = THREE.LinearMipmapLinearFilter;
        }
    }, [grassTexture, gl]);

    const { offsetArray } = useMemo(() => {
        const arr = new Array(count).fill(0);
        const dim = PLANE_SIZE / 2 - 1
        return {
            offsetArray: Float32Array.from(
                arr.flatMap((_, i) => [
                    THREE.MathUtils.randFloat(-dim, dim),
                    0,
                    THREE.MathUtils.randFloat(-dim, dim),
                ]),
            ),
        };
    }, [count]);

    const { rotationArray } = useMemo(() => {
        const arr = new Array(count).fill(0);
        return {
            rotationArray: Float32Array.from(
                arr.flatMap((_, i) => [THREE.MathUtils.randFloat(0, Math.PI * 2)]),
            ),
        };
    }, [count]);

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
        [grassTexture],
    );

    useFrame(({ clock }) => {
        shaderRef.current.uniforms.uTime.value = clock.getElapsedTime() * 2;
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
                <instancedBufferAttribute
                    attach="attributes-rotation"
                    args={[rotationArray, 1]}
                />
            </primitive>
            <mainShader
                ref={shaderRef}
                side={THREE.DoubleSide}
                uniforms={uniforms}
                alphaToCoverage={true}
            />
        </instancedMesh>
    );
};

function CinematicCamera() {
    useFrame(({ clock, camera }) => {
        const t = clock.getElapsedTime() * 0.2;

        const radius = 15;

        camera.position.x = Math.sin(t) * radius;
        camera.position.z = Math.cos(t) * radius;

        camera.position.y = 11 + Math.sin(t * 2.0) * 3.0;

        camera.lookAt(0, 2, 0);
    });

    return null;
}

const Scene: React.FC = () => {
    return (
        <div>
            <Canvas
                dpr={[1, 1.5]}
                gl={{ antialias: true }}
                style={{ width: "100vw", height: "100vh" }}
            // camera={{ position: [50, 13, 0], fov: 45 }}
            >
                <CinematicCamera />
                {/* <Controls /> */}
                <Sky
                    distance={450}
                    sunPosition={[0, 1, 0]}
                />
                <Suspense fallback={null}>
                    <ambientLight intensity={1} />
                    <Plane args={[PLANE_SIZE, PLANE_SIZE, 1, 1]} rotation-x={-Math.PI / 2}>
                        <groundShader />
                    </Plane>
                    <Field count={GRASS_COUNT} />
                </Suspense>
                <Perf showGraph={false} />
            </Canvas>
        </div>
    );
};

export default Scene;
