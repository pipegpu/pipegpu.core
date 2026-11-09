/**
 * @description Computes a 32-bit hash of the input string using the FNV-1a algorithm.
 * @param str input raw string
 * @returns 
 */
const hash32a = (str: string): number => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return hash >>> 0;
}

export {
    hash32a
}