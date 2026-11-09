/**
 * @description Returns the maximum value among the given numbers.
 * @param args 
 * @returns 
 */
const max = (...args: number[]) => {
    return args.reduce((prev, current) => (prev > current ? prev : current));
}

/**
 * @description Returns the minimum value among the given numbers.
 * @param args The numbers to compare.
 * @returns The minimum value.
 */
const min = (...args: number[]) => {
    return args.reduce((prev, current) => (prev < current ? prev : current));
}

/**
 * @description Calculates the maximum mipmap count based on the given dimensions.
 * @param args The dimensions of the texture (width, height, depth, etc.).
 * @returns The maximum mipmap count.
 */
const getMaxMipmapCount = (...args: number[]): number => {
    const maxRes = max(...args);
    return Math.floor(Math.log2(maxRes)) + 1;
}

export {
    max,
    min,
    getMaxMipmapCount
}