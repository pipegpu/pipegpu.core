import * as flatbuffers from 'flatbuffers';
import { HardwareDenseMeshFriendly } from '../plugin/meshlet/spec';
import { spec } from '../plugin/meshlet/hdmf';
/**
 * 
 * @param uri 
 * @param _key 
 */
const fetchMeshlet = async (uri: string, _key: string = ""): Promise<HardwareDenseMeshFriendly> => {
    const response = await fetch(uri);
    if (!response.ok) {
        throw new Error(`[E][fetchHDMF ] .hdmf load failed, response code: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const u8arr = new Uint8Array(arrayBuffer);
    const buf = new flatbuffers.ByteBuffer(u8arr);
    const hardwareDenseMeshFriendly = spec.HardwareDenseMeshFriendly.getRootAsHardwareDenseMeshFriendly(buf)
    return hardwareDenseMeshFriendly;
}

export {
    fetchMeshlet
}