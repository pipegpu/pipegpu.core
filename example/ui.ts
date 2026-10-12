import GUI from 'lil-gui';

const ControlTArr = [
    'drawCountLet',
    'drawIndexedLet',
    'drawInstancedLet',
    'drawIndirectLet',
    'drawIndexedIndirectLet',
    'drawWithArrayBufferLet',
    'ktx2Texutre2DLet',
    'ktx2Texture2DArrayLet',
    'multiDrawIndirectLet',
    'multiDrawIndexedIndirectLet',
    'multiDrawIndirectWithStorageVertexLet',
    'reversedZLet',
    'deferredLet',
    'textureCubeLet',
    'depthBiasLet',
    'hzbLets'
] as const;

type ControlTYPE = typeof ControlTArr[number];

const InitControlPannel = (ctl: { t: ControlTYPE }) => {
    const gui = new GUI({
        title: 'controls'
    });
    gui.add(ctl, 't', ControlTArr).name("   Control.").onChange((v: ControlTYPE) => {
        ctl.t = v;
    });
};

export {
    type ControlTYPE,
    InitControlPannel
}