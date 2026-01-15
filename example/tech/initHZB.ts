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
    Texture2D,
    Uniforms,
} from "../../src";

import {
    mat4,
    vec3
} from 'wgpu-matrix';

import { fetchMesh } from "../util/fetchMesh";

const createMipSlider = (mipmapCount: number, handler: Function): void => {
    const container = document.createElement('div');
    {
        container.style.position = 'fixed';
        container.style.bottom = `30px`;
        container.style.width = `320px`;
        container.style.left = `${window.innerWidth / 2 - 160}px`;
        container.style.background = 'rgba(0, 0, 0, 0.7)';
        container.style.color = 'white';
        container.style.padding = '15px';
        container.style.borderRadius = '12px';
        container.style.fontFamily = 'Arial, sans-serif';
        container.style.fontSize = '1em';
        container.style.alignContent = 'center';
    }

    const from = document.createElement('label');
    {
        from.id = `sliderValue`;
        from.setAttribute('for', 'volume');
        from.textContent = '00';
        from.style.fontWeight = 'bold';
        from.style.color = '#4CAF50';
        // from.style.marginRight = '10px';
    }

    const slider = document.createElement('input');
    {
        slider.type = 'range';
        slider.id = 'volume';
        slider.name = 'volume';
        slider.min = '00';
        slider.max = `${mipmapCount - 1}`;
        slider.value = '0';
        slider.step = '1';
        slider.style.width = '250px';
        slider.style.marginLeft = `15px`;
        slider.style.marginRight = `15px`;
        slider.style.cursor = 'pointer';
    }

    const to = document.createElement('span');
    {
        to.id = 'volumeValue';
        to.textContent = `${mipmapCount - 1}`;
        to.style.fontWeight = 'bold';
        to.style.right = `0px`;
        to.style.color = '#4CAF50';
    }

    slider.addEventListener('input', (_e) => {
        const v = Number((document.getElementById('volume') as HTMLInputElement).value);
        (document.getElementById('sliderValue') as HTMLLabelElement).textContent = `${v < 10 ? '0' + v : v}`;
        handler(v);
    });

    container.appendChild(from);
    container.appendChild(slider);
    container.appendChild(to);
    document.body.appendChild(container);
}

/**
 * @function initHZB
 * @example
 */
const initHZB = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], aspect: number, near: number, far: number): Promise<BaseHolder[]> => {
    // 
    const holders: BaseHolder[] = [];
    const W = context.getViewportWidth(), H = context.getViewportHeight();

    // depth stencil attachment
    const depthTexture: Texture2D = compiler.createTexture2D({
        width: W,
        height: H,
        textureFormat: 'depth32float'
    });

    // forward 
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
        
@group(0) @binding(0) var<uniform> model: mat4x4f;
@group(0) @binding(1) var<uniform> camera: Camera;
        
@vertex
fn vs_main(@location(0) position: vec3f, @location(1) normal: vec3f) -> FRAGMENT {
    var f: FRAGMENT;
    let position_ws = (model * vec4(position, 1.0)).xyz;
    f.position = camera.projection * camera.view * vec4(position_ws, 1.0);
    f.normal_ws = normalize(model * vec4(normal, 1.0)).xyz;
    return f;
}
         
@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4<f32> {
    return vec4(f.normal_ws, 1.0);
}
        
`;

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
            colorAttachments: colorAttachments,
            depthStencilAttachment: depthAttachment,
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
            desc.uniforms?.assign('model', compiler.createUniformBuffer({
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

    const hzbTexture = compiler.createTextureStorage2D({
        width: W,
        height: H,
        textureFormat: 'r32float',
        appendixTextureUsages: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING
    });
    //
    let level = 0;
    {
        createMipSlider(hzbTexture.MipmapCount, (l: number) => {
            level = l;
        });
    }
    // build hzb
    // step1: from depth texture: `depthTexture`
    // 1. copy depth to r32float
    {
        const hzbColorAttachment = compiler.createColorAttachment({
            texture: hzbTexture,
            blendFormat: 'disable'
        });

        const depthTextureSampler = compiler.createTextureSampler({
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            addressModeW: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            samplerBindingType: 'non-filtering',
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
    
@group(0) @binding(0) var depthTexture: texture_depth_2d;
@group(0) @binding(1) var depthTextureSampler: sampler;
    
@fragment
fn fs_main(f: FRAGMENT) -> @location(0) f32
{
    let size = vec2<f32>(textureDimensions(depthTexture, 0).xy);
    let xy = vec2<u32>(f.uv * size);
    let d = textureLoad(depthTexture, xy, 0);
    // let depth = textureSample(depthTexture, depthTextureSampler, f.uv);
    return d;
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
            colorAttachments: [hzbColorAttachment],
            dispatch: new RenderProperty(6)
        };

        desc.uniforms?.assign(`depthTexture`, depthTexture);
        desc.uniforms?.assign(`depthTextureSampler`, depthTextureSampler);

        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }

    // 2. build hzb
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
    if(global_id.x >= dst_dim.x || global_id.y >= dst_dim.y) {
        return;
    }

    let src_x = global_id.x * 2u - 1u;
    let src_y = global_id.y * 2u - 1u;

    let p0 = textureLoad(input_texture, vec2<u32>(src_x, src_y)).r;
    let p1 = textureLoad(input_texture, vec2<u32>(src_x + 1u, src_y)).r;
    let p2 = textureLoad(input_texture, vec2<u32>(src_x, src_y + 1u)).r;
    let p3 = textureLoad(input_texture, vec2<u32>(src_x + 1u, src_y + 1u)).r;
    let val = max(max(p0, p1), max(p2, p3));

    textureStore(output_texture, global_id.xy, vec4<f32>(val, 0.0, 0.0, 1.0));
}

                `;

        // https://github.com/pipegpu/pipegpu.core/issues/16
        hzbTexture.AutoIncrementMipLevelInStorageBinding(true);
        for (let k = 0; k < hzbTexture.MaxMipmapCount; k++) {
            hzbTexture.cursor(k);
            const dispatch = new ComputeProperty(
                Math.max(Math.ceil((hzbTexture.Width >> k) / workGroupX), 1),
                Math.max(Math.ceil((hzbTexture.Height >> k) / workGroupY), 1),
                1
            );
            const desc: ComputeHolderDesc = {
                label: `download sampling: ${k}`,
                computeShader: compiler.createComputeShader({
                    code: WGSLCode,
                    entryPoint: `cp_main`
                }),
                uniforms: new Uniforms(),
                dispatch: dispatch
            };
            desc.uniforms.assign('input_texture', hzbTexture);
            desc.uniforms.assign('output_texture', hzbTexture);
            holders.push(compiler.compileComputeHolder(desc))
        }

    }

    // depth visual
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

@group(0) @binding(0) var hzbTexture: texture_2d<f32>;
@group(0) @binding(1) var<uniform> l: u32;

@fragment
fn fs_main(f: FRAGMENT) -> @location(0) vec4<f32>
{
    let size = vec2<f32>(textureDimensions(hzbTexture, l).xy);
    let color4 = textureLoad(hzbTexture, vec2<u32>(f.uv * size), l);
    // let v = (color4.x - 0.9999) * 10000.0;
    let v = color4.x;
    return vec4<f32>(v, v, v, 1.0);
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

        desc.uniforms?.assign(`hzbTexture`, hzbTexture);
        desc.uniforms?.assign(`l`, compiler.createUniformBuffer({
            totalByteLength: 4,
            handler: () => {
                const buffer = new Uint32Array([level]);
                return {
                    rewrite: true,
                    detail: {
                        offset: 0,
                        byteLength: 4,
                        rawData: buffer
                    }
                }
            },
        }));
        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }

    return holders;
}

export {
    initHZB,
}