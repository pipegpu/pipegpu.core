import {
    mat4,
    vec3
} from "wgpu-matrix";

import {
    type BaseHolder,
    type BufferHandleDetail,
    type ColorAttachment,
    type Compiler,
    type Context,
    type RenderHolderDesc,
    Attributes,
    DepthStencilAttachment,
    RenderHolder,
    RenderProperty,
    Texture2D,
    Uniforms,
} from "../../src"

import { fetchMesh } from "../util/fetchMesh";


/**
 * ref: https://webgpu.github.io/webgpu-samples/?sample=deferredRendering
 */
const initDeferred = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment, aspect: number, near: number, far: number): Promise<BaseHolder[]> => {

    const holders: BaseHolder[] = [];

    let positionTexture: Texture2D;
    let normalTexture: Texture2D;

    const W = context.getViewportWidth(), H = context.getViewportHeight();

    {
        const WGSLCode = `

struct FRAGMENT
{
    @builtin(position) position: vec4f,
    @location(0) normal_ws: vec3f,
}

struct Camera
{
    view: mat4x4f,
    projection: mat4x4f,
}

@group(0) @binding(0) var<uniform> model_matrix: mat4x4f;
@group(0) @binding(1) var<uniform> camera: Camera;

@vertex
fn vs_main(@location(0) position: vec3f, @location(1) normal: vec3f) -> FRAGMENT {
  var f: FRAGMENT;
  let position_ws = (model_matrix * vec4(position, 1.0)).xyz;
  f.position = camera.projection * camera.view * vec4(position_ws, 1.0);
  f.normal_ws = normalize(model_matrix * vec4(normal, 1.0)).xyz;
  return f;
}
 
struct GBUFFER
{
    @location(0) position: vec4f,
    @location(1) normal: vec4f,
}

@fragment
fn fs_main(f: FRAGMENT) -> GBUFFER {
  var o: GBUFFER;
  o.position = f.position;
  o.normal = vec4(f.normal_ws, 1.0);
  return o;
}

        `;

        // dragonData.
        const dragonData = await fetchMesh('./asset/mesh/stanfordDragonData.json');
        const positionBuffer = compiler.createVertexBuffer({
            totalByteLength: dragonData.positions.byteLength,
            rawData: dragonData.positions,
        });
        const normalBuffer = compiler.createVertexBuffer({
            totalByteLength: dragonData.normals.byteLength,
            rawData: dragonData.normals
        });
        const indexBuffer = compiler.createIndexBuffer({
            rawData: dragonData.triangles
        });

        // depth stencil attachment
        const reversedZDepthTexture = compiler.createTexture2D({
            width: context.getViewportWidth(),
            height: context.getViewportHeight(),
            textureFormat: context.getPreferredDepthTexuteFormat(),
        });
        const reversedZDepthStencilAttachment = compiler.createDepthStencilAttachment({
            texture: reversedZDepthTexture,
            depthClearValue: 0.0,
            depthCompareFunction: 'greater-equal',
            depthLoadStoreFormat: 'clearStore'
        });

        // color attachments
        // position 
        positionTexture = compiler.createTexture2D({
            width: W,
            height: H,
            appendixTextureUsages: GPUTextureUsage.RENDER_ATTACHMENT,
            textureFormat: 'rgba16float',
            mipmapCount: 1,
        });
        const positionColorAttachment = compiler.createColorAttachment({
            texture: positionTexture,
            blendFormat: 'opaque',
            colorLoadStoreFormat: 'clearStore',
        });

        // normal
        normalTexture = compiler.createTexture2D({
            width: W,
            height: H,
            appendixTextureUsages: GPUTextureUsage.RENDER_ATTACHMENT,
            textureFormat: 'rgba16float',
            mipmapCount: 1,
        });
        const normalColorAttachment = compiler.createColorAttachment({
            texture: normalTexture,
            blendFormat: 'opaque',
            colorLoadStoreFormat: 'clearStore',
        });

        const desc: RenderHolderDesc = {
            label: `deferred generate gbuffer.`,
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
            colorAttachments: [positionColorAttachment, normalColorAttachment],
            depthStencilAttachment: reversedZDepthStencilAttachment,
            dispatch: new RenderProperty(indexBuffer)
        };

        // attributes
        {
            desc.attributes?.assign(`position`, positionBuffer);
            desc.attributes?.assign(`normal`, normalBuffer);
        }


        // uniforms
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
                    const viewMatrix = mat4.translation(vec3.fromValues(0, 0, -256.0));
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
        holders.push(renderHolder);
    }

    // deferred rendering
    {
        const WGSLCode = `

struct FRAGMENT
{
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> FRAGMENT
{
    var f: FRAGMENT;

    var positions: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(-1.0, 1.0),
        vec2<f32>(1.0, -1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(-1.0, 1.0),
    );

    var uvs: array<vec2<f32>, 6> = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 0.0)
    );

    f.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
    f.uv = uvs[vertexIndex];
    return f;
}

@group(0) @binding(0) var position_texture: texture_2d<f32>;
@group(0) @binding(1) var normal_texture: texture_2d<f32>;
@group(0) @binding(2) var texture_sampler: sampler;

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4 <f32>
{
    let normal: vec3<f32> = textureSample(normal_texture, texture_sampler, f.uv).xyz;
    return vec4<f32>(normal, 1.0);
}

        `;

        const textureSampler = compiler.createTextureSampler({
            debugLabel: 1
        });


        const desc: RenderHolderDesc = {
            label: `deferred shading.`,
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
            depthStencilAttachment: depthStencilAttachment,
            dispatch: new RenderProperty(6)
        };

        desc.uniforms?.assign(`position_texture`, positionTexture);
        desc.uniforms?.assign(`normal_texture`, normalTexture);
        desc.uniforms?.assign(`texture_sampler`, textureSampler);

        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }

    return holders;
};

export {
    initDeferred
}
