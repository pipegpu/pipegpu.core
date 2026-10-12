import {
    Attributes,
    ColorAttachment,
    DepthStencilAttachment,
    RenderLet,
    RenderProperty,
    Uniforms,
    type Compiler,
    type RenderLetDesc
} from '../..';
import { fetchKTX2AsBc7RGBA, type KTXDataPack } from '../util/fetchKTX';

const initDrawKTX2Texture2D = async (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<RenderLet> => {

    let dispatch: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }


    let desc: RenderLetDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: `

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

    `,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: `

struct VertexOutput
{
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@group(0) @binding(0) var texture: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    let uv: vec2<f32> = vec2<f32>(in.uv.x, in.uv.y);
    let color = textureSample(texture, textureSampler, uv);
    return color;
}

    `,
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
        desc.attributes?.assign("in_position", vertexBuffer);
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
        desc.attributes?.assign('in_uv', uvBuffer);
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
        desc.uniforms?.assign('textureSampler', textureSampler);
    }

    // texture2d (.ktx support)
    {
        const ktxDataPack: KTXDataPack = await fetchKTX2AsBc7RGBA('/example/asset/ktx/1.ktx');
        const texture = compiler.createTexture2D(
            {
                width: ktxDataPack.width,
                height: ktxDataPack.height,
                textureData: ktxDataPack.data,
                textureFormat: 'bc7-rgba-unorm',
                mipmapCount: 1
            }
        );
        desc.uniforms?.assign('texture', texture);
    }

    return compiler.compileRenderLet(desc);
}

export {
    initDrawKTX2Texture2D
}