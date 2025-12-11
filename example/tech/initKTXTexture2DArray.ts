import { Attributes, ColorAttachment, DepthStencilAttachment, RenderHolder, RenderProperty, Uniforms, type BaseHolder, type Compiler, type RenderHolderDesc } from "../../src";
import { fetchKTX2AsBc7RGBA, type KTXDataPack } from "../util/fetchKTX";

const initKTXTexture2DArray = async (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<BaseHolder> => {

    let dispatch: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }

    const code: string = `
    
struct VertexInput
{
	@location(0) position: vec2f,
	@location(1) uv: vec2f
};

struct VertexOutput
{
    @builtin(position) position:vec4f,
	@location(0) uv: vec2f
};

@vertex
fn vs_main(in: VertexInput) -> VertexOutput {
    var out:VertexOutput;
    out.position = vec4f(in.position, 0.0, 1.0);
	out.uv =in.uv;
    return out;
}

@group(0) @binding(0) var texture_sampler: sampler;
@group(0) @binding(1) var texture_array: texture_2d_array<f32>;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
	// array index sort by uv.z
	// z as integer
    var color = textureSample(texture_array, texture_sampler, in.uv, 0) * 0.3;
    color += textureSample(texture_array, texture_sampler, in.uv, 1) * 0.3;
    color += textureSample(texture_array, texture_sampler, in.uv, 2) * 0.3;
	return color;
}

    `;

    let desc: RenderHolderDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: code,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: code,
            entryPoint: "fs_main"
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
        dispatch: dispatch,
    };

    // position
    {
        const positionData = new Float32Array([
            -0.5, 0.5,
            -0.5, -0.5,
            0.5, -0.5,
            0.5, 0.5,
        ]);
        const vertexBuffer = compiler.createVertexBuffer({
            totalByteLength: positionData.byteLength,
            rawData: positionData,
        });
        desc.attributes?.assign("position", vertexBuffer);
    }

    // uv
    {
        const uvData = new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0
        ]);
        const uvBuffer = compiler.createVertexBuffer({
            totalByteLength: uvData.byteLength,
            rawData: uvData,
        });
        desc.attributes?.assign('uv', uvBuffer);
    }

    // sampler
    {
        const textureSampler = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('texture_sampler', textureSampler);
    }

    // texture2d array (.ktx support)
    {
        const PRESET_WIDTH = 1024;
        const PRESET_HEIGHT = 1024;
        const ktxDataPack1: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/1.ktx');
        const ktxDataPack2: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/2.ktx');
        const ktxDataPack3: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/3.ktx');

        const dataArray: Uint8Array[] = [];
        dataArray.push(ktxDataPack1.data);
        dataArray.push(ktxDataPack2.data);
        dataArray.push(ktxDataPack3.data);

        const texture2DArray = compiler.createTexture2DArray(
            {
                width: PRESET_WIDTH,
                height: PRESET_HEIGHT,
                depthOrArrayLayers: 3,
                textureDataArray: dataArray,
                textureFormat: 'bc7-rgba-unorm',
                mipmapCount: 1
            }
        );

        desc.uniforms?.assign('texture_array', texture2DArray);
    }

    const holder: RenderHolder | undefined = compiler.compileRenderHolder(desc);
    return holder;
}

export {
    initKTXTexture2DArray
}