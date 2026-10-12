import { FunctionInfo, InputInfo, TypeInfo, WgslReflect } from "wgsl_reflect";

/**
 * @description
 */
interface IReflectAttributes {
    attributeCount: number,
    attributeMap: Map<string, GPUVertexAttribute>,
    attributeOdered: Array<GPUVertexAttribute>,
    locationMap: Map<number, string>
}

/**
 * @description
 * @param {TypeInfo} t input type with reflect form wgsl shahder code.
 * @returns {string} webgpu attribute format type. e.g 'float32x4'
 */
const getVertexFormat = (t: TypeInfo): GPUVertexFormat => {
    switch (t.getTypeName()) {
        // uint32
        case 'u32':
            return "uint32";
        case 'vec2u':
        case 'vec2<u32>':
            return 'uint32x2';
        case 'vec3u':
        case 'vec3<u32>':
            return 'uint32x3';
        case 'vec4u':
        case 'vec4<u32>':
            return 'uint32x4';
        // int32
        case 'i32':
            return 'sint32';
        case 'vec2i':
        case 'vec2<i32>':
            return 'sint32x2';
        case 'vec3i':
        case 'vec3<i32>':
            return 'sint32x3';
        case 'vec4i':
        case 'vec4<i32>':
            return 'sint32x4';
        // float32
        case 'f32':
            return 'float32';
        case 'vec2f':
        case 'vec2<f32>':
            return 'float32x2';
        case 'vec3f':
        case 'vec3<f32>':
            return 'float32x3';
        case 'vec4f':
        case 'vec4<f32>':
            return 'float32x4';
        default: {
            throw new Error(`[E][reflectShaderAttributes][getVertexFormat] unsupported vertex format. type: ${t.getTypeName()}`);
        }

    }
}

/**
 * @description
 * @param code 
 * @param entryPoint 
 * @param debugLabel 
 * @returns 
 */
const reflectShaderAttributes = (code: string, entryPoint: string, debugLabel?: string): IReflectAttributes => {
    const reflect = new WgslReflect(code);

    let rawEntry: FunctionInfo | undefined = undefined;
    reflect.entry.vertex.forEach(e => {
        if (e.name === entryPoint) {
            rawEntry = e;
        }
    });

    if (!rawEntry) {
        throw new Error(`[E][reflectShaderAttributes] ${debugLabel} entry point "${entryPoint}" not found in the shader code.`);
    }

    let entry: FunctionInfo = rawEntry as FunctionInfo;
    let locationMap: Map<number, string> = new Map();
    let attributeMap: Map<string, GPUVertexAttribute> = new Map();
    let attributeOdered: Array<GPUVertexAttribute> = [];
    let attributeCount: number = entry.inputs.length;

    for (let k = 0; k < attributeCount; k++) {
        let variable: InputInfo = entry.inputs[k];
        let vertexFormat: GPUVertexFormat = getVertexFormat(variable.type as TypeInfo);
        let attr: GPUVertexAttribute = {
            format: vertexFormat,
            offset: 0,
            shaderLocation: variable.location as number
        };
        attributeMap.set(variable.name, attr);
        locationMap.set(attr.shaderLocation, variable.name);
        attributeOdered.push(attr);
    }

    // ensure attribute stored as acending
    attributeOdered.sort((a: GPUVertexAttribute, b: GPUVertexAttribute) => {
        return a.shaderLocation - b.shaderLocation;
    });

    let reflectAttributes: IReflectAttributes = {
        attributeCount: attributeCount,
        attributeMap: attributeMap,
        attributeOdered: attributeOdered,
        locationMap: locationMap
    };

    return reflectAttributes;
}

export {
    type IReflectAttributes,
    reflectShaderAttributes
}
