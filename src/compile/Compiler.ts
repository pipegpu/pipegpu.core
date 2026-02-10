import type { VariableInfo } from "wgsl_reflect";
import { ComputeHolder } from "../holder/ComputeHolder";
import { RenderHolder } from "../holder/RenderHolder";
import type { ComputeProperty } from "../property/dispatch/ComputeProperty";
import type { RenderProperty } from "../property/dispatch/RenderProperty";
import type { Attributes, Uniforms } from "../property/Properties";
import type { ColorAttachment } from "../res/attachment/ColorAttachment";
import type { DepthStencilAttachment } from "../res/attachment/DepthStencilAttachment";
import type { UniformBuffer } from "../res/buffer/UniformBuffer";
import type { VertexBuffer } from "../res/buffer/VertexBuffer";
import { Context } from "../res/Context";
import type { BlendFormat, ColorLoadStoreFormat, DepthLoadStoreFormat, MultiSampleFormat, StencilLoadStoreFormat, StencilStateFormat, TypedArray1DFormat, TypedArray2DFormat } from "../res/Format";
import type { ComputeHandle, HookHandle, RenderHandle, BufferHandle, BufferArrayHandle, TextureArrayHandle } from "../res/Handle";
import type { ComputeShader } from "../res/shader/ComputeShader";
import type { FragmentShader } from "../res/shader/FragmentShader";
import type { VertexShader } from "../res/shader/VertexShader";
import { BufferState } from "../state/BufferState";
import { ShaderState } from "../state/ShaderState";
import { TextureState } from "../state/TextureState";
import { emitAttributes } from "./emitAttributes";
import { parseAttribute, type IAttributeRecord } from "./parseAttribute";
import { parseColorAttachments } from "./parseColorAttachments";
import { parseFragmentState } from "./parseFragmentState";
import { parseMultisampleState } from "./parseMultisampleState";
import { parsePipelineLayout } from "./parsePipelineLayout";
import { parsePrimitiveState, type PrimitiveDesc } from "./parsePrimitiveState";
import { parseRenderBindGroupLayout } from "./parseRenderBindGroupLayout";
import { parseRenderDispatch } from "./parseRenderDispatch";
import { parseUniform, type IUniformRecord, type UniformHandle } from "./parseUniform";
import { emitUniforms } from "./emitUniforms";
import { SamplerState } from "../state/SamplerState";
import { emitRenderPipeline } from "./emitRenderPipeline";
import { PipelineState } from "../state/PipelineState";
import type { RenderPipeline } from "../res/pipeline/RenderPipeline";
import type { BaseTexture } from "../res/texture/BaseTexture";
import { AttachmentState } from "../state/AttachmentState";
import type { Texture2D } from "../res/texture/Texture2D";
import { uniqueID } from "../util/uniqueID";
import { parseComputeBindGroupLayout } from "./parseComputeBindGroupLayout";
import { parseComputeDispatch } from "./parseComputeDispatch";
import { parseComputeProgrammableStage } from "./parseComputeProgrammableStage";
import { emitComputePipeline } from "./emitComputePipeline";
import type { StorageBuffer } from "../res/buffer/StorageBuffer";
import type { MapBuffer } from "../res/buffer/Mapbuffer";
import type { IndexedBuffer } from "../res/buffer/IndexedBuffer";
import type { IndexedStorageBuffer } from "../res/buffer/IndexedStorageBuffer";
import type { IndirectBuffer } from "../res/buffer/IndirectBuffer";
import type { IndexedIndirectBuffer } from "../res/buffer/IndexedIndirectBuffer";
import type { ComparisonSampler } from "../res/sampler/ComparisonSampler";
import type { TextureSampler } from "../res/sampler/TextureSampler";

/**
 * render holde descriptor
 * @param label {String} 
 * @param vertexShader {VertexShader}
 */
interface RenderHolderDesc {
    /**
     * debug label(stats info head bar)
     */
    label: string,

    /**
     * vertex shader.
     */
    vertexShader: VertexShader,

    /**
     * fragment shader.
     */
    fragmentShader: FragmentShader,

    /**
     * parse attributes.
     */
    attributes: Attributes,

    /**
     * parse uniforms.
     */
    uniforms: Uniforms,

    /**
     * parse dispatch.
     */
    dispatch: RenderProperty,

    /**
     * color attachment
     * - surface color attachments.
     * - fbo attachments.
     */
    colorAttachments: ColorAttachment[],

    /**
     * depth stencil attachments.
     */
    depthStencilAttachment?: DepthStencilAttachment,

    /**
    * 
    */
    multiSampleFormat?: MultiSampleFormat,

    /**
     * 
     */
    primitiveDesc?: PrimitiveDesc,
}

/**
 * support:
 * gpu-driven style
 * @class ComputeHolderDesc
 */
interface ComputeHolderDesc {
    /**
     * 
     */
    label: string,

    /**
     * 
     */
    computeShader: ComputeShader,

    /**
     * 
     */
    uniforms: Uniforms,

    /**
     * 
     */
    dispatch: ComputeProperty,

    /**
     * 
     * compute shader tail handler.
     * append command buffer at the end.
     * 
     */
    handler?: HookHandle,
}

/**
 * 
 */
class Compiler {

    /**
     * 
     */
    private context: Context;

    /**
     * 
     */
    private bufferState: BufferState;

    /**
     * 
     */
    private shaderState: ShaderState;

    /**
     * 
     */
    private textureState: TextureState;

    /**
     * 
     */
    private samplerState: SamplerState;

    /**
     * 
     */
    private pipelineState: PipelineState;

    /**
     * 
     */
    private attachmentState: AttachmentState;

    /**
     * 
     * @param opts 
     */
    constructor(context: Context) {
        this.context = context;
        this.bufferState = new BufferState(this.context);
        this.shaderState = new ShaderState(this.context);
        this.textureState = new TextureState(this.context);
        this.samplerState = new SamplerState(this.context);
        this.pipelineState = new PipelineState(this.context);
        this.attachmentState = new AttachmentState(this.context);
    }

    /**
     * 
     * @param desc 
     * @returns 
     */
    compileRenderHolder = (desc: RenderHolderDesc): RenderHolder => {
        const debugLabel = `[render][holder][${desc.label}]`;
        const vertexShader = desc.vertexShader, fragmentShader = desc.fragmentShader;
        // vaildation shader
        if (!vertexShader || !fragmentShader) {
            throw new Error(`[E][Compiler][compileRenderHolder] ${debugLabel} missing shader, vertexShader: ${vertexShader}; fragmentShader:${fragmentShader}`);
        }

        // force update reflected info
        vertexShader.reflect(desc.uniforms, debugLabel);
        fragmentShader.reflect(desc.uniforms, debugLabel);

        // parse attribute
        const attributeRecordMap: Map<string, IAttributeRecord> = new Map();
        const bufferAttributeRecordsMap: Map<number, Map<string, IAttributeRecord>> = new Map();
        parseAttribute({
            debugLabel: debugLabel,
            attributes: desc.attributes,
            attributeRecordMap: attributeRecordMap,
            bufferAttributeRecordsMap: bufferAttributeRecordsMap
        });

        // parse uniform
        const uniformRecordMap: Map<string, IUniformRecord> = new Map();
        const bufferUniformRecordsMap: Map<number, Map<string, IUniformRecord>> = new Map();
        const unifomrHandler: UniformHandle = parseUniform({
            debugLabel: debugLabel,
            uniforms: desc.uniforms,
            uniformRecordMap: uniformRecordMap,
            bufferUniformRecordsMap: bufferUniformRecordsMap
        });

        // parse render holder bindgrouplayout
        const bindGroupLayouts: GPUBindGroupLayout[] = [];
        const gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout> = new Map();
        const gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor> = new Map();
        parseRenderBindGroupLayout({
            debugLabel: debugLabel,
            context: this.context,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            bindGroupLayouts: bindGroupLayouts,
            gourpIDWithBindGroupLayoutMap: gourpIDWithBindGroupLayoutMap,
            gourpIDWithBindGroupLayoutDescriptorMap: gourpIDWithBindGroupLayoutDescriptorMap,
        });

        // parse render dispatch
        const renderHandler: RenderHandle = parseRenderDispatch({
            debugLabel: debugLabel,
            dispatch: desc.dispatch
        });

        // parse multi sample state
        const multiSampleState: GPUMultisampleState = parseMultisampleState({
            debugLabel: debugLabel,
            multiSampleFormat: desc.multiSampleFormat || '1x'
        });

        // parse color attachments
        const colorTargetStates: GPUColorTargetState[] = parseColorAttachments({
            debugLabel: debugLabel,
            colorAttachments: desc.colorAttachments
        });

        // parse primitive state
        const primitiveState: GPUPrimitiveState = parsePrimitiveState({
            debugLabel: debugLabel,
            primitiveDesc: desc.primitiveDesc,
            dispatch: desc.dispatch
        });

        // parse fragment state
        const fragmentState: GPUFragmentState = parseFragmentState({
            debugLabel: debugLabel,
            fragmentShader: fragmentShader,
            colorTargetStates: colorTargetStates
        });

        // parse pipeline layout
        const pipelineLayout: GPUPipelineLayout = parsePipelineLayout({
            debugLabel: debugLabel,
            context: this.context,
            bindGroupLayouts: bindGroupLayouts
        });

        // emmit vertex state
        let vertexBufferLayouts: GPUVertexBufferLayout[] = [];
        let bufferVertexAttributesMap: Map<number, GPUVertexAttribute[]> = new Map();
        let slotAttributeBufferIDMap: Map<number, number> = new Map();
        const vertexState: GPUVertexState = emitAttributes({
            debugLabel: debugLabel,
            vertexShader: vertexShader,
            bufferAttributeRecordsMap: bufferAttributeRecordsMap,
            vertexBufferLayouts: vertexBufferLayouts,
            vertexBufferIDAttributesMap: bufferVertexAttributesMap,
            slotBufferIDMap: slotAttributeBufferIDMap
        }) as GPUVertexState;

        // emit uniform
        const slotBindGroupMap: Map<number, GPUBindGroup> = new Map();
        const mergedUniformResourceMap: Map<number, VariableInfo[]> = new Map();
        emitUniforms(
            {
                debugLabel: debugLabel,
                context: this.context,
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                bufferState: this.bufferState,
                textureState: this.textureState,
                samplerState: this.samplerState,
                uniformRecordMap: uniformRecordMap,
                bufferIDUniformRecordsMap: bufferUniformRecordsMap,
                gourpIDWithBindGroupLayoutMap: gourpIDWithBindGroupLayoutMap,
                gourpIDWithBindGroupLayoutDescriptorMap: gourpIDWithBindGroupLayoutDescriptorMap
            },
            slotBindGroupMap,
            mergedUniformResourceMap
        );

        // emit render pipeline
        const renderPipeline: RenderPipeline = emitRenderPipeline({
            debugLabel: debugLabel,
            pipelineState: this.pipelineState,
            depthStencilAttachment: desc.depthStencilAttachment,
            vertexState: vertexState,
            fragmentState: fragmentState,
            pipelineLayout: pipelineLayout,
            primitiveState: primitiveState,
            multisampleState: multiSampleState
        });

        //
        // TODO::   
        // dependeicese, includes input/output
        //

        // render holder
        return new RenderHolder({
            debugLabel: debugLabel,
            id: uniqueID(),
            context: this.context,
            renderPipeline: renderPipeline,
            bufferState: this.bufferState,
            texturteState: this.textureState,
            renderHandler: renderHandler,
            uniformHandler: unifomrHandler,
            slotAttributeBufferIDMap: slotAttributeBufferIDMap,
            slotBindGroupMap: slotBindGroupMap,
            colorAttachments: desc.colorAttachments,
            depthStencilAttachment: desc.depthStencilAttachment
        });
    }

    /**
     * 
     * @param desc 
     */
    compileComputeHolder = (desc: ComputeHolderDesc): ComputeHolder => {
        const debugLabel = `[compute][holder][${desc.label}]`;
        const computeShader = desc.computeShader;
        if (!computeShader) {
            throw new Error(`[E][Compiler][compileComputeHolder] ${debugLabel} missing shader, computeShader: ${computeShader}`);
        }

        // force update reflected info
        computeShader.reflect(desc.uniforms, debugLabel);

        // parse uniform
        const uniformRecordMap: Map<string, IUniformRecord> = new Map();
        const bufferUniformRecordsMap: Map<number, Map<string, IUniformRecord>> = new Map();
        const unifomrHandler: UniformHandle = parseUniform({
            debugLabel: debugLabel,
            uniforms: desc.uniforms,
            uniformRecordMap: uniformRecordMap,
            bufferUniformRecordsMap: bufferUniformRecordsMap
        });

        // parse render holder bindgrouplayout
        const bindGroupLayouts: GPUBindGroupLayout[] = [];
        const gourpIDWithBindGroupLayoutMap: Map<number, GPUBindGroupLayout> = new Map();
        const gourpIDWithBindGroupLayoutDescriptorMap: Map<number, GPUBindGroupLayoutDescriptor> = new Map();
        parseComputeBindGroupLayout({
            debugLabel: debugLabel,
            context: this.context,
            computeShader: computeShader,
            bindGroupLayouts: bindGroupLayouts,
            gourpIDWithBindGroupLayoutMap: gourpIDWithBindGroupLayoutMap,
            gourpIDWithBindGroupLayoutDescriptorMap: gourpIDWithBindGroupLayoutDescriptorMap
        });

        // parse render dispatch
        const computeHandler: ComputeHandle = parseComputeDispatch({
            debugLabel: debugLabel,
            dispatch: desc.dispatch
        });

        // parse compute program stage
        const computeProgrammableStage: GPUProgrammableStage = parseComputeProgrammableStage({
            debugLabel: debugLabel,
            computeShader: computeShader
        });

        // parse pipeline layout
        const pipelineLayout: GPUPipelineLayout = parsePipelineLayout({
            debugLabel: debugLabel,
            context: this.context,
            bindGroupLayouts: bindGroupLayouts
        });

        // emit uniform
        const slotBindGroupMap: Map<number, GPUBindGroup> = new Map();
        const mergedUniformResourceMap: Map<number, VariableInfo[]> = new Map();
        emitUniforms(
            {
                debugLabel: debugLabel,
                context: this.context,
                computeShader: computeShader,
                bufferState: this.bufferState,
                textureState: this.textureState,
                samplerState: this.samplerState,
                uniformRecordMap: uniformRecordMap,
                bufferIDUniformRecordsMap: bufferUniformRecordsMap,
                gourpIDWithBindGroupLayoutMap: gourpIDWithBindGroupLayoutMap,
                gourpIDWithBindGroupLayoutDescriptorMap: gourpIDWithBindGroupLayoutDescriptorMap
            },
            slotBindGroupMap,
            mergedUniformResourceMap
        );

        // emit compute pipeline
        const computePipeline = emitComputePipeline({
            debugLabel: debugLabel,
            computeProgrammableStage: computeProgrammableStage,
            pipelineLayout: pipelineLayout,
            pipelineState: this.pipelineState
        });

        //
        // TODO::   
        // dependeicese, includes input/output
        //

        return new ComputeHolder({
            debugLabel: debugLabel,
            id: uniqueID(),
            context: this.context,
            computePipeline: computePipeline,
            bufferState: this.bufferState,
            textureState: this.textureState,
            computeHandler: computeHandler,
            uniformHandler: unifomrHandler,
            hookHandler: desc.handler,
            slotBindGroupMap: slotBindGroupMap
        });
    }

    /**
     * 
     * @param opts 
     * @param id 
     * @returns 
     * 
     */
    createVertexBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            rawData?: TypedArray1DFormat,
            handler?: BufferHandle,
        }
    ): VertexBuffer => {
        return this.bufferState.createVertexBuffer({
            totalByteLength: opts.totalByteLength,
            rawData: opts.rawData,
            handler: opts.handler
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createIndexBuffer = (
        opts: {
            debugLabel?: number,
            rawData: Uint16Array | Uint32Array,
        }
    ): IndexedBuffer => {
        if (opts.rawData.byteLength % 4 !== 0) {
            throw new Error(`[E][Compiler][createIndexBuffer] buffer bytelength must align with 4. current index buffer byte length: ${opts.rawData.byteLength}`);
        }
        return this.bufferState.createIndexBuffer({
            rawData: opts.rawData
        });
    }

    /**
     * 
     * @param opts 
     * @param id 
     * @returns 
     * 
     */
    createUniformBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            rawData?: TypedArray1DFormat | ArrayBuffer,
            handler?: BufferHandle
        }
    ): UniformBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxUniformBufferBindingSize) {
            throw new Error(`[E][createUniformBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createUniformBuffer({
            totalByteLength: opts.totalByteLength,
            rawData: opts.rawData,
            handler: opts.handler
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createStorageBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            bufferUsageFlags?: GPUBufferUsageFlags,
            rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>,
            handler?: BufferArrayHandle
        }
    ): StorageBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxStorageBufferBindingSize) {
            throw new Error(`[E][createStorageBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createStorageBuffer({
            totalByteLength: opts.totalByteLength,
            bufferUsageFlags: opts.bufferUsageFlags,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    createIndexedStorageBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            rawDataArray?: Array<Uint16Array> | Array<Uint32Array>,
            handler?: BufferArrayHandle
        }
    ): IndexedStorageBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxStorageBufferBindingSize) {
            throw new Error(`[E][createIndexedStorageBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createIndexedStorageBuffer({
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
    }

    /**
     * 
     * [vertex_count, instance_count, first_vertex, first_instance]
     * @param opts 
     * @returns 
     * 
     */
    createIndirectBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            rawDataArray?: TypedArray2DFormat,
            handler?: BufferArrayHandle,
        }
    ): IndirectBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxStorageBufferBindingSize) {
            throw new Error(`[E][createIndirectBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createIndirectBuffer({
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
    }

    /**
     * 
     * [index_count, instance_count, first_index, vertex_offset, first_instance]
     * @param opts 
     * @returns 
     * 
     */
    createIndexedIndirectBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            rawDataArray?: TypedArray2DFormat,
            handler?: BufferArrayHandle,
        }
    ): IndexedIndirectBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxStorageBufferBindingSize) {
            throw new Error(`[E][createIndexedIndirectBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createIndexedIndirectBuffer({
            totalByteLength: opts.totalByteLength,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler,
        });
    }


    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createMapBuffer = (
        opts: {
            debugLabel?: number,
            totalByteLength: number,
            appendixBufferUsageFlags?: number,
            rawDataArray?: TypedArray2DFormat,
            handler?: BufferArrayHandle
        }
    ): MapBuffer => {
        if (opts.totalByteLength >= this.context.getLimits().maxStorageBufferBindingSize) {
            throw new Error(`[E][createMapBuffer] ${opts.debugLabel} total byte length vaild.`)
        }
        return this.bufferState.createMapBuffer({
            totalByteLength: opts.totalByteLength,
            appendixBufferUsageFlags: opts.appendixBufferUsageFlags,
            rawDataArray: opts.rawDataArray,
            handler: opts.handler
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createVertexShader = (
        opts: {
            debugLabel?: number,
            code: string,
            entryPoint: string
        }
    ): VertexShader => {
        return this.shaderState.createVertexShader({
            code: opts.code,
            entryPoint: opts.entryPoint
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createFragmentShader = (
        opts: {
            debugLabel?: number,
            code: string,
            entryPoint: string
        }
    ): FragmentShader => {
        return this.shaderState.createFragmentShader({
            code: opts.code,
            entryPoint: opts.entryPoint
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createComputeShader = (
        opts: {
            debugLabel?: number,
            code: string,
            entryPoint: string
        }
    ): ComputeShader => {
        return this.shaderState.createComputeShader({
            code: opts.code,
            entryPoint: opts.entryPoint
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createColorAttachment = (
        opts: {
            debugLabel?: number,
            texture: BaseTexture,
            blendFormat?: BlendFormat,
            colorLoadStoreFormat?: ColorLoadStoreFormat,
            clearColor?: number[]
        }
    ): ColorAttachment => {
        return this.attachmentState.createColorAttachment({
            texture: opts.texture,
            blendFormat: opts.blendFormat,
            colorLoadStoreFormat: opts.colorLoadStoreFormat,
            clearColor: opts.clearColor
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     * 
     */
    createDepthStencilAttachment = (
        opts: {
            debugLabel?: number,
            texture: Texture2D,
            depthBias?: number,
            depthBiasSlopeScale?: number,
            depthLoadStoreFormat?: DepthLoadStoreFormat,
            depthCompareFunction?: GPUCompareFunction,
            stencilFunctionFormat?: StencilStateFormat,
            stencilLoadStoreFormat?: StencilLoadStoreFormat,
            depthReadOnly?: boolean,
            depthClearValue?: number,
            stencilReadOnly?: boolean,
            stencilClearValue?: number,
        }
    ): DepthStencilAttachment => {
        return this.attachmentState.createDepthStencilAttachment({
            texture: opts.texture,
            depthBias: opts.depthBias,
            depthBiasSlopeScale: opts.depthBiasSlopeScale,
            depthLoadStoreFormat: opts.depthLoadStoreFormat,
            depthCompareFunction: opts.depthCompareFunction,
            stencilFunctionFormat: opts.stencilFunctionFormat,
            stencilLoadStoreFormat: opts.stencilLoadStoreFormat,
            depthReadOnly: opts.depthReadOnly,
            depthClearValue: opts.depthClearValue,
            stencilReadOnly: opts.stencilReadOnly,
            stencilClearValue: opts.stencilClearValue,
        });
    }

    /**
     * @description link to surface for rendering in each frame.
     * @returns SurfaceTexture2D
     * 
     */
    createSurfaceTexture2D = () => {
        return this.textureState.createSurfaceTexture2D();
    }

    /**
     * @function createTexture2D
     */
    createTexture2D = (
        opts: {
            debugLabel?: number,
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ) => {
        return this.textureState.createTexutre2D({
            width: opts.width,
            height: opts.height,
            textureData: opts.textureData,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
    }

    /**
     * @function createTextureStorage2D
     */
    createTextureStorage2D = (
        opts: {
            debugLabel?: number,
            width: number,
            height: number,
            textureData?: TypedArray1DFormat,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ) => {
        return this.textureState.createTextureStorage2D({
            width: opts.width,
            height: opts.height,
            textureData: opts.textureData,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
    }

    /**
     * @param opts 
     * @returns 
     * 
     */
    createTexture2DArray = (
        opts: {
            debugLabel?: number,
            width: number,
            height: number,
            depthOrArrayLayers: number,
            textureDataArray?: TypedArray2DFormat,
            handler?: TextureArrayHandle,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
            appendixTextureUsages?: number,
        }
    ) => {
        return this.textureState.createTexture2DArray({
            width: opts.width,
            height: opts.height,
            depthOrArrayLayers: opts.depthOrArrayLayers,
            textureDataArray: opts.textureDataArray,
            handler: opts.handler,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
    }

    /**
     * @function createTextureCube
     */
    createTextureCube = (
        opts: {
            debugLabel?: number,
            width: number,
            height: number,
            faces: {
                posx: TypedArray1DFormat,
                negx: TypedArray1DFormat,
                posy: TypedArray1DFormat,
                negy: TypedArray1DFormat,
                posz: TypedArray1DFormat,
                negz: TypedArray1DFormat,
            },
            appendixTextureUsages?: number,
            textureFormat?: GPUTextureFormat,
            mipmapCount?: number,
        }
    ) => {
        return this.textureState.createTextureCube({
            width: opts.width,
            height: opts.height,
            faces: opts.faces,
            textureFormat: opts.textureFormat,
            mipmapCount: opts.mipmapCount,
            appendixTextureUsages: opts.appendixTextureUsages,
        });
    }

    /**
     * @function createTextureSampler
     * @param opts 
     * @returns 
     */
    createTextureSampler = (
        opts: {
            debugLabel?: number,
            addressModeU?: GPUAddressMode,
            addressModeV?: GPUAddressMode,
            addressModeW?: GPUAddressMode,
            magFilter?: GPUFilterMode,
            minFilter?: GPUFilterMode,
            mipmapFilter?: GPUMipmapFilterMode,
            lodMinClamp?: number,
            lodMaxClamp?: number
            anisotropy?: number,
            samplerBindingType?: GPUSamplerBindingType,
        }
    ): TextureSampler => {
        return this.samplerState.createTextureSampler({
            addressModeU: opts.addressModeU,
            addressModeV: opts.addressModeV,
            addressModeW: opts.addressModeW,
            magFilter: opts.magFilter,
            minFilter: opts.minFilter,
            mipmapFilter: opts.mipmapFilter,
            lodMinClamp: opts.lodMinClamp,
            lodMaxClamp: opts.lodMaxClamp,
            anisotropy: opts.anisotropy,
            samplerBindingType: opts.samplerBindingType
        });
    }

    /**
     * @function createComparisonSampler
     */
    createComparisonSampler = (
        opts: {
            debugLabel?: number,
            addressModeU?: GPUAddressMode,
            addressModeV?: GPUAddressMode,
            addressModeW?: GPUAddressMode,
            magFilter?: GPUFilterMode,
            minFilter?: GPUFilterMode,
            mipmapFilter?: GPUMipmapFilterMode,
            lodMinClamp?: number,
            lodMaxClamp?: number
            anisotropy?: number,
            compareFunction?: GPUCompareFunction,
            samplerBindingType?: GPUSamplerBindingType,
        }
    ): ComparisonSampler => {
        return this.samplerState.createComparisonSampler({
            addressModeU: opts.addressModeU,
            addressModeV: opts.addressModeV,
            addressModeW: opts.addressModeW,
            magFilter: opts.magFilter,
            minFilter: opts.minFilter,
            mipmapFilter: opts.mipmapFilter,
            lodMinClamp: opts.lodMinClamp,
            lodMaxClamp: opts.lodMaxClamp,
            anisotropy: opts.anisotropy,
            compareFunction: opts.compareFunction || 'always',
            samplerBindingType: opts.samplerBindingType
        });
    }

}

export {
    type RenderHolderDesc,
    type ComputeHolderDesc,
    Compiler
}