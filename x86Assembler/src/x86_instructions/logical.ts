import {
    InstructionFunc,
    InstructionSuffix,
    get_data_size_src_dest
} from "./x86_instruction";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { Operand, OperandType } from "../instruction";
import { assert, get_sign_mask, get_parity } from "../utils";

interface BinaryLogicalFunc {
    (op1: number, op2: number): number;
}

function binary_logical_operator(
    opname: string,
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    operands: Operand[],
    func: BinaryLogicalFunc
): void {
    assert(operands.length == 2, opname + " instruction take 2 operands");
    let src: Operand = operands[0];
    let dst: Operand = operands[1];
    assert(
        dst.type == OperandType.IndirectAddress ||
            dst.type == OperandType.Register,
        "Destination can only be a register or memory address for " +
            opname +
            " instruction."
    );
    assert(
        !(
            src.type == OperandType.IndirectAddress &&
            dst.type == OperandType.IndirectAddress
        ),
        opname + " operator does not support memory to memory operations"
    );

    let data_size: number = get_data_size_src_dest(suffix, src, dst);
    let result: number = func(
        cpu.readValue(src, data_size),
        cpu.readValue(dst, data_size)
    );
    set_flags(result, cpu, data_size);
    cpu.writeValue(dst, result, data_size);
}

const and: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
) {
    let and_func: BinaryLogicalFunc = function(op1: number, op2: number) {
        return op1 & op2;
    };
    binary_logical_operator("and", suffix, cpu, operands, and_func);
};

const or: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
) {
    let or_func: BinaryLogicalFunc = function(op1: number, op2: number) {
        return op1 | op2;
    };
    binary_logical_operator("or", suffix, cpu, operands, or_func);
};

const xor: InstructionFunc = function(
    suffix: InstructionSuffix | null = null,
    cpu: CPU,
    assembled_code: AssembledCode,
    operands: Operand[]
) {
    let xor_func: BinaryLogicalFunc = function(op1: number, op2: number) {
        return op1 ^ op2;
    };
    binary_logical_operator("xor", suffix, cpu, operands, xor_func);
};

function set_flags(result: number, cpu: CPU, data_size: number): void {
    // https://x86.puri.sm/html/file_module_x86_id_12.html
    // Logical instructions do the following:

    // 1. The OF and CF flags are cleared;
    cpu.eFlags.set_overflow_flag(false);
    cpu.eFlags.set_carry_flag(false);

    // 2. The SF, ZF, and PF flags are set according to the result
    cpu.eFlags.set_zero_flag(result == 0);
    cpu.eFlags.set_sign_flag(Boolean(result & get_sign_mask(data_size)));
    cpu.eFlags.set_parity_flag(get_parity(result));
}

export {and, or, xor};