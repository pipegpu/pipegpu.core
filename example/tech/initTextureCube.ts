import { mat4, vec3 } from 'wgpu-matrix';

import {
    type BufferHandleDetail,
    type RenderLetDesc,
    Attributes,
    ColorAttachment,
    Compiler,
    Context,
    RenderLet,
    RenderProperty,
    TextureSampler,
    Uniforms
} from '../..';
import { fetchMesh } from "../util/fetchMesh";
import { fetchKTX2AsBc7RGBA, type KTXDataPack } from "../util/fetchKTX";
import type { TextureCube } from "../../src/res/texture/TextureCube";

/**
 * reversedZ
 * ref: https://webgpu.github.io/webgpu-samples/?sample=reversedZ#main.ts
 * ref: https://github.com/greggman/wgpu-matrix
 */
const initTextureCube = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], aspect: number, near: number, far: number): Promise<RenderLet> => {

    // depth stencil attachment
    const reversedZDepthTexture = compiler.createTexture2D({
        width: context.getViewportWidth(),
        height: context.getViewportHeight(),
        textureFormat: context.getPreferredDepthTexuteFormat(),
    });

    // need set depth attachment to 
    // depthClearValue: 0.0,
    // depthCompareFunction: 'greater',
    // depthLoadStoreFormat: 'clearStore'
    const reversedZDepthStencilAttachment = compiler.createDepthStencilAttachment({
        texture: reversedZDepthTexture,
        depthClearValue: 0.0,
        depthCompareFunction: 'greater-equal',
        depthLoadStoreFormat: 'clearStore'
    });

    const WGSLCode = `

struct FRAGMENT
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) normal: vec3f,
}

struct Camera
{
    view: mat4x4f,
    projection: mat4x4f,
}

@group(0) @binding(0) var<uniform> model_matrix: mat4x4f;
@group(0) @binding(1) var<uniform> camera: Camera;

@group(0) @binding(2) var sampler0: sampler;
@group(0) @binding(3) var texture0: texture_cube<f32>;

@vertex
fn vs_main(@location(0) position: vec3f) -> FRAGMENT
{
    var f: FRAGMENT;
    f.position = camera.projection * camera.view * model_matrix * vec4<f32>(position, 1.0);
    f.normal = normalize(position.xyz);
    f.color = vec4<f32>(position.xyz, 1.0);
    return f;
}

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4f {
    //f.color;
    return textureSample(texture0, sampler0, f.normal);
    // return vec4<f32>(1.0, 0.0, 0.0, 1.0); 
    // return f.color;
}

        `;

    // dragonData.
    const cubeData = await fetchMesh('./asset/mesh/cubeData.json');
    const positionBuffer = compiler.createVertexBuffer({
        totalByteLength: cubeData.positions.byteLength,
        rawData: cubeData.positions,
    });
    const indexBuffer = compiler.createIndexBuffer({
        rawData: cubeData.triangles
    });

    const desc: RenderLetDesc = {
        label: `reversedZ`,
        vertexShader: compiler.createVertexShader({
            code: WGSLCode,
            entryPoint: `vs_main`
        }),
        fragmentShader: compiler.createFragmentShader({
            code: WGSLCode,
            entryPoint: `fs_main`
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: colorAttachments,
        depthStencilAttachment: reversedZDepthStencilAttachment,
        dispatch: new RenderProperty(indexBuffer),
        primitiveDesc: {
            cullFormat: 'backCCW'
        }
    };

    // attributes assign
    {
        desc.attributes?.assign('position', positionBuffer);
    }

    // uniforms assign
    {
        let modelMatrix = mat4.identity();
        desc.uniforms?.assign('model_matrix', compiler.createUniformBuffer({
            totalByteLength: 16 * 4,
            handler: () => {
                const tmpMat4 = mat4.create();
                const now = Date.now() / 1000;
                mat4.rotate(
                    modelMatrix,
                    vec3.fromValues(Math.sin(now), Math.cos(now), 0),
                    (Math.PI / 180) * 30,
                    tmpMat4
                );
                // modelMatrix.rotateY(0.03);
                const detail: BufferHandleDetail = {
                    offset: 0,
                    byteLength: 16 * 4,
                    rawData: tmpMat4
                };
                return {
                    rewrite: true,
                    detail: detail
                }
            }
        }));
        desc.uniforms?.assign('camera', compiler.createUniformBuffer({
            totalByteLength: 16 * 4 * 2,
            handler: () => {
                const block = new ArrayBuffer(128);
                const cameraViews = {
                    view: new Float32Array(block, 0, 16),
                    projection: new Float32Array(block, 64, 16),
                };
                const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -12));
                cameraViews.view.set(viewMatrix);
                const projectionMatrix = mat4.perspectiveReverseZ((2.0 * Math.PI) / 5.0, aspect, near, far);
                cameraViews.projection.set(projectionMatrix);
                const detail: BufferHandleDetail = {
                    offset: 0,
                    byteLength: 16 * 4 * 2,
                    rawData: block
                };
                return {
                    rewrite: true,
                    detail: detail
                }
            }
        }));

        const PRESET_WIDTH = 1024;
        const PRESET_HEIGHT = 1024;
        const ktxDataPack1: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/1.ktx');
        const ktxDataPack2: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/2.ktx');
        const ktxDataPack3: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/3.ktx');

        const textureCube: TextureCube = compiler.createTextureCube({
            width: PRESET_WIDTH,
            height: PRESET_HEIGHT,
            faces: {
                posx: ktxDataPack2.data,
                negx: ktxDataPack2.data,
                posy: ktxDataPack1.data,
                negy: ktxDataPack1.data,
                posz: ktxDataPack3.data,
                negz: ktxDataPack3.data,
            },
            textureFormat: 'bc7-rgba-unorm',
            mipmapCount: 1
        });
        desc.uniforms?.assign(`texture0`, textureCube);

        const sampler: TextureSampler = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'nearest'
        });
        desc.uniforms?.assign(`sampler0`, sampler);
    }

    return compiler.compileRenderLet(desc);
}

export {
    initTextureCube,
}