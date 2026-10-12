# pipegpu

> pipegpu is a WebGPU API wrapper library designed to divide the rendering process into the following parts:

- Resources: This includes input vertex data, material information, texture maps, etc. Graphics rendering commands consume these resources as needed to complete rendering tasks. Most of these resources are processed on the CPU before being handed over to the GPU for consumption.

- Commands: This refers to the data consumption process, which receives data submitted by the CPU and processes it according to established goals (computation, shading), ultimately rendering it on the page.

> pipegpu rewraps native WebGPU objects such as Indirect Buffers, Index Buffers, Textures, etc. The purpose of this encapsulation is to help developers focus on 'data' within a 'data-driven' philosophy, eliminating the need to consider the extensive organization of the rendering process, such as pipeline layouts and bind group layouts. It retains flexibility by allowing for the original GPU object creation and free shader implementation.
> After collecting the input data and commands, pipegpu pre-compiles them into rendering nodes/computational nodes. During subsequent frame updates, if a node still needs to participate, it can simply execute a build to record the commands, which are then submitted to the GPU for execution. This process is more flexible than bundling, supporting CPU update requirements between frames and dynamically organizing the number of rendering/computational nodes based on data status.
> pipegpu serves as a foundational library for WebGPU, and on top of this, we offer a graph concept to construct rendering with a data-driven approach.

---

## unit test

> webgpu test dep chrome environment

```shell
npx playwright install
```

## modules

- [x] index

---

### compiler

- [x] Compiler
- [x] emitAttributes
- [x] emitComputePipeline
- [x] emitRenderPipeline
- [x] emitUniforms
- [x] parseAttribute
- [x] parseBindGroupLayout
- [x] parseColorAttachments
- [x] parseComputeBindGroupLayout
- [x] parseComputeDispatch
- [x] parseComputeProgrammableStage
- [x] parseContextDesc
- [x] parseFragmentState
- [x] parseMultisampleState
- [x] parsePipelineLayout
- [x] parsePrimitiveState
- [x] parseRenderBindGroupLayout
- [x] parseRenderDispatch
- [x] parseUniform

---

### holder

- [x] BaseHolder
- [x] ComputeHolder
- [x] RenderHolder

---

### property

- [x] Properties
- [x] BaseProperty

#### attribute

- [x] VertexBufferProperty

#### dispatch

- [x] ComputeProperty
- [x] RenderProperty

#### uniform

- [x] StorageBufferProperty
- [x] TextureProperty
- [x] TextureSamplerProperty
- [x] UniformBufferProperty

---

### res

- [x] Context
- [x] Format
- [x] Handle

#### res attachment

- [x] BaseAttachment
- [x] ColorAttachment
- [x] DepthStencilAttachment

#### res buffer

- [x] BaseBuffer
- [x] Buffer1D
- [x] Buffer2D
- [x] IndexedBuffer
- [x] IndexedIndirectBuffer
- [x] IndexedStorageBuffer
- [x] IndirectBuffer
- [x] Mapbuffer
- [x] StorageBuffer
- [x] UniformBuffer
- [x] VertexBuffer

#### res pipeline

- [x] BasePipeline
- [x] ComputePipeline
- [x] RenderPipeline

#### res sampler

- [x] BaseSampler
- [x] TextureSampler

#### res texture

- [x] BaseTexture
- [x] SurfaceTexture2D
- [x] Texture2D
- [x] Texture2DArray
- [x] TextureStorage2D

#### res shader

- [x] BaseShader
- [x] ComputeShader
- [x] FragmentShader
- [x] VertexShader

---

### state

- [x] AttachmentState
- [x] BufferState
- [x] PipelineState
- [x] SamplerState
- [x] ShaderState
- [x] TextureState

---

### util

- [x] align4Byte
- [x] getMaxMipmapLevel
- [x] hash32a
- [x] reflectShaderAttributes
- [x] reflectShaderUniforms
- [x] uniqueID
