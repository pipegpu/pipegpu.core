import { Attributes, ColorAttachment, ComputeProperty, DepthStencilAttachment, MapBuffer, RenderHolder, RenderProperty, Uniforms, type BaseHolder, type Compiler, type ComputeHolderDesc, type RenderHolderDesc } from "../../src"
import { fetchKTX2AsBc7RGBA, type KTXDataPack } from "../util/fetchKTX";

let texelCopyDebugBuffer: MapBuffer;

/**
 * 
 * debug buffer execute in tail of graph:
 * @example
 * const rawDebugBuffer = await texelCopyDebugBuffer.PullDataAsync(0, 4);
 * const f32DebugBuffer = new Float32Array(texelCopyDebugBuffer as ArrayBuffer);
 * console.log(f32DebugBuffer);
 * 
 */
const initTexelCopy = async (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<BaseHolder[]> => {

    const ktxDataPack: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/1.ktx');

    const wx = ktxDataPack.width, wy = ktxDataPack.height, wz = 1;

    const texture_2d = compiler.createTexture2D({
        width: wx,
        height: wy,
        textureData: ktxDataPack.data,
        textureFormat: 'bc7-rgba-unorm',
        mipmapCount: 1
    });

    const texture_storage_2d = compiler.createTextureStorage2D({
        width: wx,
        height: wy,
        textureFormat: 'r32float',
        mipmapCount: 1,
    });

    const texture_2d_copied = compiler.createTexture2D({
        width: wx,
        height: wy,
        textureFormat: 'r32float',
        mipmapCount: 1,
    });

    const workgroup_size: number[] = [16, 16, 1];

    const WGSLCode0 = `

requires readonly_and_readwrite_storage_textures;

@group(0) @binding(0) var texture_2d_src : texture_2d<f32>;

@group(0) @binding(1) var texture_storage_2d_dst : texture_storage_2d<r32float, read_write>;

@group(0) @binding(2) var<storage, read_write> debug: array<f32>;

@compute @workgroup_size(${workgroup_size[0]}, ${workgroup_size[1]}, ${workgroup_size[2]})
fn cp_main(@builtin(global_invocation_id) global_id: vec3<u32>) 
{
    let rgba: vec4<f32> = textureLoad(texture_2d_src, global_id.xy, 0);
    let color4: vec4<f32> = vec4<f32>(rgba.r, 0.0, 0.0, 1.0);
    textureStore(texture_storage_2d_dst, global_id.xy, color4);
    debug[0] = textureLoad(texture_2d_src, vec2<u32>(512, 512), 0).r;
}

    `;

    texelCopyDebugBuffer = compiler.createMapBuffer({
        totalByteLength: 4,
        rawDataArray: [new Float32Array([0])],
    });

    const desc0: ComputeHolderDesc = {
        label: "texel copy",
        computeShader: compiler.createComputeShader({
            code: WGSLCode0,
            entryPoint: `cp_main`
        }),
        uniforms: new Uniforms(),
        dispatch: new ComputeProperty(wx / 16, wy / 16, wz),
    }

    desc0.uniforms?.assign('texture_2d_src', texture_2d);
    desc0.uniforms?.assign('texture_storage_2d_dst', texture_storage_2d);
    desc0.uniforms?.assign('debug', texelCopyDebugBuffer);

    // copy texture 
    // copy texture storage 2d -> texture 2d.
    desc0.handler = (_encoder: GPUCommandEncoder): void => {
        const copySize: GPUExtent3DDict = {
            width: wx,
            height: wy,
            depthOrArrayLayers: 1
        };
        const src: GPUTexelCopyTextureInfo = {
            texture: texture_storage_2d.getGpuTexture(),
            mipLevel: 0,
            origin: [0, 0, 0],
            aspect: 'all'
        };
        const dst: GPUTexelCopyTextureInfo = {
            texture: texture_2d_copied.getGpuTexture(),
            mipLevel: 0,
            origin: [0, 0, 0],
            aspect: 'all'
        };
        _encoder.copyTextureToTexture(src, dst, copySize);
    }

    const copyHolder = compiler.compileComputeHolder(desc0);

    const WGSLCode1 = `

struct VertexOutput
{
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@location(0) in_position: vec2<f32>, @location(1) in_uv: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(in_position, 0.0, 1.0);
    out.uv = in_uv;
    return out;
}

@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let uv: vec2<f32> = vec2<f32>(in.uv.x, in.uv.y);
    let r = textureSample(texture, textureSampler, uv).r;
    return vec4<f32>(r, r, r, 1.0);
}

        `;

    let dispatch1: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch1 = new RenderProperty(indexBuffer);
    }

    const desc1: RenderHolderDesc = {
        label: "texel texture render",
        vertexShader: compiler.createVertexShader({
            code: WGSLCode1,
            entryPoint: `vs_main`
        }),
        fragmentShader: compiler.createFragmentShader({
            code: WGSLCode1,
            entryPoint: `fs_main`
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
        dispatch: dispatch1
    }

    // attributes
    {
        const positionData = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5]);
        const vertexBuffer = compiler.createVertexBuffer({
            totalByteLength: positionData.byteLength,
            rawData: positionData,
        });
        desc1.attributes?.assign("in_position", vertexBuffer);
        const uvData = new Float32Array([0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0]);
        const uvBuffer = compiler.createVertexBuffer({
            totalByteLength: uvData.byteLength,
            rawData: uvData,
        });
        desc1.attributes?.assign('in_uv', uvBuffer);
    }

    // uniforms
    {
        // r32float need no-flitering
        const textureSampler = compiler.createTextureSampler({
            minFilter: 'nearest',
            magFilter: 'nearest',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'nearest',
            samplerBindingType: 'non-filtering',
        });
        desc1.uniforms?.assign('textureSampler', textureSampler);
        desc1.uniforms?.assign('texture', texture_2d_copied);
    }

    const renderHolder: RenderHolder = compiler.compileRenderHolder(desc1);

    return [copyHolder, renderHolder];
}

export {
    initTexelCopy,
    texelCopyDebugBuffer,
}