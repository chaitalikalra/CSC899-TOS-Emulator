import {
    Instruction,
    Operand,
    OperandType,
    RegisterOperand,
    NumericConstantOperand
} from "../instruction";
import { assert } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import {
    OPERAND_SIZE_OVERRIDE,
    REGISTER_CODES,
    getImmediateBytes,
    fillModRmSibDisp,
    combineMachineCode
} from "../assembler_utils";

class MovInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "mov";
    }

    validateInstruction_(): void {
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

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_176.html
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
            // When destination is register
            if (dst.type == OperandType.Register) {
                let base_opcode: number;
                if (this.operand_size == 1) base_opcode = 0xb0;
                else base_opcode = 0xb8;
                opcode.push(
                    base_opcode + REGISTER_CODES[(dst as RegisterOperand).name]
                );
            } else {
                // When destination is memory
                if (this.operand_size == 1) opcode.push(0xc6);
                else opcode.push(0xc7);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            if (this.operand_size == 1) opcode.push(0x88);
            else opcode.push(0x89);

            // When both source and dest are Registers
            // In this case Opcode duality can occur.
            // We will always pick the form where source is treated as reg
            // and destination is treated as r/m
            // http://www.c-jump.com/CIS77/CPU/x86/X77_0130_encoding_add_cl_al.htm
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // Source is Memory, Destination is Register
            if (this.operand_size == 1) opcode.push(0x8a);
            else opcode.push(0x8b);
            mod_rm_sib_disp = fillModRmSibDisp(src, dst, null);
        }

        this.machine_code = combineMachineCode(
            prefix,
            opcode,
            mod_rm_sib_disp,
            immediate
        );
    }

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        cpu.writeValue(
            dst,
            cpu.readValue(src, this.operand_size),
            this.operand_size
        );
    }
}

class LeaInstruction extends Instruction {
    setMnemonic_(): void {
        this.base_mnemonic = "lea";
    }

    validateInstruction_(): void {
        assert(this.operands.length == 2, "lea instructions take 2 operands");
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
            this.operand_size >= 2,
            "lea operands size can only be 16/32 bits"
        );
    }

    genMachineCode_(): void {}

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let src: Operand = this.operands[0];
        let dst: Operand = this.operands[1];
        cpu.writeValue(dst, src.getValue(), this.operand_size);
    }
}

export { MovInstruction, LeaInstruction };
