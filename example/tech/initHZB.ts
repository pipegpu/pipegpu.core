import {
    type BaseHolder,
    type BufferHandleDetail,
    type ComputeHolderDesc,
    type RenderHolderDesc,
    Attributes,
    ColorAttachment,
    Compiler,
    ComputeProperty,
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
 * 
 */
const initHZB = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], aspect: number, near: number, far: number): Promise<BaseHolder[]> => {

    // depth stencil attachment
    const depthTexture = compiler.createTexture2D({
        width: context.getViewportWidth(),
        height: context.getViewportHeight(),
        textureFormat: 'depth32float'
    });

    const holders: BaseHolder[] = [];

    // 0. generate depth
    {
        // need set depth attachment to 
        // depthClearValue: 0.0,
        // depthCompareFunction: 'greater',
        // depthLoadStoreFormat: 'clearStore'
        const depthAttachment = compiler.createDepthStencilAttachment({
            texture: depthTexture,
            depthClearValue: 1.0,
            depthCompareFunction: 'less-equal',
            depthLoadStoreFormat: 'clearStore',
        });

        const d = 0.01;   // half distance between two planes
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
            label: `depth bias`,
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
            depthStencilAttachment: depthAttachment,
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
                    const projectionMatrix = mat4.perspective((2.0 * Math.PI) / 5.0, aspect, near, far);
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

    // 1. copy depth to r32float
    const r32float_texture = compiler.createTextureStorage2D({
        width: context.getViewportWidth(),
        height: context.getViewportHeight(),
        textureFormat: 'r32float',
        appendixTextureUsages: GPUTextureUsage.RENDER_ATTACHMENT
    });

    {
        const LinearColorAttachment = compiler.createColorAttachment({
            texture: r32float_texture,
            blendFormat: 'disable'
        });

        const textureSampler = compiler.createTextureSampler({
            debugLabel: 1,
            samplerBindingType: 'non-filtering'
        });

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

@group(0) @binding(0) var depth_texture: texture_depth_2d;
@group(0) @binding(1) var texture_sampler: sampler;

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) f32
{
    let depth = textureSample(depth_texture, texture_sampler, f.uv);
    return depth;
}

        `;

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
            colorAttachments: [LinearColorAttachment],
            dispatch: new RenderProperty(6)
        };

        desc.uniforms?.assign(`depth_texture`, depthTexture);
        desc.uniforms?.assign(`texture_sampler`, textureSampler);

        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }

    // 2. hzb 构建
    {
        const workGroupX = 8, workGroupY = 8;
        const WGSLCode = `

requires readonly_and_readwrite_storage_textures;

@group(0) @binding(0) var input_texture: texture_storage_2d<r32float, read_write>;
@group(0) @binding(1) var output_texture: texture_storage_2d<r32float, read_write>;

@compute @workgroup_size(${workGroupX}, ${workGroupY}, 1)
fn cp_main(@builtin(global_invocation_id) global_id: vec3<u32>) 
{
    let src_dim = textureDimensions(input_texture);
    let dst_dim = textureDimensions(output_texture);
    if(global_id.x > dst_dim.x || global_id.y>dst_dim.y) {
        return;
    }

    let src_x = global_id.x * 2u;
    let src_y = global_id.y * 2u;

    let p0 = textureLoad(input_texture, vec2<u32>(src_x, src_y)).r;
    let p1 = textureLoad(input_texture, vec2<u32>(src_x + 1u, src_y)).r;
    let p2 = textureLoad(input_texture, vec2<u32>(src_x, src_y + 1u)).r;
    let p3 = textureLoad(input_texture, vec2<u32>(src_x + 1u, src_y + 1u)).r;
    let val = max(max(p0, p1), max(p2, p3));

    // let val = min(min(p0, p1), min(p2, p3));
    
    textureStore(output_texture, global_id.xy, vec4<f32>(val, 0.0, 0.0, 0.0));
}

        `;

        const computeShader = compiler.createComputeShader({
            code: WGSLCode,
            entryPoint: `cp_main`
        });

        for (let k = 0; k < r32float_texture.MaxMipmapCount; k++) {
            r32float_texture.cursor(k);
            const dispatch = new ComputeProperty(
                Math.max(Math.ceil((r32float_texture.Width >> k) / workGroupX), 1),
                Math.max(Math.ceil((r32float_texture.Height >> k) / workGroupY), 1),
                1
            );
            const desc: ComputeHolderDesc = {
                label: `download sampling: ${k}`,
                computeShader: computeShader,
                uniforms: new Uniforms(),
                dispatch: dispatch
            };
            desc.uniforms.assign('input_texture', r32float_texture);
            desc.uniforms.assign('output_texture', r32float_texture);
            holders.push(compiler.compileComputeHolder(desc))
        }

    }

    // 3. r32float 深度图可视化
    {
        const textureSampler = compiler.createTextureSampler({
            debugLabel: 2,
            samplerBindingType: 'non-filtering'
        });

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

@group(0) @binding(0) var r32float_texture: texture_2d<f32>;
@group(0) @binding(1) var texture_sampler: sampler;

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4<f32>
{
    let level: u32 = 10;
    let size = vec2<f32>(textureDimensions(r32float_texture, level).xy);
    let v = textureLoad(r32float_texture, vec2<u32>(f.uv * size), level);
    return v;
}

        `;

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
            dispatch: new RenderProperty(6)
        };

        desc.uniforms?.assign(`r32float_texture`, r32float_texture);
        desc.uniforms?.assign(`texture_sampler`, textureSampler);

        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }

    return holders;
}

export {
    initHZB,
}