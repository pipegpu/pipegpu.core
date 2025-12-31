import { type Context, Attributes, ColorAttachment, DepthStencilAttachment, RenderHolder, RenderProperty, Texture2D, Uniforms, type BaseHolder, type BufferHandleDetail, type Compiler, type RenderHolderDesc } from "../../src";

const initRadialBlur = async (context: Context, compiler: Compiler, colorAttachments: ColorAttachment[], depthStencilAttachment: DepthStencilAttachment): Promise<BaseHolder[]> => {
    const holders: BaseHolder[] = [];
    let positionTexture: Texture2D;
    const W = context.getViewportWidth(), H = context.getViewportHeight();
    let dispatch: RenderProperty;
    {
        const indexData = new Uint32Array([0, 1, 2, 0, 2, 3]);
        const indexBuffer = compiler.createIndexBuffer({
            rawData: indexData
        });
        dispatch = new RenderProperty(indexBuffer);
    }

    positionTexture = compiler.createTexture2D({
        width: W,
        height: H,
        appendixTextureUsages: GPUTextureUsage.RENDER_ATTACHMENT,
        textureFormat: 'rgba16float',
        mipmapCount: 1,
    });
    const positionColorAttachment = compiler.createColorAttachment({
        texture: positionTexture,
        blendFormat: 'opaque',
        colorLoadStoreFormat: 'clearStore',
    });


    //https://www.shadertoy.com/view/XsKGRW
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
@group(0) @binding(2) var<uniform>  iTime: f32;  
// The scene itself. Not much commenting, since this is mainly about the radial blur,
// plus a lot of it is rudimentary.
// 定义常量
const FAR: f32 = 20.0;


// Hash函数
fn hash(n: f32) -> f32 {
    return fract(cos(n) * 45758.5453);
}

// 三平面混合纹理采样
fn tpl(t: texture_2d<f32>, s: sampler, p: vec3<f32>, n: vec3<f32>) -> vec3<f32> {
    var normal = max(abs(n), vec3<f32>(0.001));
    normal = normal / (normal.x + normal.y + normal.z);
    
    // let tex1 = textureSample(t, s, p.yz).xyz;
    // let tex2 = textureSample(t, s, p.zx).xyz;
    // let tex3 = textureSample(t, s, p.xy).xyz;

      
    let tex1 = textureSampleLevel(t, s, p.yz, 0.0).xyz;
    let tex2 = textureSampleLevel(t, s, p.zx, 0.0).xyz;
    let tex3 = textureSampleLevel(t, s, p.xy, 0.0).xyz;
    
    let result = tex1 * normal.x + tex2 * normal.y + tex3 * normal.z;
    return result * result;
}

// 距离函数
fn map(p: vec3<f32>) -> f32 {
    // 表面小凹凸
    let bump = dot(sin(p * 24.0 - cos(p.yzx * 36.0)), vec3<f32>(0.015));
    
    // 表面扰动
    let perturbed_p = p + sin(p * 8.0 + 3.14159) * 0.1;
    
    // 主要表面结构
    let n = dot(sin(perturbed_p * 2.0), cos(perturbed_p.yzx * 2.0));
    
    // 限制表面值并添加凹凸
    return (min(n, 0.0) + 1.1) / 1.1 + bump;
}

// 环境光遮蔽
fn cao(p: vec3<f32>, n: vec3<f32>, maxDist: f32) -> f32 {
    var ao: f32 = 0.0;
    var l: f32;
    let nbIte: f32 = 6.0;
    let falloff: f32 = 1.5;
    
    for (var i: f32 = 1.0; i < nbIte + 0.5; i = i + 1.0) {
        l = (i + hash(i)) * 0.5 / nbIte * maxDist;
        ao = ao + (l - map(p + n * l)) / pow(1.0 + l, falloff);
    }
    
    return clamp(1.0 - ao / nbIte, 0.0, 1.0);
}

// 法线计算
fn nr(p: vec3<f32>) -> vec3<f32> {
    let e: vec2<f32> = vec2<f32>(-0.001, 0.001);
    
    let n1 = map(p + e.yxx);
    let n2 = map(p + e.xxy);
    let n3 = map(p + e.xyx);
    let n4 = map(p + e.yyy);
    
    let normal = e.yxx * n1 + e.xxy * n2 + e.xyx * n3 + e.yyy * n4;
    return normalize(normal);
}

// 对数二分追踪
fn logBisectTrace(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
    var t: f32 = 0.0;
    var told: f32 = 0.0;
    var mid: f32;
    var dn: f32;
    
    var d = map(ro + rd * t);
    let sgn = sign(d);
    
    for (var i: i32 = 0; i < 64; i = i + 1) {
        if (sign(d) != sgn || d < 0.001 || t > FAR) {
            break;
        }
        
        told = t;
        
        // 分支优化
        let step_val = select(d * 0.5, log(abs(d) + 1.1) * 0.5, d <= 1.0);
        t = t + step_val;
        
        d = map(ro + rd * t);
    }
    
    if (sign(d) != sgn) {
        dn = sign(map(ro + rd * told));
        var iv = vec2<f32>(told, t);
        
        for (var ii: i32 = 0; ii < 8; ii = ii + 1) {
            mid = dot(iv, vec2<f32>(0.5));
            let d_mid = map(ro + rd * mid);
            
            if (abs(d_mid) < 0.001) {
                break;
            }
            
            if (d_mid * dn >= 0.0) {
                iv = vec2<f32>(mid, iv.y);
            } else {
                iv = vec2<f32>(iv.x, mid);
            }
        }
        
        t = mid;
    }
    
    return min(t, FAR);
}

// 阴影计算
fn sha(ro: vec3<f32>, rd: vec3<f32>, start: f32, end: f32, k: f32) -> f32 {
    var shade: f32 = 1.0;
    let maxIterationsShad: i32 = 16;
    
    var dist: f32 = start;
    let stepDist: f32 = end / f32(maxIterationsShad);
    
    for (var i: i32 = 0; i < maxIterationsShad; i = i + 1) {
        let h = map(ro + rd * dist);
        shade = min(shade, smoothstep(0.0, 1.0, k * h / dist));
        
        dist = dist + clamp(h, 0.02, 0.16);
        
        if (h < 0.001 || dist > end) {
            break;
        }
    }
    
    return min(max(shade, 0.0) + 0.1, 1.0);
}

// 灰度计算
fn gr(p: vec3<f32>) -> f32 {
    return dot(p, vec3<f32>(0.299, 0.587, 0.114));
}

// 纹理凹凸映射
fn db(t: texture_2d<f32>, s: sampler, p: vec3<f32>, n: vec3<f32>, bf: f32) -> vec3<f32> {
    let e = vec2<f32>(0.001, 0.0);
    
    let gx = gr(tpl(t, s, p - e.xyy, n));
    let gy = gr(tpl(t, s, p - e.yxy, n));
    let gz = gr(tpl(t, s, p - e.yyx, n));
    let g_center = gr(tpl(t, s, p, n));
    
    var g = vec3<f32>(gx, gy, gz);
    g = (g - g_center) / e.x;
    g = g - n * dot(n, g);
    
    return normalize(n + g * bf);
}

// 相机路径
fn camPath(t: f32) -> vec3<f32> {
    return vec3<f32>(-sin(t), sin(t) + 0.75, t * 2.0 + 0.5);
}

struct GBUFFER
{
    @location(0) position: vec4f,
}

@fragment
fn fs_main(in: VertexOutput) -> GBUFFER {
    // 屏幕坐标
    //let u = (fragCoord.xy - vec2f(1024.0f,1024.0f) * 0.5) / 1024.0f;
     let u = in.uv ;
    // 相机设置
    let o = camPath(iTime);
    let lk = camPath(iTime + 0.1);
    let l = o + vec3<f32>(1.5, 1.0, -0.5);
    
    // 射线方向
    let FOV: f32 = 3.14159 / 3.0;
    let fwd = normalize(lk - o);
    let rgt = normalize(vec3<f32>(fwd.z, 0.0, -fwd.x));
    let up = cross(fwd, rgt);
    
    var r = normalize(fwd + FOV * (u.x * rgt + u.y * up));
    
    // 相机旋转
    let rot = sin(vec2<f32>(1.57, 0.0) - iTime / 2.0);
    let a = mat2x2<f32>(rot.x, rot.y, -rot.y, rot.x);
    // r.xz = a * r.xz;
    // r.xy = a * r.xy;

    // 修正：不能直接对向量的部分赋值，需要创建新向量
let rotated_xz = a * r.xz;
r = vec3<f32>(rotated_xz.x, r.y, rotated_xz.y);

let rotated_xy = a * r.xy;
r = vec3<f32>(rotated_xy.x, rotated_xy.y, r.z);
    
    // 射线追踪
    let t = logBisectTrace(o, r);
    
    // 初始化颜色
    var col = vec3<f32>(0.0);
    
    if (t < FAR) {
        // 位置和法线
        let p = o + r * t;
        var n = nr(p);
        
        // 纹理凹凸映射
        let sz: f32 = 1.0;
        n = db(texture0, textureSampler0, p * sz, n, 0.03 / (1.0 + t / FAR));
        
        // 光照计算
        var light_dir = l - p;
        let light_dist = max(length(light_dir), 0.001);
        light_dir = light_dir / light_dist;
        
        // 环境光遮蔽和阴影
        let ao = cao(p, n, 4.0);
        let sh = sha(p, light_dir, 0.04, light_dist, 4.0);
        
        // 菲涅尔项
        let fr = clamp(1.0 + dot(r, n), 0.0, 1.0);
        
        // 纹理采样
        let tx = tpl(texture0, textureSampler0, p * sz, n);
        
        // 最终颜色计算
        col = tx * fr * 4.0;
        col = col * (1.0 / (1.0 + light_dist * 0.125 + light_dist * light_dist * 0.05)) * ao * sh;
    }
    
    // 背景混合
    let bg = vec3<f32>(1.0, 0.56, 0.3);
    col = mix(clamp(col, vec3<f32>(0.0), vec3<f32>(1.0)), bg, smoothstep(0.0, FAR - 2.0, t));
    
 //   return vec4<f32>(col, 1.0);
    var gbuffer: GBUFFER;
    gbuffer.position = vec4<f32>(col, 1.0);
    return gbuffer;
}
    `,
            entryPoint: "fs_main"
        }),
        attributes: new Attributes(),
        uniforms: new Uniforms(),
        colorAttachments: [positionColorAttachment],
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


    // texture0 sampler
    {
        const textureSampler0 = compiler.createTextureSampler({
            // minFilter: 'linear',
            // magFilter: 'linear',
            // addressModeU: 'repeat',
            // addressModeV: 'repeat',
            // mipmapFilter: 'linear'
        });
        desc.uniforms?.assign('textureSampler0', textureSampler0);
    }

    // texture2d (.ktx support)
    {
        const response = await fetch('./asset/img/blur.jpg');
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


    {

        desc.uniforms?.assign('iTime', compiler.createUniformBuffer({
            totalByteLength: 4,
            handler: () => {
                let now = performance.now() / 1000;
                console.info("now", now)
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
    holders.push(holder)


    // deferred rendering
    {
        const WGSLCode = `

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

@group(0) @binding(0) var position_texture: texture_2d<f32>;
@group(0) @binding(1) var texture_sampler: sampler;
@group(0) @binding(2) var<uniform>  iTime: f32;  


// 定义常量
const SAMPLES: f32 = 24.0;
const PI: f32 = 3.14159265359;

// 2x1 hash函数
fn hash(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(41.0, 289.0))) * 45758.5453);
}

// 光线偏移计算
fn lOff() -> vec3<f32> {
    let u = sin(vec2<f32>(1.57, 0.0) - iTime / 2.0);
    let a = mat2x2<f32>(u.x, u.y, -u.y, u.x);
    
    var l = normalize(vec3<f32>(1.5, 1.0, -0.5));
    
    // 修正：不能直接对向量的部分赋值
    let rotated_xz = a * l.xz;
    l = vec3<f32>(rotated_xz.x, l.y, rotated_xz.y);
    
    let rotated_xy = a * l.xy;
    l = vec3<f32>(rotated_xy.x, rotated_xy.y, l.z);
    
    return l;
}

// 为向量类型实现 smoothstep
fn smoothstep_vec4(edge0: vec4<f32>, edge1: vec4<f32>, x: vec4<f32>) -> vec4<f32> {
    let t = clamp((x - edge0) / (edge1 - edge0), vec4<f32>(0.0), vec4<f32>(1.0));
    return t * t * (vec4<f32>(3.0) - vec4<f32>(2.0) * t);
}

@fragment
fn fs_main(f: VertexOutput) -> @location(0) vec4 <f32>  {
// 屏幕坐标
   let uv = f.uv;
    
    // 径向模糊参数
    let decay: f32 = 0.97;
    let density: f32 = 0.5;
    var weight: f32 = 0.1;
    
    // 光线偏移
    let l = lOff();
    
    // 计算纹理偏移
    let tuv = uv - vec2<f32>(0.5) - l.xy * 0.45;
    
    // 计算采样步长
    let dTuv = tuv * density / SAMPLES;
    
    // 初始纹理采样
    var col = textureSample(position_texture, texture_sampler, uv) * 0.25;
    
    // 添加抖动以减少带状伪影
    var sampleUV = uv + dTuv * (hash(uv + fract(iTime)) * 2.0 - 1.0);
    
    // 径向模糊循环
    var currentWeight = weight;
    for (var i: f32 = 0.0; i < SAMPLES; i = i + 1.0) {
        sampleUV = sampleUV - dTuv;
        col = col + textureSample(position_texture, texture_sampler, sampleUV) * currentWeight;
        currentWeight = currentWeight * decay;
    }
    
    // 应用聚光灯效果
    col = col * (1.0 - dot(tuv, tuv) * 0.75);
    
    // 应用平滑步长和伽马校正
    // let result = sqrt(smoothstep(0.0, 1.0, col));
        let smoothed_col = smoothstep_vec4(vec4<f32>(0.0), vec4<f32>(1.0), col);
    let result = sqrt(smoothed_col);
    // 可选：绕过径向模糊直接显示原始场景
    // let result = sqrt(textureSample(position_texture, texture_sampler, uv));
    
    return vec4<f32>(result.xyz, 1.0);
}


        `;

        const textureSampler = compiler.createTextureSampler({
            // minFilter: 'linear',
            // magFilter: 'linear',
            // addressModeU: 'repeat',
            // addressModeV: 'repeat',
            // mipmapFilter: 'linear'
        });


        const desc: RenderHolderDesc = {
            label: `combine shading.`,
            vertexShader: compiler.createVertexShader({
                code: WGSLCode,
                entryPoint: `vs_main`
            }),
            fragmentShader: compiler.createFragmentShader({
                code: WGSLCode,
                entryPoint: `fs_main`
            }),
            attributes: new Attributes(),
            uniforms: new Uniforms(),
            colorAttachments: colorAttachments,
            depthStencilAttachment: depthStencilAttachment,
            dispatch: dispatch,
        };

        desc.uniforms?.assign(`position_texture`, positionTexture);
        desc.uniforms?.assign(`texture_sampler`, textureSampler);

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

        const renderHolder: RenderHolder = compiler.compileRenderHolder(desc);
        holders.push(renderHolder);
    }


    return holders;
}

export {
    initRadialBlur
}