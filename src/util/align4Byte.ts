/**
 * @description
 * align4Byte(1) -> 4
 * align4Byte(2) -> 4
 * align4Byte(3) -> 4
 * align4Byte(6) -> 8
 * 
 * @param {number} n 
 * @returns 
 */
const align4Byte = (n: number): number => {
    return (n + 3) & ~3;
}

export {
    align4Byte
}