
const max = (...args: number[]) => {
    return args.reduce((prev, current) => (prev > current ? prev : current));
}

const min = (...args: number[]) => {
    return args.reduce((prev, current) => (prev < current ? prev : current));
}

/**
 * 
 * @param extent3d 
 * @returns 
 */
const getMaxMipmapCount = (...args: number[]): number => {
    const maxRes = max(...args);
    return Math.floor(Math.log2(maxRes));
}

export {
    max,
    min,
    getMaxMipmapCount
}