import GUI from 'lil-gui';

const ControlTArr = [
    'initDrawCount',
    'initDrawIndexed',
    'initKTX2Texture2D'
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