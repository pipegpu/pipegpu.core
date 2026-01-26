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
} from "../../src";
import type { HardwareDenseMeshFriendly } from "../plugin/meshlet/spec";
import { fetchMeshlet } from "../util/fetchMeshlet";

const initDrawMeshlet = async (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<BaseHolder> => {

    const damagedhelmet: HardwareDenseMeshFriendly = await fetchMeshlet(`/example/asset/meshlet/damagedhelmet.meshlet`);

    console.log(damagedhelmet.verticesLength());
    damagedhelmet.meshletsLength();
    const material_asset = damagedhelmet.materialAsset();

    console.log(material_asset?.pbr()?.baseColor()?.samplerUuid());
    console.log(material_asset?.pbr()?.baseColor()?.textureUuid());
    console.log(`${material_asset?.pbr()?.baseColor()?.scaler()?.x()}-${material_asset?.pbr()?.baseColor()?.scaler()?.y()}-${material_asset?.pbr()?.baseColor()?.scaler()?.z()}`);

    console.log(damagedhelmet?.distanceVolumeData()?.localSpaceMeshBounds()?.max()?.x());

    let dispatch: RenderProperty;
    {
        const indexData = new Uint16Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }

    const code: string = `

struct VIEW_PROJECTION
{
    projection: mat4x4<f32>,
    view: mat4x4<f32>,
};

struct VERTEX
{
    px: f32,
    py: f32,
    pz: f32,
    nx: f32,
    ny: f32,
    nz: f32,
    tx: f32,
    ty: f32,
    tz: f32,
};

struct FRAGMENT
{
    @builtin(position) position:vec4<f32>,
    @location(0) @interpolate(flat) pack_id: u32,
    @location(1) position_ws: vec4<f32>,            // ws = world space
    @location(2) normal_ws: vec3<f32>,              // ws = world space
    @location(3) uv:vec2<f32>,
    @location(4) @interpolate(flat) instance_id: u32,
    @location(5) @interpolate(flat) meshlet_id: u32,
    @location(6) @interpolate(flat) triangle_id: u32,
    @location(7) @interpolate(flat) need_discard: u32
};

@group(0) @binding(0) var<storage, read> vertex_arr: array<VERTEX>;
@group(0) @binding(1) var<uniform> view_projection: array<VIEW_PROJECTION>;

@vertex
fn vs_main(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> FRAGMENT {
    var f: FRAGMENT;
    let v: VERTEX = vertex_arr[vi];
    let position: vec4<f32> = view_projection.projection * view_projection.view * vec4<f32>(v.px, v.py, v.pz, 1.0);
    return f;
}

@fragment
fn fs_main(in: FRAGMENT) -> @location(0) vec4f {
    return vec4f(1.0, 0.5, 1.0, 1.0);
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



    const holder: RenderHolder | undefined = compiler.compileRenderHolder(desc);
    return holder;
}

export {
    initDrawMeshlet
}