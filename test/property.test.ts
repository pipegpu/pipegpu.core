import { assert, beforeAll, expect, test } from 'vitest'
import { Attributes, Compiler, Context, IndexedBuffer, IndexedIndirectBuffer, IndexedStorageBuffer, IndirectBuffer, RenderProperty, StorageBuffer, Uniforms } from '../index'
import { VertexBufferProperty } from '../src/property/attribute/VertexBufferProperty';
import { StorageBufferProperty } from '../src/property/uniform/StorageBufferProperty';
import { TextureProperty } from '../src/property/uniform/TextureProperty';
import { TextureSamplerProperty } from '../src/property/uniform/TextureSamplerProperty';
import { UniformBufferProperty } from '../src/property/uniform/UniformBufferProperty';

const width: number = 400, height: number = 400;
let context: Context;
let compiler: Compiler;

beforeAll(async () => {
    context = new Context({
        selector: "canvas",
        width: width,
        height: height,
        devicePixelRatio: window.devicePixelRatio,
        requestFeatures: []
    });
    await context.init()
    compiler = new Compiler(context);
});

test('property: attribute.', async () => {
    const propertyName = 'attributeName';
    const vertexBuffer = compiler.createVertexBuffer({
        totalByteLength: 12 * 4,
        rawData: new Float32Array([-0.15, -0.5, 0.5, -0.5, 0.0, 0.5, -0.55, -0.5, -0.05, 0.5, -0.55, 0.5])
    });
    const vertexBufferPrperty = new VertexBufferProperty(propertyName, vertexBuffer);
    assert(vertexBufferPrperty.getPropertyName() === propertyName, `vertex property name: ${propertyName}`);
    assert(vertexBufferPrperty.getPropertyFormat() === `vertexBuffer`, `vertex property name: ${propertyName}`);

    const attributs = new Attributes();
    attributs.assign(propertyName, vertexBuffer);
    expect(attributs.isEmpty()).toBe(false);
    assert(attributs.getPropertyMap().size > 0, `attributes property map valid.`);
});

test('property: uniform.', async () => {
    const storageBuffer = compiler.createStorageBuffer({
        totalByteLength: 4,
        rawDataArray: [new Float32Array([1.0])]
    });

    const propertyName = 'uniformName';

    // storage buffer property.
    const storageBufferProperty = new StorageBufferProperty(propertyName, storageBuffer);
    assert(storageBufferProperty.getPropertyName() === propertyName, `storage buffer property name valid.`);
    assert(storageBufferProperty.getPropertyFormat() === `storageBuffer`, `storage buffer property format valid.`);

    // texture property.
    const texture2D = compiler.createTexture2D({ width: 100, height: 100 });
    const textureProperty = new TextureProperty(propertyName, texture2D)
    assert(textureProperty.getPropertyName() === propertyName, `texture property name vaild.`);
    assert(textureProperty.getPropertyFormat() === texture2D.getPropertyFormat(), `texture property fromat vaild.`);

    // texture sampler property.
    const textureSampler = compiler.createTextureSampler({});
    const textureSamplerProperty: TextureSamplerProperty = new TextureSamplerProperty(propertyName, textureSampler);
    assert(textureSamplerProperty.getPropertyName() === propertyName, `texture sampler property name vaild.`);
    assert(textureSamplerProperty.getPropertyFormat() === `textureSampler`, `texture sampler property format vaild.`);

    // unifomr buffer property.
    const uniformBuffer = compiler.createUniformBuffer({ totalByteLength: 4, rawData: new Float32Array([1.0]) });
    const uniformBufferProperty: UniformBufferProperty = new UniformBufferProperty(propertyName, uniformBuffer);
    assert(uniformBufferProperty.getPropertyName() === propertyName, `uniform buffer property name vaild.`);
    assert(uniformBufferProperty.getPropertyFormat() === `uniformBuffer`, `uniform buffer property format vaild.`);

    // 
    const uniforms = new Uniforms();
    expect(uniforms.isEmpty()).toBeTruthy();
    uniforms.assign(propertyName, uniformBuffer);
    expect(uniforms.isEmpty()).toBeFalsy();
    assert(uniforms.getPropertyMap().size > 0, `uniforms property map vaild.`);
});

test('property: dispatch render property.', async () => {

    const indexedBuffer: IndexedBuffer = new IndexedBuffer({
        id: 1,
        label: "",
        context: context,
        totalByteLength: 4 * 3,
        typedArrayData1D: new Uint32Array([1, 2, 3]),
    });

    const indexedStorageBuffer: IndexedStorageBuffer = new IndexedStorageBuffer({
        id: 2,
        label: "",
        context: context,
        totalByteLength: 4 * 3,
        rawDataArray: [new Uint32Array([1, 2, 3])]
    });

    const indirectBuffer: IndirectBuffer = new IndirectBuffer({
        id: 3,
        label: "",
        context: context,
        totalByteLength: 16,
    });

    const indexedIndirectBuffer: IndexedIndirectBuffer = new IndexedIndirectBuffer({
        id: 4,
        label: "",
        context: context,
        totalByteLength: 20,
    });

    const indirectDrawCountBuffer: StorageBuffer = new StorageBuffer({
        id: 5,
        label: "",
        context: context,
        totalByteLength: 4,
        bufferUsageFlags: GPUBufferUsage.INDIRECT,
    });

    const renderProperty1: RenderProperty = new RenderProperty(1);
    const renderProperty2: RenderProperty = new RenderProperty(1, 1);
    const renderProperty3: RenderProperty = new RenderProperty(indexedBuffer);
    const renderProperty4: RenderProperty = new RenderProperty(indexedBuffer, 1);
    const renderProperty5: RenderProperty = new RenderProperty(indexedStorageBuffer, 1);
    const renderProperty6: RenderProperty = new RenderProperty(indexedStorageBuffer, indexedIndirectBuffer);
    const renderProperty7: RenderProperty = new RenderProperty(indexedStorageBuffer, indexedIndirectBuffer, indirectDrawCountBuffer, 1);
    const renderProperty8: RenderProperty = new RenderProperty(indexedStorageBuffer, indexedIndirectBuffer, indirectDrawCountBuffer, () => 1);
    const renderProperty9: RenderProperty = new RenderProperty(indirectBuffer);
    const renderProperty10: RenderProperty = new RenderProperty(indirectBuffer, indirectDrawCountBuffer, 1);
    const renderProperty11: RenderProperty = new RenderProperty(indirectBuffer, indirectDrawCountBuffer, () => 1);

    assert(renderProperty1.getPropertyFormat() === 'drawCount', `drawcount render property.`);
    assert(renderProperty2.getPropertyFormat() === 'drawCount', `drawcount render property.`);
    assert(renderProperty3.getPropertyFormat() === 'drawIndexed', `drawIndexed render property.`);
    assert(renderProperty4.getPropertyFormat() === 'drawIndexed', `drawIndexed render property.`);
    assert(renderProperty5.getPropertyFormat() === 'drawIndexedStorage', `drawIndexedStorage render property.`);
    assert(renderProperty6.getPropertyFormat() === 'drawIndexedIndirect', `drawIndexedIndirect render property.`);
    assert(renderProperty7.getPropertyFormat() === 'multiDrawIndexedIndirect', `multiDrawIndexedIndirect render property.`);
    assert(renderProperty8.getPropertyFormat() === 'multiDrawIndexedIndirect', `multiDrawIndexedIndirect render property.`);
    assert(renderProperty9.getPropertyFormat() === 'drawIndirect', `drawIndirect render property.`);
    assert(renderProperty10.getPropertyFormat() === 'multiDrawIndirect', `multiDrawIndirect render property.`);
    assert(renderProperty11.getPropertyFormat() === 'multiDrawIndirect', `multiDrawIndirect render property.`);
});
