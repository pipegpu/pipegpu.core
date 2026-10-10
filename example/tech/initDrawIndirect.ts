import {
    Attributes,
    ColorAttachment,
    DepthStencilAttachment,
    RenderHolder,
    RenderProperty,
    Uniforms,
    type BaseHolder,
    type Compiler,
    type RenderHolderDesc
} from "../..";

const initDrawIndriect = (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): BaseHolder => {

    const indirectBufferData = new Uint32Array([
        6,
        1,
        0,
        0
    ]);
    const indirectBuffer = compiler.createIndirectBuffer({
        totalByteLength: indirectBufferData.byteLength,
        rawDataArray: [indirectBufferData],
    });

    const dispatch: RenderProperty = new RenderProperty(indirectBuffer);

    //
    let desc: RenderHolderDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: `
    @vertex
    fn vs_main(@location(0) in_vertex_position: vec2f) -> @builtin(position) vec4<f32> {
        return vec4f(in_vertex_position, 0.0, 1.0);
    }
    `,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: `
    @group(0) @binding(0) var<uniform> uColorR:f32;
    @group(0) @binding(1) var<uniform> uColorG:f32;
    @group(0) @binding(2) var<uniform> uColorB:f32;

    @fragment
    fn fs_main() -> @location(0) vec4f {
        return vec4f(uColorR, uColorG, uColorB, 1.0);
    }
    `,
            entryPoint: "fs_main"
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        dispatch: dispatch,
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
    };

    let seed: number = 0;
    // const vertexArr = new Float32Array([-0.15, -0.5, 0.5, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.5]);
    const vertexBuffer = compiler.createVertexBuffer({
        totalByteLength: 12 * 4,
        handler: () => {
            const arrayData = new Float32Array([-0.15 + Math.sin((seed++) * 0.01), -0.5, 0.5, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.5]);
            return {
                rewrite: true,
                detail: {
                    offset: 0,
                    byteLength: arrayData.byteLength,
                    rawData: arrayData
                }
            };
        },
    });
    desc.attributes?.assign("in_vertex_position", vertexBuffer);

    const uniformBufferR = compiler.createUniformBuffer({
        totalByteLength: 1 * 4,
        handler: () => {
            const arrayData = new Float32Array([Math.cos(seed * 0.01)]);
            return {
                rewrite: true,
                detail: {
                    offset: 0,
                    byteLength: arrayData.byteLength,
                    rawData: arrayData
                }
            };
        },
    });
    const uniformBufferG = compiler.createUniformBuffer({
        totalByteLength: 1 * 4,
        rawData: new Float32Array([0.2]),
    });
    const uniformBufferB = compiler.createUniformBuffer({
        totalByteLength: 1 * 4,
        rawData: new Float32Array([0.0]),
    });

    desc.uniforms?.assign("uColorR", uniformBufferR);
    desc.uniforms?.assign("uColorG", uniformBufferG);
    desc.uniforms?.assign("uColorB", uniformBufferB);

    const holder: RenderHolder | undefined = compiler.compileRenderHolder(desc);
    return holder;
}

export {
    initDrawIndriect
}