import {
    Attributes,
    ColorAttachment,
    DepthStencilAttachment,
    RenderLet,
    RenderProperty,
    Uniforms,
    type BufferArrayHandle,
    type Compiler,
    type RenderHolderDesc
} from '../..';
import type { IndexedIndirectBuffer } from "../../src/res/buffer/IndexedIndirectBuffer";
import type { IndexedStorageBuffer } from "../../src/res/buffer/IndexedStorageBuffer";

const initMultiDrawIndexedIndirect = (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): RenderLet => {

    let dispatch: RenderProperty;
    {
        // index storage buffer.
        const indexData2 = new Uint32Array([0, 1, 2, 2, 1, 0]);
        const indexData1 = new Uint32Array([3, 4, 5, 5, 4, 3]);
        const indexStorageBuffer: IndexedStorageBuffer = compiler.createIndexedStorageBuffer({
            totalByteLength: indexData1.byteLength + indexData2.byteLength,
            rawDataArray: [indexData1, indexData2],
        });

        // indexed indirect buffer.
        const indexedIndirectData1 = new Uint32Array([indexData1.byteLength / indexData1.BYTES_PER_ELEMENT, 1, 0, 0, 0]);
        const indexedIndirectData2 = new Uint32Array([indexData2.byteLength / indexData2.BYTES_PER_ELEMENT, 1, indexData1.byteLength / indexData1.BYTES_PER_ELEMENT, 0, 0]);
        const handler: BufferArrayHandle = () => {
            const details: any[] = [];
            details.push({
                offset: 0,
                byteLength: indexedIndirectData1.byteLength,
                rawData: indexedIndirectData1
            });
            details.push({
                offset: indexedIndirectData1.byteLength,
                byteLength: indexedIndirectData2.byteLength,
                rawData: indexedIndirectData2
            });
            return {
                rewrite: true,
                details: details
            }
        };

        const indexedIndirectBuffer: IndexedIndirectBuffer = compiler.createIndexedIndirectBuffer({
            totalByteLength: indexedIndirectData1.byteLength + indexedIndirectData1.byteLength,
            // rawData: [indexedIndirectData1, indexedIndirectData2]
            handler: handler
        });

        // indirect draw count buffer.
        const indirectDrawCountData = new Uint32Array([3]);
        const indirectDrawCountBuffer = compiler.createStorageBuffer({
            totalByteLength: indirectDrawCountData.byteLength,
            rawDataArray: [indirectDrawCountData],
            bufferUsageFlags: GPUBufferUsage.INDIRECT
        });

        dispatch = new RenderProperty(indexStorageBuffer, indexedIndirectBuffer, indirectDrawCountBuffer, 2);
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
        const positionData = new Float32Array([
            -0.2, -0.2,
            0.2, -0.2,
            0.0, 0.2,
            0.5, 0.5,
            0.85, 0.95,
            0.0, 0.0
        ]);
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
    initMultiDrawIndexedIndirect
}