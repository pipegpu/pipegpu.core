import type { BufferState } from "../state/BufferState";
import type { TextureState } from "../state/TextureState";
import type { FrameStageFormat, TypedArray1DFormat } from "./Format";

/**
 * 
 */
type UniformHandle = (frameStage: FrameStageFormat, encoder: GPUCommandEncoder, bufferState: BufferState, textureState: TextureState) => void;

/**
 * 
 */
type RenderHandle = (encoder: GPURenderPassEncoder) => void;

/**
 * 
 */
type ComputeHandle = (encoder: GPUComputePassEncoder) => void;

/**
 * 
 * hook handle
 * share gpu command encoder,
 * used as buffer copy etc.
 * 
 */
type HookHandle = { (encoder: GPUCommandEncoder): void };

/**
 * 
 */
type BufferHandleDetail = {
    /**
     * 
     * gpu buffer byte offset
     * 
     */
    offset: number,

    /**
     * 
     * cpu write buffer total byte length.
     * 
     */
    byteLength: number,

    /**
     * 
     * cpu write source data.
     * 
     */
    rawData: TypedArray1DFormat | ArrayBuffer
};

/**
 * @description
 */
type TextureDetailHandle = {
    /**
     * the index of texture, also seen as offset.
     */
    depthOrArrayLayerIndex: number,

    /**
     * 
     */
    rawData: TypedArray1DFormat | ArrayBuffer
};

/**
 * @description
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
 * @description
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
 * @description
 *  e.g for texture 2d array.
 */
type TextureArrayHandle = () => {
    rewrite: boolean,
    details: Array<TextureDetailHandle>
};

/**
 * @description
 */
type Texture3DHandle = () => {
    rewrite: boolean,
    details: Array<Texture3DDetailHandle>
};

export {
    type UniformHandle,
    type RenderHandle,
    type ComputeHandle,
    type HookHandle,
    type BufferHandle,
    type BufferArrayHandle,
    type BufferHandleDetail,
    type TextureDetailHandle,
    type TextureArrayHandle,
    type Texture3DDetailHandle,
    type Texture3DHandle,
    NoBufferArrayUpdateRequired,
    NoBufferUpdateRequired,
}