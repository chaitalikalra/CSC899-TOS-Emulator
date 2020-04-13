import { Instruction } from "../instruction";
import { assert } from "../error";
import { Operand, OperandType, RegisterOperand, NumericConstantOperand } from "../operand";
import { AssembledProgram } from "../assembler";
import { OPERAND_SIZE_OVERRIDE, fillModRmSibDisp, getImmediateBytes, combineMachineCode } from "../assembler_utils";

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
}

class AndInstruction extends BinaryLogicalInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "and";
    }

    generateMachineCode(assembledProgram: AssembledProgram): void {
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
            immediate = getImmediateBytes((src as NumericConstantOperand).getValue(), this.operandSize);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x20);
            else opcode.push(0x21);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
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

    generateMachineCode(assembledProgram: AssembledProgram): void {
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
                if (this.operandSize == 1) opcode.push(0x0C);
                else opcode.push(0x0D);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 1);
            }
            immediate = getImmediateBytes((src as NumericConstantOperand).getValue(), this.operandSize);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x08);
            else opcode.push(0x09);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operandSize == 1) opcode.push(0x0A);
            else opcode.push(0x0B);
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

    generateMachineCode(assembledProgram: AssembledProgram): void {
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
                if (this.operandSize == 1) opcode.push(0x34);
                else opcode.push(0x35);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 6);
            }
            immediate = getImmediateBytes((src as NumericConstantOperand).getValue(), this.operandSize);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x30);
            else opcode.push(0x31);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
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

export { XorInstruction, AndInstruction, OrInstruction };