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
    fillModRmSibDisp,
    getImmediateBytes,
    combineMachineCode,
    getModRmSibDispLength,
} from "../assembler_utils";

abstract class BinaryLogicalInstruction extends Instruction {
    protected validateInstruction_(): void {
        assert(
            this.operands.length == 2,
            this.operator + " instruction take 2 operands"
        );

        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Destination can only be a register or memory address for " +
                this.operator +
                " instruction."
        );
        assert(
            !(
                src.type == OperandType.IndirectAddress &&
                dst.type == OperandType.IndirectAddress
            ),
            this.operator +
                " operator does not support memory to memory operations"
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
            if (
                dst.type == OperandType.Register &&
                (dst as RegisterOperand).name != "eax" &&
                (dst as RegisterOperand).name != "ax" &&
                (dst as RegisterOperand).name != "al"
            ) {
                instructionLength += getModRmSibDispLength(dst);
            }
            // Add length of immediate operand
            instructionLength += this.operandSize;
        } else if (src.type == OperandType.Register) {
            instructionLength += getModRmSibDispLength(dst);
        } else {
            // src is memory
            instructionLength += getModRmSibDispLength(src);
        }

        return instructionLength;
    }
}

class AndInstruction extends BinaryLogicalInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "and";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_12.html
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
            // When destination is EAX/AX/AL
            if (
                (dst.type == OperandType.Register &&
                    ((dst as RegisterOperand).name == "eax" ||
                        (dst as RegisterOperand).name == "ax")) ||
                (dst as RegisterOperand).name == "al"
            ) {
                if (this.operandSize == 1) opcode.push(0x24);
                else opcode.push(0x25);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 4);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x20);
            else opcode.push(0x21);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // dst is a register
            if (this.operandSize == 1) opcode.push(0x22);
            else opcode.push(0x23);
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

class OrInstruction extends BinaryLogicalInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "or";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_219.html
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
            // When destination is EAX/AX/AL
            if (
                (dst.type == OperandType.Register &&
                    ((dst as RegisterOperand).name == "eax" ||
                        (dst as RegisterOperand).name == "ax")) ||
                (dst as RegisterOperand).name == "al"
            ) {
                if (this.operandSize == 1) opcode.push(0x0c);
                else opcode.push(0x0d);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 1);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x08);
            else opcode.push(0x09);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // dst is a register
            if (this.operandSize == 1) opcode.push(0x0a);
            else opcode.push(0x0b);
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

class XorInstruction extends BinaryLogicalInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "xor";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_330.html
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
            // When destination is EAX/AX/AL
            if (
                (dst.type == OperandType.Register &&
                    ((dst as RegisterOperand).name == "eax" ||
                        (dst as RegisterOperand).name == "ax")) ||
                (dst as RegisterOperand).name == "al"
            ) {
                if (this.operandSize == 1) opcode.push(0x34);
                else opcode.push(0x35);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 6);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x30);
            else opcode.push(0x31);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // dst is a register
            if (this.operandSize == 1) opcode.push(0x32);
            else opcode.push(0x33);
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

class TestInstruction extends BinaryLogicalInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "test";
    }

    protected validateInstruction_(): void {
        assert(
            this.operands.length == 2,
            this.operator + " instruction take 2 operands"
        );

        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Destination can only be a register or memory address for " +
                this.operator +
                " instruction."
        );
        assert(
            src.type == OperandType.NumericConstant ||
                src.type == OperandType.Register,
            "Source can only be a register or immediate for " +
                this.operator +
                " instruction."
        );
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_315.html
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
            // When destination is EAX/AX/AL
            if (
                (dst.type == OperandType.Register &&
                    ((dst as RegisterOperand).name == "eax" ||
                        (dst as RegisterOperand).name == "ax")) ||
                (dst as RegisterOperand).name == "al"
            ) {
                if (this.operandSize == 1) opcode.push(0xa8);
                else opcode.push(0xa9);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0xf6);
                else opcode.push(0xf7);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x84);
            else opcode.push(0x85);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        }

        this.machineCode = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }
}

class NotInstruction extends Instruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "not";
    }

    protected validateInstruction_(): void {
        assert(
            this.operands.length == 1,
            this.operator + " instruction takes only 1 operands"
        );
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Operand can only be a register or memory address for " +
                this.operator +
                " instruction."
        );
    }

    calculateLength(): number {
        let instructionLength: number = 0;
        // For 16-bit operands, we add a prefix byte
        if (this.operandSize == 2) {
            instructionLength += 1;
        }
        // 1 byte for opcode
        instructionLength += 1;
        instructionLength += getModRmSibDispLength(this.operands[0]);
        return instructionLength;
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_218.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let dst: Operand = this.operands[0];
        let opcode: number[] = this.operandSize == 1 ? [0xf6] : [0xf7];
        let mod_rm_sib_disp: number[] = fillModRmSibDisp(dst, null, 2);
        this.machineCode = combineMachineCode(prefix, opcode, mod_rm_sib_disp);
    }
}

export {
    XorInstruction,
    AndInstruction,
    OrInstruction,
    NotInstruction,
    TestInstruction,
};
