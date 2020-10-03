import { Instruction } from "../instruction";
import {
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand,
} from "../operand";
import { assert } from "../error";
import { AssembledProgram } from "../assembler";
import {
    OPERAND_SIZE_OVERRIDE,
    fillModRmSibDisp,
    getImmediateBytes,
    combineMachineCode,
    REGISTER_CODES,
    getModRmSibDispLength,
} from "../assembler_utils";

abstract class UnaryArithmeticInstruction extends Instruction {
    protected validateInstruction_(): void {
        assert(
            this.operands.length == 1,
            this.operator + " instruction takes only 1 operand"
        );
        let dst: Operand = this.operands[0];
        assert(
            dst.type == OperandType.IndirectAddress ||
                dst.type == OperandType.Register,
            "Operand to " + this.operator + " can only be register or memory."
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

        let dst: Operand = this.operands[0];
        if (dst.type == OperandType.IndirectAddress) {
            instructionLength += getModRmSibDispLength(dst);
        }
        return instructionLength;
    }
}

abstract class BinaryArithmeticInstruction extends Instruction {
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

class AddInstruction extends BinaryArithmeticInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "add";
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
                if (this.operandSize == 1) opcode.push(0x04);
                else opcode.push(0x05);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x00);
            else opcode.push(0x01);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // dst is a register
            if (this.operandSize == 1) opcode.push(0x02);
            else opcode.push(0x03);
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

class SubInstruction extends BinaryArithmeticInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "sub";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_308.html
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
                if (this.operandSize == 1) opcode.push(0x2c);
                else opcode.push(0x2d);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operandSize == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 5);
            }
            immediate = getImmediateBytes(
                (src as NumericConstantOperand).getValue(),
                this.operandSize
            );
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operandSize == 1) opcode.push(0x28);
            else opcode.push(0x29);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operandSize == 1) opcode.push(0x2a);
            else opcode.push(0x2b);
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

class IncInstruction extends UnaryArithmeticInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "inc";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_140.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let dst: Operand = this.operands[0];
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = [];

        if (dst.type == OperandType.Register) {
            // Increment a Register
            let base_opcode: number = 0x40;
            opcode.push(
                base_opcode + REGISTER_CODES[(dst as RegisterOperand).name]
            );
        } else {
            // Increment Memory
            opcode.push(0xff);
            mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
        }
        this.machineCode = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }
}

class DecInstruction extends UnaryArithmeticInstruction {
    protected setBaseMnemonic_(): void {
        this.baseMnemonic = "dec";
    }

    generateMachineCode(assembledProgram: AssembledProgram, idx: number): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_71.html
        let prefix: number[] = [];
        if (this.operandSize == 2) {
            prefix.push(OPERAND_SIZE_OVERRIDE);
        }
        let dst: Operand = this.operands[0];
        let opcode: number[] = [];
        let mod_rm_sib_disp: number[] = [];

        if (dst.type == OperandType.Register) {
            // Increment a Register
            let base_opcode: number = 0x48;
            opcode.push(
                base_opcode + REGISTER_CODES[(dst as RegisterOperand).name]
            );
        } else {
            // Increment Memory
            opcode.push(0xff);
            mod_rm_sib_disp = fillModRmSibDisp(dst, null, 1);
        }
        this.machineCode = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }
}

export { AddInstruction, SubInstruction, IncInstruction, DecInstruction };
