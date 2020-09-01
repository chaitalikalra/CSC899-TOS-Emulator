import { Instruction } from "../instruction";
import { assert } from "../error";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
} from "../operand";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    fillModRmSibDisp,
    getImmediateBytes,
    combineMachineCode,
    getModRmSibDispLength,
} from "../assembler_utils";

class MovInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "mov";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 2, "mov instructions take 2 operands");
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "mov destination can only be a register or memory address"
        );
        assert(
            !(
                src.type == OperandType.IndirectAddress &&
                dst.type == OperandType.IndirectAddress
            ),
            "mov does not support memory to memory transfer"
        );
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // Add 1 byte for opcode
        instructionLength += 1;

        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];

        if (src.type == OperandType.NumericConstant) {
            // Add immediate bytes
            instructionLength += this.operandSize;
            // For destination register, nothing is added
            // if dst is memory, then add mod_rm_sib_disp
            if (dst.type == OperandType.IndirectAddress) {
                instructionLength += getModRmSibDispLength(dst);
            }
        } else if (src.type == OperandType.Register) {
            instructionLength += getModRmSibDispLength(dst);
        } else {
            // when src is memory,
            instructionLength += getModRmSibDispLength(src);
        }
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_176.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = [];
        let immediate: number[] = [];

        // When source is an immediate value
        if (src.type == OperandType.NumericConstant) {
            // When destination is register
            if (dst.type == OperandType.Register) {
                let base_opcode: number;
                if (this.operandSize == 1) base_opcode = 0xb0;
                else base_opcode = 0xb8;
                opcode.push(
                    base_opcode + REGISTER_CODES[(dst as RegisterOperand).name]
                );
            } else {
                // When destination is memory
                if (this.operandSize == 1) opcode.push(0xc6);
                else opcode.push(0xc7);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            if (this.operandSize == 1) opcode.push(0x88);
            else opcode.push(0x89);

            // When both source and dest are Registers
            // In this case Opcode duality can occur.
            // We will always pick the form where source is treated as reg
            // and destination is treated as r/m
            // http://www.c-jump.com/CIS77/CPU/x86/X77_0130_encoding_add_cl_al.htm
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // Source is Memory, Destination is Register
            if (this.operandSize == 1) opcode.push(0x8a);
            else opcode.push(0x8b);
            mod_rm_sib_disp = fillModRmSibDisp(src, dst, null);
        }

        this.machineCode = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }
}

class LeaInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "lea";
    }

    protected validateInstruction_(): void {
        assert(this.operands.length == 2, "lea instruction take 2 operands");
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.Register,
            "lea dst can only be a register"
        );
        assert(
            src.type == OperandType.IndirectAddress,
            "lea src can only be a memory address"
        );
        assert(
            this.operandSize >= 2,
            "lea operands size can only be 16/32 bits"
        );
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // Add 1 byte for opcode
        instructionLength += 1;
        let src: Operand = this.operands[0];
        // Src is always memory
        instructionLength += getModRmSibDispLength(src);
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_153.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        let opcode: number[] = [0x8d];
        let mod_rm_sib_disp: number[] = fillModRmSibDisp(src, dst, null);
        this.machineCode = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }
}

export { MovInstruction, LeaInstruction };
