import { assert } from "./error";
import { InstructionOperandSize } from "./instruction";

function uint16(n: number): number {
    return (n & 0xffff) >>> 0;
}

function uint8(n: number): number {
    return (n & 0xff) >>> 0;
}

function uint32(n: number): number {
    // https://stackoverflow.com/questions/6798111/bitwise-operations-on-32-bit-unsigned-ints
    return (n & 0xffffffff) >>> 0;
}

function get_uint(n: number, data_size: number): number {
    assert(
        [1, 2, 4].indexOf(data_size) != -1,
        "Invalid data size for get_uint"
    );

    switch (data_size) {
        case 1:
            return uint8(n);
        case 2:
            return uint16(n);
        case 4:
            return uint32(n);
    }
}

function getSignMask(
    dataSize: InstructionOperandSize = InstructionOperandSize.Long
): number {
    return 1 << (dataSize * 8 - 1);
}

function getParity(data: number): boolean {
    let lastByte: number = data & 0xff;
    let count: number = 0;
    while (lastByte != 0) {
        count++;
        lastByte = lastByte & (lastByte - 1);
    }
    return (count & 1) == 0;
}

function booleanArrayToNumber(arr: boolean[]): number {
    return arr.map(Number).reduce((res, x) => (res << 1) | x);
}

function numberToBooleanArray(value: number, arrSize: number = 32): boolean[] {
    return value
        .toString(2)
        .padStart(arrSize, "0")
        .split("")
        .reverse()
        .map((x) => (x == "1" ? true : false));
}

export {
    getSignMask,
    uint8,
    uint16,
    uint32,
    getParity,
    get_uint,
    booleanArrayToNumber,
    numberToBooleanArray,
};
