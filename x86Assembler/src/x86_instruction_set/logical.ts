import { Instruction, Operand, OperandType, RegisterOperand } from "../instruction";
import { assert, get_sign_mask, get_parity } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { combineMachineCode, OPERAND_SIZE_OVERRIDE, getImmediateBytes, fillModRmSibDisp } from "../assembler_utils";

abstract class BinaryLogicalInstruction extends Instruction {
    abstract binaryLogicalFunction(op1: number, op2: number): number;

    validateInstruction_(): void {
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

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];

        let result: number = this.binaryLogicalFunction(
            cpu.readValue(src, this.operand_size),
            cpu.readValue(dst, this.operand_size)
        );
        this.setFlags_(result, cpu);
        cpu.writeValue(dst, result, this.operand_size);
    }

    private setFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_12.html
        // Logical instructions do the following:

        // 1. The OF and CF flags are cleared;
        cpu.eFlags.set_overflow_flag(false);
        cpu.eFlags.set_carry_flag(false);

        // 2. The SF, ZF, and PF flags are set according to the result
        cpu.eFlags.set_zero_flag(result == 0);
        cpu.eFlags.set_sign_flag(
            Boolean(result & get_sign_mask(this.operand_size))
        );
        cpu.eFlags.set_parity_flag(get_parity(result));
    }
}

class AndInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "and";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_12.html
        let prefix: number[] = [];
        if (this.operand_size == 2) {
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
                if (this.operand_size == 1) opcode.push(0x24);
                else opcode.push(0x25);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operand_size == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 4);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operand_size == 1) opcode.push(0x20);
            else opcode.push(0x21);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operand_size == 1) opcode.push(0x22);
            else opcode.push(0x23);
            mod_rm_sib_disp = fillModRmSibDisp(src, dst, null);
        }

        this.machine_code = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 & op2) >>> 0;
    }
}

class OrInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "or";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_219.html
        let prefix: number[] = [];
        if (this.operand_size == 2) {
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
                if (this.operand_size == 1) opcode.push(0x0C);
                else opcode.push(0x0D);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operand_size == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 1);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operand_size == 1) opcode.push(0x08);
            else opcode.push(0x09);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operand_size == 1) opcode.push(0x0A);
            else opcode.push(0x0B);
            mod_rm_sib_disp = fillModRmSibDisp(src, dst, null);
        }

        this.machine_code = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 | op2) >>> 0;
    }
}

class XorInstruction extends BinaryLogicalInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "xor";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_12.html
        let prefix: number[] = [];
        if (this.operand_size == 2) {
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
                if (this.operand_size == 1) opcode.push(0x34);
                else opcode.push(0x35);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operand_size == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 6);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operand_size == 1) opcode.push(0x30);
            else opcode.push(0x31);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operand_size == 1) opcode.push(0x32);
            else opcode.push(0x33);
            mod_rm_sib_disp = fillModRmSibDisp(src, dst, null);
        }

        this.machine_code = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }

    binaryLogicalFunction(op1: number, op2: number): number {
        return (op1 ^ op2) >>> 0;
    }
}

export { XorInstruction, AndInstruction, OrInstruction };
