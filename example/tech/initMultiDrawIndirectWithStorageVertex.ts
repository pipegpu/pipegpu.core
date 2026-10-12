import { Attributes, ColorAttachment, DepthStencilAttachment, RenderLet, RenderProperty, Uniforms, type Compiler, type RenderHolderDesc } from '../..';

const initMultiDrawIndirectWithStorageVertex = (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): RenderLet => {

    let dispatch: RenderProperty;
    {
        const indexStorageBuffer = compiler.createIndexedStorageBuffer({
            totalByteLength: 6 * 4 * 2,
            rawDataArray: [
                new Uint32Array([0, 1, 2, 2, 1, 0]),
                new Uint32Array([3, 4, 5, 5, 4, 3])
            ],
        });

        const indexedIndirectBuffer = compiler.createIndexedIndirectBuffer({
            totalByteLength: 20 * 2,
            rawDataArray: [
                new Uint32Array([6, 1, 0, 0, 0]),
                new Uint32Array([6, 1, 6, 0, 0])
            ],
        });

        const indirectDrawCountBuffer = compiler.createStorageBuffer({
            totalByteLength: 4,
            rawDataArray: [new Uint32Array([2])],
            bufferUsageFlags: GPUBufferUsage.INDIRECT
        });

        // indexStorageBuffer: IndexedStorageBuffer, 
        // indexedIndirectBuffer: IndexedIndirectBuffer, 
        // indirectDrawCountBuffer: StorageBuffer, 
        // maxDrawCount: number

        dispatch = new RenderProperty(
            indexStorageBuffer,
            indexedIndirectBuffer,
            indirectDrawCountBuffer,
            () => {
                return 1;
            }
        );
    }


    const WGSLCode = `

struct VERTEX
{
    position: vec4<f32>,
};

@group(0) @binding(0) var<storage, read> vertex_arr: array<VERTEX>;

struct FRAGMENT {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> FRAGMENT {
    var f: FRAGMENT;
    let p = vertex_arr[vi].position;
    f.position = vec4<f32>(p.x, p.y, 0.0, 1.0);
    f.color = vec2<f32>(p.xy);
    return f;
}

@fragment
fn fs_main(f:FRAGMENT) -> @location(0) vec4f {
    return vec4<f32>(f.color, 0.0, 1.0);
}

    `;

    let desc: RenderHolderDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: WGSLCode,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: WGSLCode,
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
        const positionBuffer = compiler.createStorageBuffer({
            totalByteLength: 4 * 6 * 4,
            rawDataArray: [
                new Float32Array([-0.2, -0.2, 0.0, 0.0]),
                new Float32Array([0.2, -0.2, 0.0, 0.0]),
                new Float32Array([0.0, 0.2, 0.0, 0.0]),
                new Float32Array([-0.22, -0.2, 0.0, 0.0]),
                new Float32Array([-0.05, 0.2, 0.0, 0.0]),
                new Float32Array([-0.22, 0.2, 0.0, 0.0]),
            ]
        });
        desc.uniforms?.assign("vertex_arr", positionBuffer);
    }

    return compiler.compileRenderHolder(desc);
}

export {
    initMultiDrawIndirectWithStorageVertex
}