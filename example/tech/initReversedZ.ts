import {
    type BaseHolder,
    type BufferHandleDetail,
    type RenderHolderDesc,
    Attributes,
    ColorAttachment,
    Compiler,
    Context,
    RenderHolder,
    RenderProperty,
    Uniforms,
} from "../../src"

import {
    mat4,
    vec3
} from 'wgpu-matrix';

/**
 * reversedZ
 * ref: https://webgpu.github.io/webgpu-samples/?sample=reversedZ#main.ts
 * ref: https://github.com/greggman/wgpu-matrix
 */
const initReversedZ = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], aspect: number, near: number, far: number): Promise<BaseHolder> => {

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

    const d = 0.0001;   // half distance between two planes
    const o = 0.5;      // half x offset to shift planes so they are only partially overlaping

    // float4 position, float4 color
    const vertexData = new Float32Array([
        -1 - o, -1, d, 1, 1, 0, 0, 1, 1 - o, -1, d, 1, 1, 0, 0, 1, -1 - o, 1, d, 1, 1, 0, 0, 1, 1 - o, -1, d, 1, 1, 0, 0, 1, 1 - o, 1, d, 1, 1, 0, 0, 1, -1 - o, 1, d, 1, 1, 0, 0, 1,
        -1 + o, -1, -d, 1, 0, 1, 0, 1, 1 + o, -1, -d, 1, 0, 1, 0, 1, -1 + o, 1, -d, 1, 0, 1, 0, 1, 1 + o, -1, -d, 1, 0, 1, 0, 1, 1 + o, 1, -d, 1, 0, 1, 0, 1, -1 + o, 1, -d, 1, 0, 1, 0, 1,
    ]);

    const vertexBuffer = compiler.createVertexBuffer({
        totalByteLength: vertexData.byteLength,
        rawData: vertexData
    });

    const WGSLCode = `

struct FRAGMENT
{
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

struct Camera
{
    view: mat4x4f,
    projection: mat4x4f,
}

@group(0) @binding(0) var<uniform> model_matrix: mat4x4f;
@group(0) @binding(1) var<uniform> camera: Camera;

@vertex
fn vs_main(@location(0) position: vec4f, @location(1) color: vec4f) -> FRAGMENT
{
    var f: FRAGMENT;
    // f.position = vec4<f32>(position.xy, 0.0, 1.0);
    // camera.view  * camera.projection
    f.position = camera.projection * camera.view * model_matrix * position;
    f.color = color;
    return f;
}

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4f {
    return f.color;
}

        `;

    const desc: RenderHolderDesc = {
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
        primitiveDesc: {
            cullFormat: 'none'
        },
        dispatch: new RenderProperty(12),
    };

    // attributes assign
    {
        desc.attributes.assign('position', vertexBuffer);
        desc.attributes.assign('color', vertexBuffer);
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
    }

    const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
    return renderHolder;
}

export {
    initReversedZ,
}