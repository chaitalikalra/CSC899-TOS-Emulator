import { get_uint } from "./utils";
import { Operand, OperandType, RegisterOperand } from "./operand";
import { assert } from "./error";

const OPERAND_SIZE_OVERRIDE = 0x66;

const REGISTER_CODES = {
    al: 0,
    cl: 1,
    dl: 2,
    bl: 3,
    ah: 4,
    ch: 5,
    dh: 6,
    bh: 7,
    ax: 0,
    cx: 1,
    dx: 2,
    bx: 3,
    sp: 4,
    bp: 5,
    si: 6,
    di: 7,
    eax: 0,
    ecx: 1,
    edx: 2,
    ebx: 3,
    esp: 4,
    ebp: 5,
    esi: 6,
    edi: 7,
};

function getImmediateBytes(immediate: number, data_size: number): number[] {
    let uint_immediate: number = get_uint(immediate, data_size);
    let ret: number[] = [];
    for (let i = 0; i < data_size; i++) {
        ret.push(((uint_immediate >>> (i * 8)) & 0xff) >>> 0);
    }
    return ret;
}

function getModRmSibDispLength(rm_op: Operand): number {
    // ToDo add implementation for memory operations
    assert(rm_op.type == OperandType.Register, "");

    if (rm_op.type == OperandType.Register) {
        return 1; // Only 1 byte is used when rm_op is register
    }

    return 0;
}

function fillModRmSibDisp(
    rm_op: Operand,
    reg: Operand | null,
    reg_val: number | null
): number[] {
    // Both reg and reg_val cannot be null
    assert(
        reg != null || reg_val == null,
        "Both reg and reg value cannot be null while setting mod r/m byte"
    );
    assert(
        reg == null || reg.type == OperandType.Register,
        "reg can only be Register while setting mod r/m byte"
    );
    let ret: number[] = [];
    let mod_rm_byte: number = 0;

    let reg_bits: number;
    if (reg == null) {
        reg_bits = (reg_val & 0x07) >>> 0; // And because consider only 3 bits
    } else {
        reg_bits = REGISTER_CODES[(reg as RegisterOperand).name];
    }

    // ToDo add implementation for memory operations
    assert(rm_op.type == OperandType.Register, "");

    if (rm_op.type == OperandType.Register) {
        // Register addressing mode, mod bits are 11
        let mod_bits: number = 0x03;
        let rm_bits: number = REGISTER_CODES[(rm_op as RegisterOperand).name];
        mod_rm_byte = makeModRmByte(mod_bits, reg_bits, rm_bits);
        ret.push(mod_rm_byte);
        return ret;
    }
}

function makeModRmByte(
    mod_bits: number,
    reg_bits: number,
    rm_bits: number
): number {
    return get_uint(((mod_bits << 6) | (reg_bits << 3) | rm_bits) >>> 0, 1);
}

function combineMachineCode(
    prefix: number[] = [],
    opcode: number[] = [],
    mod_rm_sib_disp: number[] = [],
    immediate: number[] = []
): Uint8Array {
    let instruction_size =
        prefix.length +
        opcode.length +
        mod_rm_sib_disp.length +
        immediate.length;
    let ret: Uint8Array = new Uint8Array(instruction_size);
    let i: number = 0;
    for (let byte of prefix) ret[i++] = get_uint(byte, 1);
    for (let byte of opcode) ret[i++] = get_uint(byte, 1);
    for (let byte of mod_rm_sib_disp) ret[i++] = get_uint(byte, 1);
    for (let byte of immediate) ret[i++] = get_uint(byte, 1);
    return ret;
}

export {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    getImmediateBytes,
    fillModRmSibDisp,
    combineMachineCode,
    getModRmSibDispLength,
};
