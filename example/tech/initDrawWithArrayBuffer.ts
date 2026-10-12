import { Attributes, ColorAttachment, DepthStencilAttachment, RenderLet, RenderProperty, Uniforms, type Compiler, type RenderHolderDesc } from '../..';

const initDrawWithArrayBuffer = (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): RenderLet => {
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
        dispatch: new RenderProperty(6, 1),
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
    };

    let seed: number = 0;
    // const vertexArr = new Float32Array([-0.15, -0.5, 0.5, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.5]);
    const vertexBuffer = compiler.createVertexBuffer({
        totalByteLength: 12 * 4,
        handler: () => {
            const arrayData = new Float32Array([-0.15 + Math.sin((seed++) * 0.01), -0.25, 0.15, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.8]);
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
            const arrayData = new Float32Array([Math.sin(seed * 0.01)]);
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

    desc.uniforms?.assign("uColorR", uniformBufferR);
    desc.uniforms?.assign("uColorG", uniformBufferG);
    {
        const arrayBufferB = new ArrayBuffer(4);
        const arrayBufferBView = new Float32Array(arrayBufferB, 0);
        arrayBufferBView.set(new Float32Array([1.0]));
        const uniformBufferB = compiler.createUniformBuffer({
            totalByteLength: 1 * 4,
            rawData: arrayBufferB // new Float32Array([0.0]),
        });
        desc.uniforms?.assign("uColorB", uniformBufferB);
    }

    return compiler.compileRenderHolder(desc);
}

export {
    initDrawWithArrayBuffer
}