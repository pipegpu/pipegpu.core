import { type IContextOpts, type ContextDesc, parseContextDesc } from "../compile/parseContextDesc.ts";
import { getMaxMipmapCount } from "../util/getMaxMipmapLevel.ts";
import type { FeatureNameFormat } from "./Format.ts";

/**
 * @description The WebGPU context class.
 * @class Context
 */
class Context {
    /**
     * @description The context description for the WebGPU context.
     */
    private contextDesc: ContextDesc;

    /**
     * @description The GPU canvas context.
     */
    private gpuContext: GPUCanvasContext | null | undefined;

    /**
     *  @description The GPU device.
     */
    private device: GPUDevice | null | undefined;

    /**
     * @description The GPU device.
     */
    private adapter: GPUAdapter | null | undefined;

    /**
     * @description The GPU adapter.
     */
    private queue: GPUQueue | null | undefined;

    /**
     * @description The supported GPU features.
     */
    private features: GPUSupportedFeatures | undefined;

    /**
     * @description The GPU queue.
     */
    private limits: GPUSupportedLimits | undefined;

    /**
     * @description The supported GPU limits.
     */
    private frameTargetTexture: GPUTexture | undefined;

    /**
     * @description The frame target GPU texture.
     */
    private frameTargetTextureView: GPUTextureView | undefined;

    /**
     * @description The frame target GPU texture view.
     */
    private commandEncoder: GPUCommandEncoder | undefined;

    /**
     * @description The command encoder for the current frame.
     * 
     */
    private supportedFeatures!: GPUSupportedFeatures;

    /**
     * @description The requested GPU features from the input options.
     */
    private requestFeatures?: FeatureNameFormat[];

    /**
     * @description The input options for creating the WebGPU context.
     * @param opts The input options for creating the WebGPU context.
     */
    constructor(opts: IContextOpts) {
        this.contextDesc = parseContextDesc(opts);
        this.gpuContext = this.contextDesc.canvas.getContext("webgpu");
        this.requestFeatures = opts.requestFeatures;
    }

    /**
     * @description need use 'await' for adapter request, e.g:
     * const adapter = await context.init();
     */
    async init() {
        this.adapter = await navigator.gpu.requestAdapter();
        if (!this.adapter) {
            throw new Error(`[E][Context][init] get adapter failed.`);
        }
        this.supportedFeatures = this.adapter!.features;
        // check features 
        (this.requestFeatures || []).forEach(featureName => {
            if (!this.supportedFeatures.has(featureName)) {
                throw new Error(`[E][Context][init] init context failed. unsupported feature: ${featureName}`);
            }
        });
        // issue 1
        // https://github.com/KIWI-ST/pipegpu/issues/1
        // https://www.w3.org/TR/webgpu/#limits
        this.device = await this.adapter?.requestDevice({
            requiredFeatures: this.requestFeatures || [] as any,
            requiredLimits: {
                'maxTextureArrayLayers': this.adapter?.limits.maxTextureArrayLayers,
                'maxBindGroups': this.adapter?.limits.maxBindGroups,
                'maxStorageBufferBindingSize': this.adapter?.limits.maxStorageBufferBindingSize,
                'maxBufferSize': this.adapter?.limits.maxBufferSize,
                'maxComputeWorkgroupSizeX': this.adapter?.limits.maxComputeWorkgroupSizeX,
                'maxComputeWorkgroupSizeY': this.adapter?.limits.maxComputeWorkgroupSizeY,
                'maxComputeWorkgroupSizeZ': this.adapter?.limits.maxComputeWorkgroupSizeZ,
                'maxComputeWorkgroupsPerDimension': this.adapter?.limits.maxComputeWorkgroupsPerDimension,
                'maxComputeInvocationsPerWorkgroup': this.adapter?.limits.maxComputeInvocationsPerWorkgroup,
                'maxStorageBuffersPerShaderStage': this.adapter?.limits.maxStorageBuffersPerShaderStage,
            }
        });
        this.gpuContext?.configure({
            device: this.device as GPUDevice,
            format: navigator.gpu.getPreferredCanvasFormat(),
            alphaMode: "premultiplied",
        });
        this.limits = this.adapter?.limits;
        this.features = this.adapter?.features;
        this.queue = this.device?.queue;
    }

    /**
     * @description The description of the GPU adapter.
     */
    get GPUDescription(): string {
        return this.adapter?.info.description || "unknown";
    }

    /**
     * @description The device pixel ratio of the context.
     */
    get DeviceRatio(): number {
        return this.contextDesc.devicePixelRatio;
    }

    /**
     * @description The supported GPU features.
     */
    getSupportedFeatures = () => {
        return this.features;
    }

    /**
     * @description Refresh the frame resources, including the frame target texture, its view, and the command encoder.
     */
    refreshFrameResource = (): void => {
        this.frameTargetTexture = this.gpuContext?.getCurrentTexture() as GPUTexture;
        this.frameTargetTextureView = this.frameTargetTexture.createView();
        this.commandEncoder = this.device?.createCommandEncoder() as GPUCommandEncoder;
    }

    /**
     * @description Submit the current frame's command buffers to the GPU queue.
     */
    submitFrameResource = (): void => {
        const desc: GPUCommandBufferDescriptor = {};
        const frameCommandBuffers: GPUCommandBuffer[] = [this.commandEncoder?.finish(desc) as GPUCommandBuffer];
        this.queue?.submit(frameCommandBuffers);
    }

    /**
     * @description Get the command encoder for the current frame.
     * @returns The GPUCommandEncoder for the current frame.
     */
    getCommandEncoder = (): GPUCommandEncoder => {
        return this.commandEncoder as GPUCommandEncoder;
    }

    /**
     * @description Get the frame target GPU texture view.
     * @returns The GPUTextureView for the current frame.
     */
    getFrameTexture = (): GPUTexture => {
        return this.frameTargetTexture as GPUTexture;
    }

    /**
     * @description Get the frame target GPU texture.
     * @returns The GPUTexture for the current frame.
     */
    getFrameTextureView = (): GPUTextureView => {
        return this.frameTargetTextureView as GPUTextureView;
    }

    /**
     * @description Get the viewport width of the context.
     */
    getViewportWidth = (): number => {
        return this.contextDesc.viewportWidth;
    }

    /**
     * @description Get the viewport height of the context.
     */
    getViewportHeight = (): number => {
        return this.contextDesc.viewportHeight;
    }

    /**
     * @description Get the maximum 2D mipmap count based on the viewport size.
     */
    getMax2DMipmapCount = (): number => {
        return getMaxMipmapCount(this.getViewportWidth(), this.getViewportHeight());
    }

    /**
     * @description Get the GPU device.
     * @returns The GPUDevice instance.
     */
    getGpuDevice = (): GPUDevice => {
        return this.device as GPUDevice;
    }

    /**
     * @description Get the GPU queue.
     * @returns The GPUQueue instance.
     */
    getGpuQueue = (): GPUQueue => {
        return this.queue as GPUQueue;
    }

    /**
     * @description Get the supported GPU limits.
     * @returns The GPUSupportedLimits instance.
     */
    getLimits = (): GPUSupportedLimits => {
        return this.limits as GPUSupportedLimits;
    }

    /**
     * @description Get the preferred texture format for the canvas.
     * @returns The GPUTextureFormat for the canvas.
     */
    getPreferredTextureFormat = (): GPUTextureFormat => {
        return navigator.gpu.getPreferredCanvasFormat();
    }

    /**
     * @description Get the preferred depth texture format.
     * @returns The GPUTextureFormat for depth textures.
     */
    getPreferredDepthTexuteFormat = (): GPUTextureFormat => {
        return 'depth24plus';
    }

}

export {
    type IContextOpts,
    Context
}