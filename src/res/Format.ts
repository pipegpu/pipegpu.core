/**
 * 
 */
type TypedArray1DFormat =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    ;

/**
 * 
 */
type TypedArray2DFormat = Array<TypedArray1DFormat>;

/**
 * 
 */
type BlendFormat =
    | 'disable'             //
    | 'opaque'
    | 'addAlphaSrcOneDst'   // color = src * k + dst * ( 1- k);
    ;

/**
 * 
 */
type ColorLoadStoreFormat =
    | 'clearStore' // load clear, store store
    | 'loadStore'   // load: load, store store
    ;

/**
 * 
 */
type MultiSampleFormat =
    | '1x'
    | '2x'
    | '4x'
    | '8x'
    ;

/**
 * 
 */
type FrameStageFormat =
    | 'frameBegin'
    | 'frameFinish'
    ;

/**
 * 
 */
type PropertyFormat =
    | 'none'
    | 'computeDispatch'
    | 'drawCount'
    | 'drawIndexedStorage'
    | 'drawIndexed'
    | 'drawIndirect'
    | 'multiDrawIndirect'
    | 'drawIndexedIndirect'
    | 'multiDrawIndexedIndirect'
    | 'vertexBuffer'
    | 'uniformBuffer'
    | 'indexBuffer'
    | 'storageBuffer'
    | 'surfaceTexture2D'
    | 'textureStorage2D'
    | 'renderPipeline'
    | 'computePipeline'
    | 'renderHolder'
    | 'computeHolder'
    | 'texture1D'
    | 'texture2D'
    | 'texutre3D'
    | 'textureCube'
    | 'texture2DArray'
    | 'textureCubeArray'
    | 'textureSampler'
    ;

/**
 * 
 */
type DepthLoadStoreFormat =
    | 'loadStore'
    | 'clearStore'
    ;

/**
 * 
 */
type StencilLoadStoreFormat =
    | 'loadStore'
    | 'clearStore'
    ;

/**
 * 
 */
type StencilStateFormat =
    | 'alwaysKeep'
    ;

/**
 * 
 */
type CullFormat =
    | 'none'
    | 'frontCW'
    | 'frontCCW'
    | 'backCW'
    | 'backCCW'
    ;

/**
 * 
 */
type FeatureNameFormat = GPUFeatureName
    | 'chromium-experimental-multi-draw-indirect'
    | 'chromium-experimental-snorm16-texture-formats'
    | 'chromium-experimental-timestamp-query-inside-passes'
    | 'chromium-experimental-unorm16-texture-formats'
    ;


export type {
    CullFormat,
    StencilStateFormat,
    ColorLoadStoreFormat,
    DepthLoadStoreFormat,
    StencilLoadStoreFormat,
    BlendFormat,
    MultiSampleFormat,
    PropertyFormat,
    FrameStageFormat,
    TypedArray1DFormat,
    TypedArray2DFormat,
    FeatureNameFormat
}