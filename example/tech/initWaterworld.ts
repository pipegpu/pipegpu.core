import { Attributes, ColorAttachment, DepthStencilAttachment, RenderHolder, RenderProperty, Uniforms, type BaseHolder, type BufferHandleDetail, type Compiler, type RenderHolderDesc } from "../../src";


const initWaterworld = async (compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<BaseHolder> => {

    let dispatch: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }


    let desc: RenderHolderDesc = {
        label: '[DEMO][render]',
        vertexShader: compiler.createVertexShader({
            code: `

struct VertexOutput
{
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@location(0) in_position: vec2<f32>, @location(1) in_uv: vec2<f32>) -> VertexOutput {
    var out: VertexOutput;
    out.position = vec4<f32>(in_position, 0.0, 1.0);
    out.uv = in_uv;
    return out;
}

    `,
            entryPoint: "vs_main"
        }),
        fragmentShader: compiler.createFragmentShader({
            code: `
struct VertexOutput
{
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@group(0) @binding(0) var texture0: texture_2d<f32>;
@group(0) @binding(1) var textureSampler0: sampler;
@group(0) @binding(2) var texture1: texture_2d<f32>;
@group(0) @binding(3) var textureSampler1: sampler;
@group(0) @binding(4) var texture2: texture_2d<f32>;
@group(0) @binding(5) var textureSampler2: sampler;
@group(0) @binding(6) var<uniform>  iTime: f32;  

const coast2water_fadedepth = 0.10f;
const large_waveheight      = 0.50f;
const large_wavesize        = 4.0f;
const small_waveheight      = 0.6f;
const small_wavesize        = 0.5f;
const water_softlight_fact  = 15.0f;
const water_glossylight_fact= 120.0f;
const particle_amount       = 70.0f;
const watercolor            = vec3f(0.43f, 0.60f, 0.66f);
const watercolor2           = vec3f(0.06f, 0.07f, 0.11f);
const water_specularcolor   = vec3f(1.3f, 1.3f, 0.9f);
const USETEXTUREHEIGHT = 0;

fn hash(n: f32) -> f32 {
    return fract(sin(n)*43758.5453123);
}

fn noise1(x: vec2f) -> f32 {
    let p = floor(x);
    let f = smoothstep(vec2f(0.0f), vec2f(1.0f), fract(x));
    let n = p.x + p.y * 57.0f;
    return mix(
        mix(hash(n + 0.0f), hash(n + 1.0f), f.x),
        mix(hash(n + 57.0f), hash(n + 58.0f), f.x),
        f.y
    );
}

fn noise(p: vec2f) -> f32 {
    let uv = p * (1.0f / 256.0f);
    return textureSampleLevel(texture0, textureSampler0, uv, 0.0f).x;
}

fn height_map(p: vec2f) -> f32 {
    var f = 0.0f;
    if (USETEXTUREHEIGHT == 1) {
        let uv = p * 0.6f;
        f = 0.15f + textureSampleLevel(texture2, textureSampler2, uv, 0.0f).r * 2.0f;
    } else {
        let m = mat2x2f(
            0.9563f * 1.4f, -0.2924f * 1.4f,
            0.2924f * 1.4f,  0.9563f * 1.4f
        );
        var pTemp = p * 6.0f;
        f = 0.6000f * noise1(pTemp); pTemp = m * pTemp * 1.1f;
        f += 0.2500f * noise1(pTemp); pTemp = m * pTemp * 1.32f;
        f += 0.1666f * noise1(pTemp); pTemp = m * pTemp * 1.11f;
        f += 0.0834f * noise(pTemp); pTemp = m * pTemp * 1.12f;
        f += 0.0634f * noise(pTemp); pTemp = m * pTemp * 1.13f;
        f += 0.0444f * noise(pTemp); pTemp = m * pTemp * 1.14f;
        f += 0.0274f * noise(pTemp); pTemp = m * pTemp * 1.15f;
        f += 0.0134f * noise(pTemp); pTemp = m * pTemp * 1.16f;
        f += 0.0104f * noise(pTemp); pTemp = m * pTemp * 1.17f;
        f += 0.0084f * noise(pTemp);
        
        const FLAT_LEVEL = 0.525f;
        if (f < FLAT_LEVEL) {
            f = f;
        } else {
            f = pow((f - FLAT_LEVEL) / (1.0f - FLAT_LEVEL), 2.0f) * (1.0f - FLAT_LEVEL) * 2.0f + FLAT_LEVEL;
        }
    }
    return clamp(f, 0.0f, 10.0f);
}

// 修复：使用textureSampleLevel并确保在一致控制流中调用
fn terrain_map(p: vec2f) -> vec3f {
    let uv = p * 2.0f;
    // 使用textureSampleLevel并指定LOD级别0
    let terrainTexColor = textureSampleLevel(texture1, textureSampler1, uv, 0.0f).rgb;
    return vec3f(0.7f, 0.55f, 0.4f) + terrainTexColor * 0.5f;
}

fn water_map(p: vec2f, height: f32) -> f32 {
    const m = mat2x2f(0.72f, -1.60f, 1.60f, 0.72f);
    let p2 = p * large_wavesize;
    let shift1 = 0.001f * vec2f(iTime * 160.0f * 2.0f, iTime * 120.0f * 2.0f);
    let shift2 = 0.001f * vec2f(iTime * 190.0f * 2.0f, -iTime * 130.0f * 2.0f);

    var f = 0.6000f * noise(p);
    f += 0.2500f * noise(p * m);
    f += 0.1666f * noise(p * m * m);
    let wave = sin(p2.x * 0.622f + p2.y * 0.622f + shift2.x * 4.269f) * large_waveheight * f * height * height;

    var pTemp = p * small_wavesize;
    var fSmall = 0.0f;
    var amp = 1.0f;
    var s = 0.5f;
    for (var i = 0; i < 9; i++) {
        pTemp = m * pTemp * 0.947f;
        fSmall -= amp * abs(sin((noise(pTemp + shift1 * s) - 0.5f) * 2.0f));
        amp *= 0.59f;
        s *= -1.329f;
    }

    return wave + fSmall * small_waveheight;
}

fn nautic(p: vec2f) -> f32 {
    const m = mat2x2f(0.72f, -1.60f, 1.60f, 0.72f);
    var pTemp = p * 18.0f;
    var f = 0.0f;
    var amp = 1.0f;
    var s = 0.5f;
    for (var i = 0; i < 3; i++) {
        pTemp = m * pTemp * 1.2f;
        f += amp * abs(smoothstep(0.0f, 1.0f, noise(pTemp + iTime * s)) - 0.5f);
        amp *= 0.5f;
        s *= -1.227f;
    }
    return pow(1.0f - f, 5.0f);
}

fn particles(p: vec2f) -> f32 {
    const m = mat2x2f(0.72f, -1.60f, 1.60f, 0.72f);
    var pTemp = p * 200.0f;
    var f = 0.0f;
    var amp = 1.0f;
    var s = 1.5f;
    for (var i = 0; i < 3; i++) {
        pTemp = m * pTemp * 1.2f;
        f += amp * noise(pTemp + iTime * s);
        amp *= 0.5f;
        s *= -1.227f;
    }
    return pow(f * 0.35f, 7.0f) * particle_amount;
}

fn test_shadow(xy: vec2f, height: f32, light: vec3f) -> f32 {
    let r0 = vec3f(xy, height);
    let rd = normalize(light - r0);
    
    var hit = 1.0f;
    var t = 0.001f;
    for (var j = 1; j < 25; j++) {
        let p = r0 + t * rd;
        let h = height_map(p.xy);
        let height_diff = p.z - h;
        if (height_diff < 0.0f) {
            return 0.0f;
        }
        t += 0.01f + height_diff * 0.02f;
        hit = min(hit, 2.0f * height_diff / t);
    }
    return hit;
}

fn CalcTerrain(uv: vec2f, height: f32, light: vec3f) -> vec3f {
    let col = terrain_map(uv);
    let h1 = height_map(uv - vec2f(0.0f, 0.01f));
    let h2 = height_map(uv + vec2f(0.0f, 0.01f));
    let h3 = height_map(uv - vec2f(0.01f, 0.0f));
    let h4 = height_map(uv + vec2f(0.01f, 0.0f));
    let norm = normalize(vec3f(h3 - h4, h1 - h2, 1.0f));
    let r0 = vec3f(uv, height);
    let rd = normalize(light - r0);
    let grad = dot(norm, rd);
    var colFinal = col * (grad + pow(grad, 8.0f));
    let terrainshade = test_shadow(uv, height, light);
    colFinal = mix(colFinal * 0.25f, colFinal, terrainshade);
    return colFinal;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4f {
    var light = vec3f(0.0f, sin(iTime * 0.5f) * 0.5f + 0.35f, 2.8f);
    light = vec3f(-0.0f, sin(iTime*0.5f)*0.5f + 0.35f, 2.8f);
    
    let uv = in.uv - vec2f(-0.12f, 0.25f);

    var WATER_LEVEL = 0.94f;
    // WATER_LEVEL = 0.3f; 
    var deepwater_fadedepth = 0.5f + coast2water_fadedepth;
    
    let height = height_map(uv);
    var col = vec3f(0.0f);
    
    let waveheight = clamp(WATER_LEVEL*3.0f-1.5f, 0.0f, 1.0f);
    let level = WATER_LEVEL + 0.2f*water_map(uv*15.0f + vec2f(iTime*0.1f), waveheight);
    
    // 修复：预计算所有可能的地形颜色（一致控制流）
    let terrainCol_normal = CalcTerrain(uv, height, light);
    
    // 预计算水下UV和对应的地形颜色
    const m = mat2x2f(0.72f, -1.60f, 1.60f, 0.72f);
    let dif = vec2f(0.0f, 0.01f);
    let pos = uv*15.0f + vec2f(iTime*0.01f);
    let h1 = water_map(pos-dif, waveheight);
    let h2 = water_map(pos+dif, waveheight);
    let h3 = water_map(pos-dif.yx, waveheight);
    let h4 = water_map(pos+dif.yx, waveheight);
    let normwater = normalize(vec3f(h3-h4, h1-h2, 0.125f));
    
    let uvWater_actual = uv + normwater.xy * 0.002f * (level - height);
    let terrainCol_underwater = CalcTerrain(uvWater_actual, height, light);
    
    if (height > level) {
        col = terrainCol_normal;
    } else {
        let terrainCol = terrainCol_underwater;
        
        let coastfade = clamp((level - height) / coast2water_fadedepth, 0.0f, 1.0f);
        let coastfade2 = clamp((level - height) / deepwater_fadedepth, 0.0f, 1.0f);
        let intensity = terrainCol.r * 0.2126f + terrainCol.g * 0.7152f + terrainCol.b * 0.0722f;
        var waterColorFinal = mix(watercolor * intensity, watercolor2, smoothstep(0.0f, 1.0f, coastfade2));
        
        let r0 = vec3f(uvWater_actual, WATER_LEVEL);
        let rd = normalize(light - r0);
        let grad = dot(normwater, rd);
        let specular = pow(grad, water_softlight_fact);
        let specular2 = pow(grad, water_glossylight_fact);
        let gradpos = dot(vec3f(0.0f, 0.0f, 1.0f), rd);
        let specular1 = smoothstep(0.0f, 1.0f, pow(gradpos, 5.0f));
        let watershade = test_shadow(uvWater_actual, level, light);

        waterColorFinal *= 2.2f + watershade;
        waterColorFinal += (0.2f + 0.8f * watershade) * ((grad - 1.0f) * 0.5f + specular) * 0.25f;
        waterColorFinal /= (1.0f + specular1 * 1.25f);
        waterColorFinal += watershade * specular2 * water_specularcolor;
        waterColorFinal += watershade * coastfade * (1.0f - coastfade2) * (vec3f(0.5f, 0.6f, 0.7f) * nautic(uvWater_actual) + vec3f(1.0f) * particles(uvWater_actual));
        
        col = mix(terrainCol, waterColorFinal, coastfade);
    }

    return vec4f(col, 1.0f);
}

    `,
            entryPoint: "fs_main"
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: colorAttachments,
        depthStencilAttachment: depthStencilAttachment,
        dispatch: dispatch,
    };

    // position
    {
        const positionData = new Float32Array([
            -1.0, 1.0,
            -1.0, -1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        const vertexBuffer = compiler.createVertexBuffer({
            totalByteLength: positionData.byteLength,
            rawData: positionData,
        });
        desc.attributes?.assign("in_position", vertexBuffer);
    }

    // uv
    {
        const uvData = new Float32Array([
            0.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0
        ]);
        const uvBuffer = compiler.createVertexBuffer({
            totalByteLength: uvData.byteLength,
            rawData: uvData,
        });
        desc.attributes?.assign('in_uv', uvBuffer);
    }

    // sampler
    {
        const textureSampler = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('textureSampler', textureSampler);
    }


    // ichannel0 sampler
    {
        const textureSampler0 = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('textureSampler0', textureSampler0);
    }

    // texture2d (.ktx support)
    {
        const response = await fetch('./asset/img/iChannel0.png');
        const imageBitmap = await createImageBitmap(await response.blob());
        let widthBit: number = 0;
        let heightBit: number = 0;
        // 核心转换：ImageBitmap → Uint8Array
        function imageBitmapToUint8Array(bitmap: ImageBitmap): Uint8Array {
            // 1. 创建与图片尺寸一致的 Canvas
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            widthBit = bitmap.width;
            heightBit = bitmap.height;
            // 2. 获取 2D 上下文并绘制 ImageBitmap
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
            ctx.drawImage(bitmap, 0, 0); // 绘制位图到画布

            // 3. 提取像素数据（RGBA 格式，Uint8ClampedArray 类型）
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 4. 转换为 Uint8Array（共享内存缓冲区，无性能损耗）
            return new Uint8Array(imageData.data.buffer);
        }

        // 执行转换
        const pixelUint8Array = imageBitmapToUint8Array(imageBitmap);

        // 释放资源（避免内存泄漏）
        imageBitmap.close();
        const texture0 = compiler.createTexture2D(
            {
                width: widthBit,
                height: heightBit,
                textureData: pixelUint8Array,
                textureFormat: 'bc7-rgba-unorm',
                mipmapCount: 1
            }
        );
        desc.uniforms?.assign('texture0', texture0);
    }

    // ichannel1
    {

        const response = await fetch('./asset/img/iChannel1.jpg');
        const imageBitmap = await createImageBitmap(await response.blob());
        let widthBit: number = 0;
        let heightBit: number = 0;
        // 核心转换：ImageBitmap → Uint8Array
        function imageBitmapToUint8Array(bitmap: ImageBitmap): Uint8Array {
            // 1. 创建与图片尺寸一致的 Canvas
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            widthBit = bitmap.width;
            heightBit = bitmap.height;
            // 2. 获取 2D 上下文并绘制 ImageBitmap
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
            ctx.drawImage(bitmap, 0, 0); // 绘制位图到画布

            // 3. 提取像素数据（RGBA 格式，Uint8ClampedArray 类型）
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 4. 转换为 Uint8Array（共享内存缓冲区，无性能损耗）
            return new Uint8Array(imageData.data.buffer);
        }

        // 执行转换
        const pixelUint8Array = imageBitmapToUint8Array(imageBitmap);

        // 释放资源（避免内存泄漏）
        imageBitmap.close();


        const textureSampler1 = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('textureSampler1', textureSampler1);

        const texture1 = compiler.createTexture2D(
            {
                width: widthBit,
                height: heightBit,
                textureData: pixelUint8Array,
                textureFormat: 'bc7-rgba-unorm',
                mipmapCount: 1
            }
        );
        desc.uniforms?.assign('texture1', texture1);
    }




    // ichannel2
    {
        const textureSampler2 = compiler.createTextureSampler({
            minFilter: 'linear',
            magFilter: 'linear',
            addressModeU: 'repeat',
            addressModeV: 'repeat',
            mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('textureSampler2', textureSampler2);
    }

    // texture2d (.ktx support)
    {

        const response = await fetch('./asset/img/iChannel2.jpg');
        const imageBitmap = await createImageBitmap(await response.blob());
        let widthBit: number = 0;
        let heightBit: number = 0;
        // 核心转换：ImageBitmap → Uint8Array
        function imageBitmapToUint8Array(bitmap: ImageBitmap): Uint8Array {
            // 1. 创建与图片尺寸一致的 Canvas
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            widthBit = bitmap.width;
            heightBit = bitmap.height;
            // 2. 获取 2D 上下文并绘制 ImageBitmap
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('无法获取 Canvas 2D 上下文');
            ctx.drawImage(bitmap, 0, 0); // 绘制位图到画布

            // 3. 提取像素数据（RGBA 格式，Uint8ClampedArray 类型）
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 4. 转换为 Uint8Array（共享内存缓冲区，无性能损耗）
            return new Uint8Array(imageData.data.buffer);
        }

        // 执行转换
        const pixelUint8Array = imageBitmapToUint8Array(imageBitmap);

        // 释放资源（避免内存泄漏）
        imageBitmap.close();


        const texture2 = compiler.createTexture2D(
            {
                width: widthBit,
                height: heightBit,
                textureData: pixelUint8Array,
                textureFormat: 'bc7-rgba-unorm',
                mipmapCount: 1
            }
        );
        desc.uniforms?.assign('texture2', texture2);
    }



    {

        desc.uniforms?.assign('iTime', compiler.createUniformBuffer({
            totalByteLength: 4,
            handler: () => {
                let now = performance.now() / 1000;
                const detail: BufferHandleDetail = {
                    offset: 0,
                    byteLength: 4,
                    rawData: new Float32Array([now])
                };
                return {
                    rewrite: true,
                    detail: detail
                }
            }
        }));
    }




    const holder: RenderHolder | undefined = compiler.compileRenderHolder(desc);
    return holder;
}

export {
    initWaterworld
}