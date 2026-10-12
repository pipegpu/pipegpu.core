import {
    Attributes,
    ColorAttachment,
    DepthStencilAttachment,
    RenderLet,
    RenderProperty,
    Uniforms,
    type Compiler,
    type RenderHolderDesc
} from "../.."

const initDrawIndexed = (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): RenderLet => {

    let dispatch: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }

    let desc: RenderHolderDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: `

struct VertexInput {
    @location(0) position:vec2f,
    @location(1) color:vec3f,
};

struct VertexOutput {
    @builtin(position) position:vec4f,
    @location(0) color:vec3f,
};

@vertex
fn vs_main(in:VertexInput) -> VertexOutput {
    var out:VertexOutput;
    out.position = vec4f(in.position, 0.0, 1.0);
    out.color = in.color;
    return out;
}

    `,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: `

struct VertexOutput {
    @builtin(position) position:vec4f,
    @location(0) color:vec3f,
};

@fragment
fn fs_main(in:VertexOutput) -> @location(0) vec4f {
    return vec4f(in.color, 1.0);
}

    `,
            entryPoint: "fs_main"
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
        dispatch: dispatch,
        // primitiveDesc: {
        //     // cullFormat: 'backCCW',
        //     primitiveTopology: 'triangle-strip'
        // },
    };

    {
        const positionData = new Float32Array([-0.2, -0.2, 0.2, -0.2, 0.0, 0.2, -0.22, -0.2, -0.05, 0.2, -0.22, 0.2]);
        const positionBuffer = compiler.createVertexBuffer({
            totalByteLength: positionData.byteLength,
            rawData: positionData
        });
        desc.attributes?.assign("position", positionBuffer);
    }

    {
        const colorData = new Float32Array([0.2, 0.2, 0.0, 0.2, 0.2, 0.0, 0.0, 0.2, 1.0, 0.2, 0.8, 0.0, 0.0, 0.2, 0.0, 0.7, 0.0, 0.0]);
        const colorBuffer = compiler.createVertexBuffer({
            totalByteLength: colorData.byteLength,
            rawData: colorData
        });
        desc.attributes?.assign("color", colorBuffer);
    }

    return compiler.compileRenderHolder(desc);
}

export {
    initDrawIndexed
}