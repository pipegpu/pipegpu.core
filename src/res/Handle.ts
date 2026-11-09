import type { BufferState } from "../state/BufferState";
import type { TextureState } from "../state/TextureState";
import type { FrameStageFormat, TypedArray1DFormat } from "./Format";

/**
 * @description Define a handle for updating uniform buffers and textures during a specific frame stage.
 */
type UniformHandle = (frameStage: FrameStageFormat, encoder: GPUCommandEncoder, bufferState: BufferState, textureState: TextureState) => boolean;

/**
 * @description Define a handle for recording render pass commands.
 */
type RenderHandle = (pEncoder: GPURenderPassEncoder, cEncoder: GPUCommandEncoder) => void;

/**
 * @description Define a handle for recording compute pass commands.
 */
type ComputeHandle = (pEncoder: GPUComputePassEncoder, cEncoder: GPUCommandEncoder) => void;


/**
 * @description
 */
type BufferHandleDetail = {
    /**
     * @description
     * gpu buffer byte offset
     * 
     */
    offset: number,

    /**
     * @description
     * cpu write buffer total byte length.
     */
    byteLength: number,

    /**
     * @description
     * cpu write source data.
     */
    rawData?: TypedArray1DFormat | ArrayBuffer
};

/**
 * @description Define the details for a buffer handle, including offset, byte length, and raw data.
 */
type TextureDetailHandle = {
    /**
     * the index of texture, also seen as offset.
     */
    depthOrArrayLayerIndex: number,

    /**
     * 
     */
    rawData?: TypedArray1DFormat | ArrayBuffer
};

/**
 * @description Define the details for a texture handle, including the depth or array layer index and raw data.
 */
type Texture3DDetailHandle = {
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
    rawData: TypedArray1DFormat
};

/**
 * @description Define the details for a 3D texture handle, including the origin, block size, and raw data.
 *  e.g for vertex / index / unfiorm buffer.
 *  rewrite buffer
 */
type BufferHandle = () => {
    rewrite: boolean,
    detail: BufferHandleDetail
};

/**
 * e.g for storage buffer.
 */
type BufferArrayHandle = () => {
    rewrite: boolean,
    details: Array<BufferHandleDetail>
};

/**
 * @description
 *  NONE buffer update.
 */
const NoBufferArrayUpdateRequired = {
    rewrite: false,
    details: [],
};

/**
 * @description
 */
const NoBufferUpdateRequired = {
    rewrite: false,
    detail: {
        offset: 0,
        byteLength: 0,
        rawData: new Uint8Array(0),
    },
};

/**
 * @description Define a handle for 2D textures, including whether to rewrite and the texture details.
 */
type Texture2DHandle = () => {
    rewrite: boolean,
    detail: TextureDetailHandle
};

/**
 * @description Define a handle for texture arrays, including whether to rewrite and the array of texture details.
 *  e.g for texture 2d array.
 */
type TextureArrayHandle = () => {
    rewrite: boolean,
    details: Array<TextureDetailHandle>
};

/**
 * @description Define a handle for 3D textures, including whether to rewrite and the array of 3D texture details.
 */
type Texture3DHandle = () => {
    rewrite: boolean,
    details: Array<Texture3DDetailHandle>
};

export {
    type UniformHandle,
    type RenderHandle,
    type ComputeHandle,
    type BufferHandle,
    type BufferArrayHandle,
    type BufferHandleDetail,
    type TextureDetailHandle,
    type TextureArrayHandle,
    type Texture3DDetailHandle,
    type Texture3DHandle,
    type Texture2DHandle,
    NoBufferArrayUpdateRequired,
    NoBufferUpdateRequired,
}