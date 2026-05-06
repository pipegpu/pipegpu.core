import { VariableInfo } from 'wgsl_reflect';

/**
 *
 * @description
 * align4Byte(1) -> 4
 * align4Byte(2) -> 4
 * align4Byte(3) -> 4
 * align4Byte(6) -> 8
 *
 * @param {number} n
 * @returns
 *
 */
export declare const align4Byte: (n: number) => number;

/**
 * @example
 * attributes.assing("position", vertexBuffer);
 */
export declare class Attributes extends Properties {
    /**
     *
     */
    constructor();
    /**
     *
     * @param propertyName
     * @param buffer
     */
    assign: (propertyName: string, buffer: VertexBuffer) => void;
}

/**
 * @class BaseAttachment
 */
declare abstract class BaseAttachment {
    /**
     *
     */
    private id;
    /**
     *
     */
    protected context: Context;
    /**
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
    });
    /**
     * @function getID
     */
    getID: () => number;
    /**
     * @protected
     * @abstract
     * @function updateState
     */
    protected abstract updateState(): void;
    /**
     * @protected
     * @abstract
     * @function updateAttachment
     */
    protected abstract updateAttachment(): void;
}

/**
 * @description
 */
export declare abstract class BaseBuffer {
    /**
     * @description
     */
    private id;
    /**
     * @description
     */
    protected context: Context | undefined;
    /**
     * @description
     */
    protected bufferUsageFlags: GPUBufferUsageFlags;
    /**
     * @description
     */
    protected buffer: GPUBuffer;
    /**
     * @description
     */
    protected totalByteLength: number;
    /**
     * @description
     */
    protected latestTotalByteLength: number;
    protected label: string;
    /**
     *
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        bufferUsageFlags: GPUBufferUsageFlags;
        totalByteLength: number;
    });
    /**
     *
     * @returns
     */
    getID: () => number;
    /**
     * @returns {number} buffer total byte length.
     */
    getByteLength: () => number;
    /**
     * @description
     *  expand buffer to new size.
     */
    /**
     * @description
     */
    expand(byteLength: number): void;
    /**
     *
     * @param encoder
     * @param frameStage
     */
    abstract getGpuBuffer(encoder: GPUCommandEncoder | null, frameStage: FrameStageFormat): GPUBuffer;
}

/**
 *
 * @class BaseHolder
 *
 */
export declare abstract class BaseHolder {
    /**
     *
     */
    private id;
    /**
     *
     */
    protected context: Context;
    /**
     *
     */
    private poropertyFormat;
    /**
     *
     */
    protected debugLabel: string;
    /**
     *
     * @param opts
     *
     */
    constructor(opts: {
        debugLabel: string;
        id: number;
        context: Context;
        poropertyFormat: PropertyFormat;
    });
    /**
     *
     * @returns
     *
     */
    getID: () => number;
    /**
     *
     * @returns
     *
     */
    getDebugLabel: () => string;
    /**
     *
     * @returns
     *
     */
    getPropertyFormat: () => PropertyFormat;
    /**
     *
     * @param encoder
     *
     */
    abstract build(_encoder: GPUCommandEncoder): void;
}

/**
 *
 */
declare class BasePipeline {
    /**
     *
     */
    private id;
    /**
     *
     */
    protected context: Context;
    /**
     *
     */
    private propertyFormat;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        propertyFormat: PropertyFormat;
    });
    /**
     *
     * @returns
     */
    getID: () => number;
    /**
     *
     * @returns
     */
    getPropertyFormat: () => PropertyFormat;
}

/**
 *
 */
declare class BaseProperty {
    /**
     *
     */
    private propertyName;
    /**
     *
     */
    protected propertyFormat: PropertyFormat;
    /**
     *
     * @param propertyName
     * @param supportedProperty
     */
    constructor(propertyName: string, propertyFormat?: PropertyFormat);
    /**
     *
     * @returns
     */
    getPropertyFormat: () => PropertyFormat;
    /**
     * get property string name
     * @returns
     */
    getPropertyName: () => string;
}

/**
 * TODO::
 * https://github.com/brendan-duncan/wgsl_reflect/issues/77
 * @abstract
 * @class BaseSampler
 */
declare abstract class BaseSampler {
    /**
     *
     */
    private id;
    /**
     *
     */
    protected context: Context;
    /**
     *
     */
    protected sampler: GPUSampler;
    /**
     *
     */
    protected samplerDesc: GPUSamplerDescriptor;
    /**
     *
     */
    protected addressModeU: GPUAddressMode;
    /**
     *
     */
    protected addressModeV: GPUAddressMode;
    /**
     *
     */
    protected addressModeW: GPUAddressMode;
    /**
     *
     */
    protected magFilter: GPUFilterMode;
    /**
     *
     */
    protected minFilter: GPUFilterMode;
    /**
     *
     */
    protected mipmapFilter: GPUMipmapFilterMode;
    /**
     *
     */
    protected lodMinClamp: number;
    /**
     *
     */
    protected lodMaxClamp: number;
    /**
     *
     */
    protected anisotropy: number;
    /**
     *
     */
    protected compareFunction?: GPUCompareFunction;
    /**
     *
     */
    private samplerBindingType?;
    /**
     *
     */
    constructor(opts: {
        id: number;
        context: Context;
        addressModeU?: GPUAddressMode;
        addressModeV?: GPUAddressMode;
        addressModeW?: GPUAddressMode;
        magFilter?: GPUFilterMode;
        minFilter?: GPUFilterMode;
        mipmapFilter?: GPUMipmapFilterMode;
        lodMinClamp?: number;
        lodMaxClamp?: number;
        anisotropy?: number;
        compareFunction?: GPUCompareFunction;
        samplerBindingType?: GPUSamplerBindingType;
    });
    /**
     *
     * @returns
     *
     */
    getID: () => number;
    /**
     *
     * get sampler binding type.
     *
     */
    get SamplerBindingType(): GPUSamplerBindingType | undefined;
    /**
     *
     * @returns
     */
    protected createGpuSampler: () => GPUSampler;
    /**
     *
     * @param encoder
     * @param frameStage
     */
    abstract getGpuSampler(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUSampler;
}

/**
 *
 * @class BaseShader
 *
 */
declare abstract class BaseShader {
    /**
     *
     */
    private id;
    /**
     *
     */
    private context;
    /**
     *
     */
    protected shaderStage: GPUFlagsConstant;
    /**
     *
     */
    protected code: string;
    /**
     *
     */
    protected entryPoint: string;
    /**
     *
     */
    protected shader: GPUShaderModule | undefined;
    /**
     *
     */
    protected reflectedUniforms: IReflectUniforms | undefined;
    /**
     * @param opts.id a combined of string with hash value
     *
     */
    constructor(opts: {
        context: Context;
        shaderStage: GPUFlagsConstant;
        code: string;
        entryPoint: string;
    });
    /**
     *
     * @param code
     * @param entryPoint
     * @returns
     */
    static hash32aID: (code: string, entryPoint: string) => number;
    /**
     *
     * @returns
     */
    getID: () => number;
    /**
     *
     * @returns
     *
     */
    getEntryPoint: () => string;
    /**
     * get gpu-side shader
     */
    getGpuShader: () => GPUShaderModule;
    /**
     *
     */
    protected createGpuShader: (label: string) => void;
    /**
     *
     * @returns
     */
    getBindGroupWithGroupLayoutEntriesMap: () => Map<number, Array<GPUBindGroupLayoutEntry>>;
    /**
     *
     * @returns
     */
    getBindGroupWithResourceBindingsMap: () => Map<number, Array<VariableInfo>>;
    /**
     *
     * reflect attributes and uniforms in WGSLCode.
     * @param uniforms
     *
     */
    abstract reflect(uniforms?: Uniforms): void;
}

/**
 * @class BaseTexture
 * @todo
 * support multi usage:
 * - texture.UsedAsRenderAttachment(); provide texture render view, set base mip = 0, mip count = 1
 * - texture.UsedAsStorage(); provide texture storage read/write view, set base mip = 0 . 1 .. N, and mip count =1 in each mip level
 * - texture.UsedAsBinding(); provide texture bingindg view, set base mip = 0, mip count = maxMipLevel;
 */
declare abstract class BaseTexture {
    /**
     *
     */
    private id;
    /**
     *
     */
    protected textureUsageFlags: GPUTextureUsageFlags;
    /**
     *
     */
    protected context: Context;
    /**
     *
     */
    protected texture: GPUTexture | undefined;
    /**
     *
     */
    protected mipCurosr: number;
    /**
     *
     */
    protected mipmapCount: number;
    /**
     *
     */
    protected maxMipmapCount: number;
    /**
     *
     */
    protected extent3d: GPUExtent3D;
    /**
     *
     */
    protected textureFormat: GPUTextureFormat;
    /**
     *
     */
    protected width: number;
    /**
     *
     */
    protected height: number;
    /**
     *
     */
    protected depthOrArrayLayers: number;
    /**
     *
     */
    protected propertyFormat: PropertyFormat;
    /**
     * enable if texture flag contain texture_binding
     */
    protected textureBindingView?: GPUTextureView;
    /**
     * enable if texture flag contain storage_binding
     */
    protected storageBindingView?: GPUTextureView[];
    /**
     * enable if texture flag contain render attachemnt
     */
    protected renderAttachmentView?: GPUTextureView;
    /**
     * default is NONE;
     */
    protected selectedUsage: CURRENT_TEXTURE_USAGE;
    /**
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        propertyFormat: PropertyFormat;
        textureUsageFlags: number;
        textureFormat?: GPUTextureFormat;
        depthOrArrayLayers?: number;
        mipmapCount?: number;
    });
    /**
     * return texture extends.width
     */
    get Width(): number;
    /**
     * return texture extends.height
     */
    get Height(): number;
    /**
     * return texture extends.depthOrArrayLayers
     */
    get DepthOrArrayLayers(): number;
    /**
     * return assigned mipmapcount
     */
    get MipmapCount(): number;
    /**
     * return maximum mipmap level count.
     */
    get MaxMipmapCount(): number;
    /**
     *
     * @returns
     */
    getPropertyFormat: () => PropertyFormat;
    /**
     *
     * @returns
     */
    getID: () => number;
    /**
     *
     * @returns
     */
    getTextureFormat: () => GPUTextureFormat;
    /**
     * depth texture default
     */
    isDetphTexture: () => boolean;
    /**
     *
     * @returns
     */
    isStencilTexture: () => boolean;
    /**
     * @description
     * @returns
     */
    getTextureViewDimension: () => GPUTextureViewDimension;
    /**
     * @description
     * @returns
     */
    getBytePerTexel: () => number;
    /**
     * @description
     * @returns
     */
    getTextureDimension: () => GPUTextureDimension;
    /**
     * @description
     * @returns
     */
    getTexelCopyBufferLayout: (w?: number, h?: number) => GPUTexelCopyBufferLayout;
    /**
     * @description
     *  cursor to next view
     */
    nextCursor: () => void;
    /**
     * @param absCursor
     */
    cursor: (absCursor: number) => void;
    /**
     * @abstract
     * @function createGpuTexture
     */
    protected abstract createGpuTexture(): void;
    /**
     * @abstract
     * @function isUsageIncludeRenderAttachment
     * @returns bool
     */
    protected isUsageIncludeRenderAttachment: () => boolean;
    /**
     * @abstract
     * @function isUsageIncludeStorageBinding
     * @returns
     */
    protected isUsageIncludeStorageBinding: () => boolean;
    /**
     *
     * @returns
     */
    protected isUsageIncludeTextureBinding: () => boolean;
    /**
     *
     * @param encoder
     * @param frameStage
     */
    abstract getGpuTexture(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture;
    /**
     *
     */
    abstract getGpuTextureView(): GPUTextureView;
    /**
     *
     */
    abstract useAsStorageBinding(): void;
    /**
     *
     */
    abstract useAsTextureBinding(): void;
    /**
     *
     */
    abstract useAsRenderAttachment(): void;
}

/**
 *
 */
export declare type BlendFormat = 'disable' | 'opaque' | 'addAlphaSrcOneDst';

/**
 * @description
 * @class Buffer1D
 */
declare class Buffer1D extends BaseBuffer {
    /**
     * @description
     */
    protected handler?: BufferHandle;
    /**
     * @description
     */
    protected typedArrayData1D?: TypedArray1DFormat | ArrayBuffer;
    /**
     *
     * @param {number}              opts.id
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray1DFormat}  [opts.typedArrayData1D]     - either opts.handler or opts.typedArrayData1D must be assigned a value.
     * @param {BufferHandle}       [opts.handler]              - either opts.handler or opts.typedArrayData1D must be assigned a value.
     *
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        bufferUsageFlags: GPUBufferUsageFlags;
        rawData?: TypedArray1DFormat | ArrayBuffer;
        handler?: BufferHandle;
    });
    /**
     * @description
     * @param {number}              offset
     * @param {number}              byteLength
     * @param {TypedArray1DFormat}  rawData
     */
    protected updateGpuBuffer: (offset: number, byteLength: number, rawData: TypedArray1DFormat | ArrayBuffer) => void;
    /**
     * @description
     */
    protected createGpuBuffer: () => void;
    /**
     * @description
     * @param {(GPUCommandEncoder|null)} encoder
     * @param {FrameStageFormat} frameStage
     */
    getGpuBuffer(encoder: GPUCommandEncoder | null, frameStage: FrameStageFormat): GPUBuffer;
}

/**
 * @description
 * @class Buffer2D
 */
declare class Buffer2D extends BaseBuffer {
    /**
     *
     */
    protected handler?: BufferArrayHandle;
    /**
     *
     */
    protected rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
    /**
     *
     * @param {number}              opts.id
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray2DFormat}  opts.typedArrayData2D
     * @param {BufferArrayHandle}            opts.handler
     *
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        bufferUsageFlags: GPUBufferUsageFlags;
        rawData?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    });
    /**
     * @description
     * @param {number}              offset
     * @param {number}              byteLength
     * @param {TypedArray1DFormat}  rawData
     */
    protected updateGpuBuffer: (offset: number, byteLength: number, rawData: TypedArray1DFormat | ArrayBuffer) => void;
    /**
     * @description
     * create gpu buffer
     * - with maximum byte length.
     * - write data if typedArrayData2D is valid.
     * - wirte data if handler is valid.
     */
    protected createGpuBuffer: () => void;
    /**
     * @description
     * @param _encoder
     * @param frameStage
     * @returns
     */
    getGpuBuffer(_encoder?: GPUCommandEncoder | null, frameStage?: FrameStageFormat): GPUBuffer;
}

/**
 * e.g for storage buffer.
 */
export declare type BufferArrayHandle = () => {
    rewrite: boolean;
    details: Array<BufferHandleDetail>;
};

/**
 * @description
 *  e.g for vertex / index / unfiorm buffer.
 *  rewrite buffer
 */
export declare type BufferHandle = () => {
    rewrite: boolean;
    detail: BufferHandleDetail;
};

/**
 *
 */
export declare type BufferHandleDetail = {
    /**
     *
     * gpu buffer byte offset
     *
     */
    offset: number;
    /**
     *
     * cpu write buffer total byte length.
     *
     */
    byteLength: number;
    /**
     *
     * cpu write source data.
     *
     */
    rawData?: TypedArray1DFormat | ArrayBuffer;
};

/**
 *
 */
declare class BufferState {
    /**
     *
     */
    private static BUFFER_SET;
    /**
     *
     */
    private context;
    /**
     *
     * @param opts
     *
     */
    constructor(context: Context);
    /**
     *
     * @param id
     *
     */
    getBuffer: (bufferID: number) => BaseBuffer;
    /**
     *
     * @param id
     * @returns
     *
     */
    createIndexBuffer(opts: {
        label: string;
        rawData: Uint16Array | Uint32Array;
    }): IndexedBuffer;
    /**
     *
     * @param opts
     * @param id
     *
     */
    createUniformBuffer: (opts: {
        label: string;
        totalByteLength: number;
        rawData?: TypedArray1DFormat | ArrayBuffer;
        handler?: BufferHandle;
    }) => UniformBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createMapBuffer: (opts: {
        label: string;
        totalByteLength: number;
        appendixBufferUsageFlags?: number;
        rawDataArray?: TypedArray2DFormat;
        handler?: BufferArrayHandle;
    }) => MapBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createStorageBuffer: (opts: {
        label: string;
        totalByteLength: number;
        bufferUsageFlags?: GPUBufferUsageFlags;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    }) => StorageBuffer;
    /**
     *
     * @param opts
     *
     */
    createIndexedStorageBuffer: (opts: {
        label: string;
        totalByteLength: number;
        rawDataArray?: Array<Uint16Array> | Array<Uint32Array>;
        handler?: BufferArrayHandle;
    }) => IndexedStorageBuffer;
    /**
     *
     * @param opts
     * @param id
     * @returns
     *
     */
    createVertexBuffer: (opts: {
        label: string;
        totalByteLength: number;
        rawData?: TypedArray1DFormat;
        handler?: BufferHandle;
    }) => VertexBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createIndirectBuffer: (opts: {
        label: string;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    }) => IndirectBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createIndexedIndirectBuffer: (opts: {
        label: string;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    }) => IndexedIndirectBuffer;
}

/**
 * @description Color attachment for rendering.
 */
export declare class ColorAttachment extends BaseAttachment {
    /**
     * @description The texture used for the color attachment.
     */
    private texture;
    /**
     * @description The clear color for the attachment.
     */
    private clearColor;
    /**
     * @description The load/store format for the color attachment.
     */
    private colorLoadStoreFormat;
    /**
     * @description The blend format for the color attachment.
     */
    private blendFormat;
    /**
     * @description The blend state for the color attachment.
     */
    private blendState?;
    /**
     * @description The render pass color attachment for the color attachment.
     */
    private renderPassColorAttachment;
    /**
     * @description The constructor for the color attachment.
     * @param opts The options for the color attachment.
     */
    constructor(opts: {
        id: number;
        context: Context;
        texture: BaseTexture;
        blendFormat?: BlendFormat;
        colorLoadStoreFormat?: ColorLoadStoreFormat;
        clearColor?: number[];
    });
    /**
     * @function updateAttachment
     */
    protected updateAttachment: () => void;
    /**
     * @description
     */
    protected updateState: () => void;
    /**
     *
     */
    getGpuColorAttachment: () => GPURenderPassColorAttachment;
    /**
     *
     * @returns
     *
     */
    getGpuBlendState: () => GPUBlendState | undefined;
    /**
     *
     * @returns
     */
    getTextureFormat: () => GPUTextureFormat;
}

/**
 *
 */
export declare type ColorLoadStoreFormat = 'clearStore' | 'loadStore';

/**
 * @class ComparisonSampler
 */
declare class ComparisonSampler extends BaseSampler {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        compareFunction: GPUCompareFunction;
        addressModeU?: GPUAddressMode;
        addressModeV?: GPUAddressMode;
        addressModeW?: GPUAddressMode;
        magFilter?: GPUFilterMode;
        minFilter?: GPUFilterMode;
        mipmapFilter?: GPUMipmapFilterMode;
        lodMinClamp?: number;
        lodMaxClamp?: number;
        anisotropy?: number;
        samplerBindingType?: GPUSamplerBindingType;
    });
    /**
     *
     * @param _encoder
     * @param _frameStage
     * @returns
     */
    getGpuSampler: (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat) => GPUSampler;
}

/**
 * @description
 * @class Compiler
 */
export declare class Compiler {
    /**
     *
     */
    private context;
    /**
     *
     */
    private bufferState;
    /**
     *
     */
    private shaderState;
    /**
     *
     */
    private textureState;
    /**
     *
     */
    private samplerState;
    /**
     *
     */
    private pipelineState;
    /**
     *
     */
    private attachmentState;
    /**
     *
     * @param opts
     */
    constructor(context: Context);
    /**
     * @description
     * @param desc
     * @returns
     */
    compileRenderHolder: (desc: RenderHolderDesc) => RenderHolder;
    /**
     * @description
     * @param desc
     */
    compileComputeHolder: (desc: ComputeHolderDesc) => ComputeHolder;
    /**
     *
     * @param opts
     * @param id
     * @returns
     *
     */
    createVertexBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        rawData?: TypedArray1DFormat;
        handler?: BufferHandle;
    }) => VertexBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createIndexBuffer: (opts: {
        debugLabel?: string;
        rawData: Uint16Array | Uint32Array;
    }) => IndexedBuffer;
    /**
     *
     * @param opts
     * @param id
     * @returns
     *
     */
    createUniformBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        rawData?: TypedArray1DFormat | ArrayBuffer;
        handler?: BufferHandle;
    }) => UniformBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createStorageBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        bufferUsageFlags?: GPUBufferUsageFlags;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    }) => StorageBuffer;
    /**
     *
     * @param opts
     * @returns
     */
    createIndexedStorageBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        rawDataArray?: Array<Uint16Array> | Array<Uint32Array>;
        handler?: BufferArrayHandle;
    }) => IndexedStorageBuffer;
    /**
     *
     * [vertex_count, instance_count, first_vertex, first_instance]
     * @param opts
     * @returns
     *
     */
    createIndirectBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat;
        handler?: BufferArrayHandle;
    }) => IndirectBuffer;
    /**
     *
     * [index_count, instance_count, first_index, vertex_offset, first_instance]
     * @param opts
     * @returns
     *
     */
    createIndexedIndirectBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat;
        handler?: BufferArrayHandle;
    }) => IndexedIndirectBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createMapBuffer: (opts: {
        debugLabel?: string;
        totalByteLength: number;
        appendixBufferUsageFlags?: number;
        rawDataArray?: TypedArray2DFormat;
        handler?: BufferArrayHandle;
    }) => MapBuffer;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createVertexShader: (opts: {
        debugLabel?: number;
        code: string;
        entryPoint: string;
    }) => VertexShader;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createFragmentShader: (opts: {
        debugLabel?: number;
        code: string;
        entryPoint: string;
    }) => FragmentShader;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createComputeShader: (opts: {
        debugLabel?: number;
        code: string;
        entryPoint: string;
    }) => ComputeShader;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createColorAttachment: (opts: {
        debugLabel?: number;
        texture: BaseTexture;
        blendFormat?: BlendFormat;
        colorLoadStoreFormat?: ColorLoadStoreFormat;
        clearColor?: number[];
    }) => ColorAttachment;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createDepthStencilAttachment: (opts: {
        debugLabel?: number;
        texture: Texture2D;
        depthBias?: number;
        depthBiasSlopeScale?: number;
        depthLoadStoreFormat?: DepthLoadStoreFormat;
        depthCompareFunction?: GPUCompareFunction;
        stencilFunctionFormat?: StencilStateFormat;
        stencilLoadStoreFormat?: StencilLoadStoreFormat;
        depthReadOnly?: boolean;
        depthClearValue?: number;
        stencilReadOnly?: boolean;
        stencilClearValue?: number;
    }) => DepthStencilAttachment;
    /**
     * @description link to surface for rendering in each frame.
     * @returns SurfaceTexture2D
     *
     */
    createSurfaceTexture2D: () => SurfaceTexture2D;
    /**
     * @function createTexture2D
     */
    createTexture2D: (opts: {
        debugLabel?: number;
        width: number;
        height: number;
        textureData?: TypedArray1DFormat;
        handler?: Texture2DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture2D;
    /**
     * @function createTextureStorage2D
     */
    createTextureStorage2D: (opts: {
        debugLabel?: number;
        width: number;
        height: number;
        textureData?: TypedArray1DFormat;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => TextureStorage2D;
    /**
     * @param opts
     * @returns
     *
     */
    createTexture2DArray: (opts: {
        debugLabel?: number;
        width: number;
        height: number;
        depthOrArrayLayers: number;
        textureDataArray?: TypedArray2DFormat;
        handler?: TextureArrayHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture2DArray;
    /**
     * @function createTextureCube
     */
    createTextureCube: (opts: {
        debugLabel?: number;
        width: number;
        height: number;
        faces: {
            posx: TypedArray1DFormat;
            negx: TypedArray1DFormat;
            posy: TypedArray1DFormat;
            negy: TypedArray1DFormat;
            posz: TypedArray1DFormat;
            negz: TypedArray1DFormat;
        };
        appendixTextureUsages?: number;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    }) => TextureCube;
    /**
     * @description
     * @param opts
     * @returns
     */
    createTexture3D: (opts: {
        label?: string;
        width: number;
        height: number;
        depth: number;
        textureData?: TypedArray2DFormat;
        handler?: Texture3DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture3D;
    /**
     * @function createTextureSampler
     * @param opts
     * @returns
     */
    createTextureSampler: (opts: {
        debugLabel?: number;
        addressModeU?: GPUAddressMode;
        addressModeV?: GPUAddressMode;
        addressModeW?: GPUAddressMode;
        magFilter?: GPUFilterMode;
        minFilter?: GPUFilterMode;
        mipmapFilter?: GPUMipmapFilterMode;
        lodMinClamp?: number;
        lodMaxClamp?: number;
        anisotropy?: number;
        samplerBindingType?: GPUSamplerBindingType;
    }) => TextureSampler;
    /**
     * @function createComparisonSampler
     */
    createComparisonSampler: (opts: {
        debugLabel?: number;
        addressModeU?: GPUAddressMode;
        addressModeV?: GPUAddressMode;
        addressModeW?: GPUAddressMode;
        magFilter?: GPUFilterMode;
        minFilter?: GPUFilterMode;
        mipmapFilter?: GPUMipmapFilterMode;
        lodMinClamp?: number;
        lodMaxClamp?: number;
        anisotropy?: number;
        compareFunction?: GPUCompareFunction;
        samplerBindingType?: GPUSamplerBindingType;
    }) => ComparisonSampler;
}

/**
 *
 */
export declare type ComputeHandle = (encoder: GPUComputePassEncoder) => void;

/**
 *
 */
export declare class ComputeHolder extends BaseHolder {
    /**
     *
     */
    private computePipeline;
    /**
     *
     */
    private bufferState;
    /**
     *
     */
    private textureState;
    /**
     *
     */
    private computeHandler;
    /**
     *
     */
    private uniformHandler;
    /**
     *
     */
    private hookHandler?;
    /**
     *
     */
    private slotBindGroupMap;
    /**
     *
     * @param opts
     *
     */
    constructor(opts: {
        debugLabel: string;
        id: number;
        context: Context;
        computePipeline: ComputePipeline;
        bufferState: BufferState;
        textureState: TextureState;
        computeHandler: ComputeHandle;
        uniformHandler: UniformHandle;
        hookHandler?: HookHandle;
        slotBindGroupMap: Map<number, GPUBindGroup>;
    });
    /**
     *
     * @param encoder
     */
    build(encoder: GPUCommandEncoder): void;
}

/**
 * support:
 * gpu-driven style
 * @class ComputeHolderDesc
 */
export declare interface ComputeHolderDesc {
    /**
     * @description
     */
    label: string;
    /**
     * @description
     */
    computeShader: ComputeShader;
    /**
     * @description
     */
    uniforms: Uniforms;
    /**
     * @description
     */
    dispatch: ComputeProperty;
    /**
     * @description
     *  - compute shader tail handler.
     *  - append command buffer at the end.
     */
    handler?: HookHandle;
}

/**
 *
 */
export declare class ComputePipeline extends BasePipeline {
    /**
     *
     */
    private computePipelineDescriptor;
    /**
     *
     */
    private computePipeline;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        computePipelineDescriptor: GPUComputePipelineDescriptor;
    });
    /**
     *
     */
    private createGpuComputePipeline;
    /**
     *
     * @returns
     */
    getGpuComputePipeline: () => GPUComputePipeline;
}

/**
 *
 * @class ComputeProperty
 *
 */
export declare class ComputeProperty extends BaseProperty {
    /**
     *
     */
    private groupX?;
    /**
     *
     */
    private groupY?;
    /**
     *
     */
    private groupZ?;
    /**
     *
     */
    private hanlderX?;
    /**
     *
     */
    private hanlderY?;
    /**
     *
     */
    private hanlderZ?;
    /**
     *
     * @param [number|WorkSizeHandle] x
     * @param [number|WorkSizeHandle] y
     * @param [number|WorkSizeHandle] z
     *
     */
    constructor(x: WorkSizeHandle, y: number, z: number);
    constructor(x: WorkSizeHandle, y: WorkSizeHandle, z: number);
    constructor(x: WorkSizeHandle, y: WorkSizeHandle, z: WorkSizeHandle);
    constructor(x: number, y: number, z: number);
    /**
     *
     * @returns
     */
    getGroupX: () => number;
    /**
     *
     * @returns
     */
    getGroupY: () => number;
    /**
     *
     * @returns
     */
    getGroupZ: () => number;
}

/**
 *
 */
export declare class ComputeShader extends BaseShader {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        context: Context;
        code: string;
        entryPoint: string;
    });
    /**
     *
     */
    reflect: (uniforms?: Uniforms, debugLabel?: string) => void;
}

/**
 *
 */
export declare class Context {
    /**
     *
     */
    private contextDesc;
    /**
     *
     */
    private gpuContext;
    /**
     *
     */
    private device;
    /**
     *
     */
    private adapter;
    /**
     *
     */
    private queue;
    /**
     *
     */
    private features;
    /**
     *
     */
    private limits;
    /**
     *
     */
    private frameTargetTexture;
    /**
     *
     */
    private frameTargetTextureView;
    /**
     *
     */
    private commandEncoder;
    /**
     *
     * request supported features.
     *
     */
    private supportedFeatures;
    /**
     *
     * request GPUFeature from input.
     *
     */
    private requestFeatures?;
    /**
     *
     * @param opts
     */
    constructor(opts: IContextOpts);
    /**
     * @description need use 'await' for adapter request, e.g:
     * const adapter = await context.init();
     *
     */
    init(): Promise<void>;
    /**
     *
     */
    get GPUDescription(): string;
    /**
     *
     */
    getSupportedFeatures: () => GPUSupportedFeatures | undefined;
    /**
     *
     */
    refreshFrameResource: () => void;
    /**
     *
     */
    submitFrameResource: () => void;
    /**
     *
     */
    getCommandEncoder: () => GPUCommandEncoder;
    /**
     *
     * @returns
     */
    getFrameTexture: () => GPUTexture;
    /**
     *
     * @returns
     */
    getFrameTextureView: () => GPUTextureView;
    /**
     *
     */
    getViewportWidth: () => number;
    /**
     *
     */
    getViewportHeight: () => number;
    /**
     * @description
     */
    getMax2DMipmapCount: () => number;
    /**
     *
     * @returns
     */
    getGpuDevice: () => GPUDevice;
    /**
     *
     * @returns
     */
    getGpuQueue: () => GPUQueue;
    /**
     *
     * @returns
     */
    getLimits: () => GPUSupportedLimits;
    /**
     *
     * @returns
     */
    getPreferredTextureFormat: () => GPUTextureFormat;
    /**
     *
     * @returns
     */
    getPreferredDepthTexuteFormat: () => GPUTextureFormat;
}

/**
 *
 */
export declare type CullFormat = 'none' | 'frontCW' | 'frontCCW' | 'backCW' | 'backCCW';

/**
 * TEXTURE USAGE
 */
declare type CURRENT_TEXTURE_USAGE = 'NONE' | 'STORAGE_BINDING' | 'RENDER_ATTACHMENT' | 'TEXTURE_BINDING';

/**
 *
 */
export declare type DepthLoadStoreFormat = 'loadStore' | 'clearStore';

/**
 * @description
 * @class DepthStencilAttachment
 */
export declare class DepthStencilAttachment extends BaseAttachment {
    /**
     * @description Get the depth stencil state.
     */
    private depthStencilState;
    /**
     * @description Get the depth stencil attachment.
     */
    private depthStencilAttachment;
    /**
     * @description Get the texture.
     */
    private texture;
    /**
     * @description Get the depth load/store format.
     */
    private depthLoadStoreFormat;
    /**
     * @description Get the depth compare function.
     */
    private depthCompareFunction;
    /**
     * @description Get the stencil state format.
     */
    private stencilStateFormat;
    /**
     * @description Get the stencil load/store format.
     */
    private stencilLoadStoreFormat;
    /**
     * @description Get the stencil compare function.
     */
    private depthReadOnly;
    /**
     * @description Get the depth clear value.
     * @returns {number}
     */
    private depthClearValue;
    /**
     * @description Get the stencil read-only state.
     * @returns {boolean}
     */
    private stencilReadOnly;
    /**
     * @description Get the stencil clear value.
     * @returns {number}
     */
    private stencilClearValue;
    /**
     * @description Get the depth bias.
     * @returns {number | undefined}
     */
    private depthBias?;
    /**
     * @description Get the depth bias slope scale.
     * @returns {number | undefined}
     */
    private depthBiasSlopeScale?;
    /**
     * @description Create a new DepthStencilAttachment.
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        texture: Texture2D;
        depthBias?: number;
        depthBiasSlopeScale?: number;
        depthLoadStoreFormat?: DepthLoadStoreFormat;
        depthCompareFunction?: GPUCompareFunction;
        stencilFunctionFormat?: StencilStateFormat;
        stencilLoadStoreFormat?: StencilLoadStoreFormat;
        depthReadOnly?: boolean;
        depthClearValue?: number;
        stencilReadOnly?: boolean;
        stencilClearValue?: number;
    });
    /**
     * @overload@overload
     */
    protected updateState: () => void;
    /**
     * @override
     * @function updateAttachment
     */
    protected updateAttachment: () => void;
    /**
     * @description Get the GPU render pass depth stencil attachment.
     * @returns {GPURenderPassDepthStencilAttachment}
     */
    getGpuRenderPassDepthStencilAttachment: () => GPURenderPassDepthStencilAttachment;
    /**
     * @description Get the depth stencil state.
     * @returns {GPUDepthStencilState}
     */
    getDepthStencilState: () => GPUDepthStencilState;
    /**
     * @description Get the texture.
     * @returns {Texture2D}
     */
    getTexture: () => Texture2D;
}

/**
 *
 */
export declare type FeatureNameFormat = GPUFeatureName | 'chromium-experimental-multi-draw-indirect' | 'chromium-experimental-snorm16-texture-formats' | 'chromium-experimental-timestamp-query-inside-passes' | 'chromium-experimental-unorm16-texture-formats';

/**
 *
 */
export declare class FragmentShader extends BaseShader {
    constructor(opts: {
        context: Context;
        code: string;
        entryPoint: string;
    });
    /**
     *
     */
    reflect: (uniforms?: Uniforms, debugLabel?: string) => void;
}

/**
 *
 */
export declare type FrameStageFormat = 'frameBegin' | 'frameFinish';

/**
 *
 * @param extent3d
 * @returns
 */
export declare const getMaxMipmapCount: (...args: number[]) => number;

/**
 *
 * @param str input raw string
 * @returns
 */
export declare const hash32a: (str: string) => number;

/**
 *
 * hook handle
 * share gpu command encoder,
 * used as buffer copy etc.
 *
 */
export declare type HookHandle = {
    (encoder: GPUCommandEncoder): void;
};

/**
 * @description
 * pipegup context descriptor
 * @interface IContextOpts
 */
export declare interface IContextOpts {
    /**
     * selector for the element to be used as a context
     * for example: 'canvas'
     */
    selector: string | HTMLCanvasElement;
    /**
     *
     * width of the context
     * style width
     * e.g
     * - htmlCanvas.style.width = `${width}px`;
     *
     */
    width: number;
    /**
     *
     * height of the context
     * style height
     * e.g
     * - htmlCanvas.style.height = `${height}px`;
     *
     */
    height: number;
    /**
     * pixel ratio of the context
     * @description this is the ratio of the device pixel ratio to the css pixel ratio
     */
    devicePixelRatio: number;
    /**
     *
     */
    requestFeatures?: FeatureNameFormat[];
}

/**
 *
 * @class IndexedBuffer
 *
 */
export declare class IndexedBuffer extends Buffer1D {
    /**
     *
     */
    private indexFormat;
    /**
     *
     */
    private drawCount;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        typedArrayData1D: Uint16Array | Uint32Array;
    });
    /**
     *
     * @returns {number}
     *
     */
    getMaxDrawCount: () => number;
    /**
     *
     * @returns {GPUIndexFormat}
     *
     */
    getIndexFormat: () => GPUIndexFormat;
    /**
     *
     * @param _encoder
     * @param frameStage
     */
    getGpuBuffer: (_encoder?: GPUCommandEncoder | null, _frameStage?: FrameStageFormat) => GPUBuffer;
}

/**
 *
 * https://gpuweb.github.io/gpuweb/#dom-gpurendercommandsmixin-drawindexedindirect
 *
 * - index_count { 0 };
 * - instance_count { 1 };
 * - first_index { 0 };
 * - vertex_offset { 0 };
 * - first_instance { 0 };
 *
 */
export declare class IndexedIndirectBuffer extends StorageBuffer {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    });
    /**
     *
     * @returns
     */
    getStride: () => number;
    /**
     *
     * @returns
     */
    getOffset: () => number;
    /**
     *
     * @returns
     */
    getIndexIndirectCount: () => number;
}

/**
 * @description
 * @class IndexedStorageBuffer
 */
export declare class IndexedStorageBuffer extends StorageBuffer {
    /**
     * @description
     */
    private indexedFormat;
    /**
     *
     */
    private drawCount;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        rawDataArray?: Array<Uint16Array> | Array<Uint32Array>;
        handler?: BufferArrayHandle;
    });
    /**
     * TODO::
     * handler type need update.
     *
     * @returns
     */
    getIndexedFormat: () => GPUIndexFormat;
    /**
     *
     * @returns
     */
    getMaxDrawCount: () => number;
    /**
     *
     * @param _encoder
     * @param frameStage
     * @returns
     */
    getGpuBuffer(_encoder?: GPUCommandEncoder | null, frameStage?: FrameStageFormat): GPUBuffer;
}

/**
 *
 * ref:
 * https://toji.dev/webgpu-best-practices/indirect-draws.html
 *
 * - vertex_count { 0 };
 * - instance_count { 1 };
 * - first_vertex { 0 };
 * - first_instance { 0 };
 *
 */
export declare class IndirectBuffer extends StorageBuffer {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    });
    getStride: () => number;
    getOffset: () => number;
    getIndexIndirectCount: () => number;
}

/**
 *
 */
declare interface IReflectUniforms {
    bindGroupCount: number;
    groupIDwithBindGroupLayoutEntriesMap: Map<number, Array<GPUBindGroupLayoutEntry>>;
    groupIDwithResourceBindingsMap: Map<number, Array<VariableInfo>>;
}

/**
 *
 * mapbuffer is cpu-gps sync buffer.
 * - map read buffer.
 * - map write buffer.
 * - map self buffer. support storage buffer as default. also support query set usage.
 *
 */
export declare class MapBuffer extends StorageBuffer {
    /**
     *
     */
    protected mapReadBuffer: GPUBuffer;
    /**
     *
     */
    protected mapWriteBuffer: GPUBuffer;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        appendixBufferUsageFlags?: number;
        rawDataArray?: TypedArray2DFormat;
        handler?: BufferArrayHandle;
    });
    /**
     *
     *  read buffer.
     *  - copy gpu buffer to read buffer in each frame.
     *  - read buffer support PullSync in CPU stage.
     */
    private createMapReadBuffer;
    /**
     *
     * write buffer.
     * - copy wirte buffer to gpu-side buffer in each frame.
     * - wirte buffer support PushSnyc in CPU stage.
     *
     */
    private createMapWriteBuffer;
    /**
     *
     * @description TODO:: fit typedarray format.
     * @deprecated
     * @param byteOffset
     * @param byteLength
     * @param typedArray
     * @returns
     *
     */
    PushDataAsync(byteOffset: number, byteLength: number, typedArray: TypedArray1DFormat): Promise<void>;
    /**
     *
     * @param byteOffset
     * @param byteLength
     * @returns
     */
    PullDataAsync(byteOffset?: number, byteLength?: number): Promise<ArrayBuffer | undefined>;
    /**
     *
     * @param encoder
     * @param frameStage
     * @returns
     *
     */
    getGpuBuffer: (encoder: GPUCommandEncoder, frameStage: FrameStageFormat) => GPUBuffer;
}

/**
 *
 * @param args
 * @returns
 */
export declare const max: (...args: number[]) => number;

/**
 *
 * support dynmaic max draw count.
 * - max draw count
 * @example
 * const maxDrawCountHandler = ():number => {
 *   return 0;
 * }
 *
 */
declare type MaxDrawCountHandle = {
    (): number;
};

/**
 *
 * @param args
 * @returns
 */
export declare const min: (...args: number[]) => number;

/**
 *
 */
export declare type MultiSampleFormat = '1x' | '2x' | '4x' | '8x';

/**
 * @description
 *  NONE buffer update.
 */
export declare const NoBufferArrayUpdateRequired: {
    rewrite: boolean;
    details: never[];
};

/**
 * @description
 */
export declare const NoBufferUpdateRequired: {
    rewrite: boolean;
    detail: {
        offset: number;
        byteLength: number;
        rawData: Uint8Array<ArrayBuffer>;
    };
};

/**
 * @interface PrimitiveDesc
 */
declare interface PrimitiveDesc {
    /**
     *
     */
    cullFormat?: CullFormat;
    /**
     *
     */
    primitiveTopology?: GPUPrimitiveTopology;
}

/**
 *
 * @description
 * @class Properties
 *
 */
export declare class Properties {
    /**
     * @description
     */
    protected propertyMap: Map<string, BaseProperty>;
    /**
     * @description
     */
    constructor();
    /**
     * @description
     * @returns
     */
    isEmpty: () => boolean;
    /**
     * @description
     */
    getPropertyMap: () => Map<string, BaseProperty>;
}

/**
 *
 */
export declare type PropertyFormat = 'none' | 'computeDispatch' | 'drawCount' | 'drawIndexedStorage' | 'drawIndexed' | 'drawIndirect' | 'multiDrawIndirect' | 'drawIndexedIndirect' | 'multiDrawIndexedIndirect' | 'vertexBuffer' | 'uniformBuffer' | 'indexBuffer' | 'storageBuffer' | 'surfaceTexture2D' | 'textureStorage2D' | 'renderPipeline' | 'computePipeline' | 'renderHolder' | 'computeHolder' | 'texture1D' | 'texture2D' | 'texutre3D' | 'textureCube' | 'texture2DArray' | 'textureCubeArray' | 'textureSampler';

/**
 *
 */
export declare type RenderHandle = (encoder: GPURenderPassEncoder) => void;

/**
 *
 */
export declare class RenderHolder extends BaseHolder {
    /**
     *
     */
    private renderPipeline;
    /**
     *
     */
    private bufferState;
    /**
     *
     */
    private texturteState;
    /**
     *
     */
    private renderHandler;
    /**
     *
     */
    private uniformHandler;
    /**
     *
     */
    private slotAttributeBufferIDMap;
    /**
     *
     */
    private slotBindGroupMap;
    /**
     *
     */
    private colorAttachments;
    /**
     *
     */
    private depthStencilAttachment?;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        debugLabel: string;
        id: number;
        context: Context;
        renderPipeline: RenderPipeline;
        bufferState: BufferState;
        texturteState: TextureState;
        renderHandler: RenderHandle;
        uniformHandler: UniformHandle;
        slotAttributeBufferIDMap: Map<number, number>;
        slotBindGroupMap: Map<number, GPUBindGroup>;
        colorAttachments: ColorAttachment[];
        depthStencilAttachment?: DepthStencilAttachment;
    });
    /**
     * @param encoder
     */
    build: (encoder: GPUCommandEncoder) => void;
}

/**
 * render holde descriptor
 * @param label {String}
 * @param vertexShader {VertexShader}
 */
export declare interface RenderHolderDesc {
    /**
     * debug label(stats info head bar)
     */
    label: string;
    /**
     * vertex shader.
     */
    vertexShader: VertexShader;
    /**
     * fragment shader.
     */
    fragmentShader: FragmentShader;
    /**
     * parse attributes.
     */
    attributes: Attributes;
    /**
     * parse uniforms.
     */
    uniforms: Uniforms;
    /**
     * parse dispatch.
     */
    dispatch: RenderProperty;
    /**
     * color attachment
     * - surface color attachments.
     * - fbo attachments.
     */
    colorAttachments: ColorAttachment[];
    /**
     * depth stencil attachments.
     */
    depthStencilAttachment?: DepthStencilAttachment;
    /**
     *
     */
    multiSampleFormat?: MultiSampleFormat;
    /**
     *
     */
    primitiveDesc?: PrimitiveDesc;
}

/**
 *
 * @class RenderPipeline
 *
 */
export declare class RenderPipeline extends BasePipeline {
    /**
     *
     */
    private renderPipelineDescriptor;
    /**
     *
     */
    private renderPipeline;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        renderPipelineDescriptor: GPURenderPipelineDescriptor;
    });
    /**
     *
     */
    private createGpuRenderPipeline;
    /**
     *
     */
    getGpuRenderPipeline: () => GPURenderPipeline;
}

/**
 *
 * @class RenderProperty
 *
 */
export declare class RenderProperty extends BaseProperty {
    /**
     *
     */
    private maxDrawCount;
    /**
     *
     */
    private maxDrawCountHandler?;
    /**
     *
     */
    private instanceCount?;
    /**
     *
     */
    private indexBuffer?;
    /**
     *
     */
    private indexedStorageBuffer?;
    /**
     *
     */
    private indexedIndirectBuffer?;
    /**
     *
     */
    private indirectDrawCountBuffer?;
    /**
     *
     */
    private indirectBuffer?;
    /**
     *
     * @param maxDrawCount
     */
    constructor(maxDrawCount: number);
    constructor(maxDrawCount: number, instanceCount: number);
    constructor(indexBuffer: IndexedBuffer);
    constructor(indexBuffer: IndexedBuffer, instanceCount: number);
    constructor(indexStorageBuffer: IndexedStorageBuffer, instanceCount: number);
    constructor(indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer);
    constructor(indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number);
    constructor(indexStorageBuffer: IndexedStorageBuffer, indexedIndirectBuffer: IndexedIndirectBuffer, indirectDrawCountBuffer: StorageBuffer, handler: MaxDrawCountHandle);
    constructor(indirectBuffer: IndirectBuffer);
    constructor(indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, maxDrawCount: number);
    constructor(indirectBuffer: IndirectBuffer, indirectDrawCountBuffer: StorageBuffer, handler: MaxDrawCountHandle);
    /**
     *
     * @returns
     */
    getMaxDrawCount: () => number;
    /**
     *
     * @returns
     */
    getInstanceCount(): number | undefined;
    /**
     *
     * @returns
     */
    getIndexBuffer(): IndexedBuffer | undefined;
    /**
     *
     * @returns
     */
    getIndexFormat(): GPUIndexFormat;
    /**
     *
     * @returns
     */
    getIndexedIndirectBuffer: () => IndexedIndirectBuffer | undefined;
    /**
     *
     * @returns
     */
    getIndexStorageBuffer: () => IndexedStorageBuffer | undefined;
    /**
     *
     * @returns
     *
     */
    getIndirectCountBuffer: () => StorageBuffer | undefined;
    /**
     *
     * @returns
     *
     */
    getIndirectBuffer: () => IndirectBuffer | undefined;
}

/**
 *
 */
export declare type StencilLoadStoreFormat = 'loadStore' | 'clearStore';

/**
 *
 */
export declare type StencilStateFormat = 'alwaysKeep';

/**
 *
 * @class StorageBuffer
 *
 */
export declare class StorageBuffer extends Buffer2D {
    /**
     *
     * @param {number}              opts.id
     * @param {Context}             opts.context
     * @param {number}              opts.totalByteLength
     * @param {GPUBufferUsageFlags} opts.bufferUsageFlags
     * @param {TypedArray2DFormat}  opts.typedArrayData2D
     * @param {BufferArrayHandle}            opts.handler
     *
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        bufferUsageFlags?: GPUBufferUsageFlags;
        rawDataArray?: TypedArray2DFormat | Array<ArrayBuffer>;
        handler?: BufferArrayHandle;
    });
}

/**
 *
 */
export declare class SurfaceTexture2D extends BaseTexture {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        appendixTextureUsages?: number;
    });
    /**
     *
     */
    protected createGpuTexture(): void;
    /**
     * surface texture do nothing.
     */
    getGpuTextureView: () => GPUTextureView;
    /**
     *
     * @param [GPUCommandEncoder] encoder
     * @param [FrameStageFormat] frameStage
     *
     */
    getGpuTexture: (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat) => GPUTexture;
    /**
     * @function useAsStorageBinding
     */
    useAsStorageBinding(): void;
    /**
     * @function useAsTextureBinding
     */
    useAsTextureBinding(): void;
    /**
     * @function useAsRenderAttachment
     */
    useAsRenderAttachment(): void;
}

/**
 * @description
 * @class Texture2D
 */
export declare class Texture2D extends BaseTexture {
    /**
     *
     */
    protected textureData_?: TypedArray1DFormat;
    /**
     * @description
     */
    protected handler_?: Texture2DHandle;
    /**
     * https://github.com/pipegpu/pipegpu.core/issues/16
     * indicator auto increment mip level in storage binding use
     */
    private autoIncrementMipLevelInStorageBindingUse;
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        appendixTextureUsages?: number;
        textureData?: TypedArray1DFormat;
        handler?: Texture2DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    });
    /**
     * https://github.com/pipegpu/pipegpu.core/issues/16
     * @param enable
     */
    AutoIncrementMipLevelInStorageBinding: (enable: boolean) => void;
    /**
     *
     */
    protected refreshTextureDataSource(): void;
    /**
     *
     */
    protected createGpuTexture(): void;
    /**
     * @description
     * @param encoder
     * @param frameStage
     */
    getGpuTexture: (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat) => GPUTexture;
    /**
     * @override
     * @function getGpuTextureView
     * @returns
     */
    getGpuTextureView: () => GPUTextureView;
    /**
     * e.g use texture as storage binding for compute shader
     */
    useAsStorageBinding: () => void;
    /**
     * @function useAsTextureBinding
     */
    useAsTextureBinding: () => void;
    /**
     *
     */
    useAsRenderAttachment: () => void;
}

/**
 * @description
 * support:
 * - use as texture binding.
 * - use as render attachment.
 * @class Texture2DArray
 */
export declare class Texture2DArray extends BaseTexture {
    /**
     * @description
     */
    protected textureData2DArray?: TypedArray2DFormat;
    /**
     * @description
     */
    protected handler?: TextureArrayHandle;
    /**
     * @description
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        depthOrArrayLayers: number;
        appendixTextureUsages?: number;
        textureDataArray?: TypedArray2DFormat;
        handler?: TextureArrayHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    });
    /**
     * @description
     */
    protected refreshTextureDataSource(): void;
    /**
     * @description
     */
    protected createGpuTexture(): void;
    /**
     * @description
     * @param _encoder
     * @param frameStage
     * @returns
     */
    getGpuTexture(_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat): GPUTexture;
    /**
     * @description
     * @returns
     */
    getGpuTextureView(): GPUTextureView;
    /**
     * e.g use texture as storage binding for compute shader
     */
    useAsStorageBinding: () => void;
    /**
     * @function useAsTextureBinding
     */
    useAsTextureBinding: () => void;
    /**
     * @description
     *  use as render attachment.
     *  only support 'index' texture2D as render attachment, default is 0
     * @function useAsRenderAttachment
     */
    useAsRenderAttachment: (index?: number) => void;
}

/**
 * @description
 */
export declare type Texture2DHandle = () => {
    rewrite: boolean;
    detail: TextureDetailHandle;
};

/**
 * @description
 * @class Texture3D
 */
export declare class Texture3D extends BaseTexture {
    /**
     * @description
     */
    protected textureData?: TypedArray2DFormat;
    /**
     * @description
     */
    protected handler?: Texture3DHandle;
    /**
     * @description
     * @param opts
     * @param {GPUTextureFormat} opts.textureFormat. texture3d only support color texel format.
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        depth: number;
        appendixTextureUsages?: number;
        textureData?: TypedArray2DFormat;
        handler?: Texture3DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    });
    /**
     * @description
     */
    protected refreshTextureDataSource(): void;
    /**
     *
     */
    protected createGpuTexture(): void;
    /**
     * @description
     * @param encoder
     * @param frameStage
     */
    getGpuTexture: (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat) => GPUTexture;
    /**
     * @override
     * @function getGpuTextureView
     * @returns
     */
    getGpuTextureView: () => GPUTextureView;
    /**
     * @description use texture as storage binding for compute shader.
     */
    useAsStorageBinding: () => void;
    /**
     * @function useAsTextureBinding
     */
    useAsTextureBinding: () => void;
    /**
     *
     */
    useAsRenderAttachment: () => never;
}

/**
 * @description
 */
export declare type Texture3DDetailHandle = {
    /**
     * @description
     *  write start position, in pixel postion. [start row index, start col index, start depth index].
     */
    originXYZ: number[];
    /**
     * @description
     *  write block size, should set as [write width, write height, write depth].
     */
    blockSize: number[];
    /**
     * @description
     */
    rawData: TypedArray1DFormat;
};

/**
 * @description
 */
export declare type Texture3DHandle = () => {
    rewrite: boolean;
    details: Array<Texture3DDetailHandle>;
};

/**
 * @description
 *  e.g for texture 2d array.
 */
export declare type TextureArrayHandle = () => {
    rewrite: boolean;
    details: Array<TextureDetailHandle>;
};

/**
 * @description textures order: [+x, -x, +y, -y, +z, -z], array length equals 6.
 * @class TextureCube
 * ref: https://webgpufundamentals.org/webgpu/lessons/webgpu-cube-maps.html
 */
export declare class TextureCube extends Texture2DArray {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        faces: {
            posx: TypedArray1DFormat;
            negx: TypedArray1DFormat;
            posy: TypedArray1DFormat;
            negy: TypedArray1DFormat;
            posz: TypedArray1DFormat;
            negz: TypedArray1DFormat;
        };
        appendixTextureUsages?: number;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    });
}

/**
 * @description
 */
export declare type TextureDetailHandle = {
    /**
     * the index of texture, also seen as offset.
     */
    depthOrArrayLayerIndex: number;
    /**
     *
     */
    rawData?: TypedArray1DFormat | ArrayBuffer;
};

/**
 * @class
 * @description
 */
export declare class TextureSampler extends BaseSampler {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        addressModeU?: GPUAddressMode;
        addressModeV?: GPUAddressMode;
        addressModeW?: GPUAddressMode;
        magFilter?: GPUFilterMode;
        minFilter?: GPUFilterMode;
        mipmapFilter?: GPUMipmapFilterMode;
        lodMinClamp?: number;
        lodMaxClamp?: number;
        anisotropy?: number;
        samplerBindingType?: GPUSamplerBindingType;
    });
    /**
     *
     * @param _encoder
     * @param _frameStage
     * @returns
     */
    getGpuSampler: (_encoder?: GPUCommandEncoder, _frameStage?: FrameStageFormat) => GPUSampler;
}

/**
 * @description
 */
declare class TextureState {
    /**
     * @description
     */
    private static TEXTURE_SET;
    /**
     * @description
     */
    private context;
    /**
     * @description
     * @param opts
     */
    constructor(context: Context);
    /**
     * @param id
     * @returns
     */
    getTexture: (textureID: number) => BaseTexture | undefined;
    /**
     * @param id
     */
    createTexutre2D: (opts: {
        width: number;
        height: number;
        textureData?: TypedArray1DFormat;
        handler?: Texture2DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture2D;
    /**
     * @description
     * @param opts
     * @returns
     */
    createTexture3D: (opts: {
        width: number;
        height: number;
        depth: number;
        textureData?: TypedArray2DFormat;
        handler?: Texture3DHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture3D;
    /**
     *
     * @param opts
     * @returns
     *
     */
    createTextureStorage2D: (opts: {
        width: number;
        height: number;
        textureData?: TypedArray1DFormat;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => TextureStorage2D;
    /**
     *
     * @param opts
     * @param id
     * @returns
     */
    createSurfaceTexture2D: () => SurfaceTexture2D;
    /**
     * @param opts
     * @returns
     */
    createTexture2DArray: (opts: {
        width: number;
        height: number;
        depthOrArrayLayers: number;
        textureDataArray?: TypedArray2DFormat;
        handler?: TextureArrayHandle;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
    }) => Texture2DArray;
    /**
     * @param opts
     * @returns
     */
    createTextureCube: (opts: {
        width: number;
        height: number;
        faces: {
            posx: TypedArray1DFormat;
            negx: TypedArray1DFormat;
            posy: TypedArray1DFormat;
            negy: TypedArray1DFormat;
            posz: TypedArray1DFormat;
            negz: TypedArray1DFormat;
        };
        appendixTextureUsages?: number;
        textureFormat?: GPUTextureFormat;
        mipmapCount?: number;
    }) => TextureCube;
}

/**
 * @class TextureStorage2D
 * @function webgpu use texture storage to write/store result.
 */
export declare class TextureStorage2D extends Texture2D {
    /**
     * @param opts
     */
    constructor(opts: {
        id: number;
        context: Context;
        width: number;
        height: number;
        textureData?: TypedArray1DFormat;
        mipmapCount?: number;
        appendixTextureUsages?: number;
        textureFormat?: GPUTextureFormat;
    });
}

/**
 *
 */
export declare type TypedArray1DFormat = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

/**
 *
 */
export declare type TypedArray2DFormat = Array<TypedArray1DFormat>;

/**
 *
 */
export declare class UniformBuffer extends Buffer1D {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        rawData?: TypedArray1DFormat | ArrayBuffer;
        handler?: BufferHandle;
    });
}

/**
 *
 */
export declare type UniformHandle = (frameStage: FrameStageFormat, encoder: GPUCommandEncoder, bufferState: BufferState, textureState: TextureState) => void;

/**
 *
 */
export declare class Uniforms extends Properties {
    constructor();
    assign(propertyName: string, buffer: UniformBuffer): void;
    assign(propertyName: string, buffer: StorageBuffer): void;
    assign(propertyName: string, textureSampler: TextureSampler): void;
    assign(propertyName: string, texture2d: Texture2D): void;
    assign(propertyName: string, texture3d: Texture3D): void;
    assign(propertyName: string, texture2dArray: Texture2DArray): void;
    assign(propertyName: string, textureStorage2d: TextureStorage2D): void;
}

export declare const uniqueID: () => number;

/**
 *
 * @class VertexBuffer
 *
 */
export declare class VertexBuffer extends Buffer1D {
    /**
     *
     * @param opts
     */
    constructor(opts: {
        id: number;
        label: string;
        context: Context;
        totalByteLength: number;
        rawData?: TypedArray1DFormat;
        handler?: BufferHandle;
    });
}

/**
 *
 */
export declare class VertexShader extends BaseShader {
    /**
     *
     */
    private reflectedAttributes;
    /**
     *
     * @param opts
     *
     */
    constructor(opts: {
        context: Context;
        code: string;
        entryPoint: string;
    });
    /**
     *
     *
     */
    reflect: (uniforms?: Uniforms, debugLabel?: string) => void;
    /**
     *
     * @returns
     *
     */
    getVertexAttributeMap: () => Map<string, GPUVertexAttribute> | undefined;
    /**
     *
     * @returns
     *
     */
    getOrderedAttribute: () => GPUVertexAttribute[] | undefined;
    /**
     *
     * @param location
     * @returns
     *
     */
    getAttributeNameByLocation: (location: number) => string | undefined;
    /**
     *
     * @returns
     *
     */
    getAttributeCount: () => number | undefined;
}

/**
 *
 * support dynamic work size
 * - x: WorkSizeHandle
 * - y: WorkSizeHandle
 * - z: WorkSizeHandle
 *
 */
declare type WorkSizeHandle = {
    (): number;
};

export { }
