import { Instruction, Operand, OperandType, RegisterOperand } from "../instruction";
import { assert, get_sign_mask, get_parity, get_uint } from "../utils";
import { CPU } from "../cpu";
import { AssembledCode } from "../assembled_code";
import { OPERAND_SIZE_OVERRIDE, fillModRmSibDisp, getImmediateBytes, combineMachineCode, REGISTER_CODES } from "../assembler_utils";

abstract class ArithmeticInstruction extends Instruction {
    protected setSomeFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_5.html
        // Arithmetic instructions do the following:
        // The OF, SF, ZF, CF, and PF flags are set according to the result.

        // Set only SF, ZF and PF. OF and CF are set in individual functions
        let uint_result: number = get_uint(result, this.operand_size);
        cpu.eFlags.set_zero_flag(uint_result == 0);
        cpu.eFlags.set_sign_flag(
            Boolean(uint_result & get_sign_mask(this.operand_size))
        );
        cpu.eFlags.set_parity_flag(get_parity(uint_result));
    }
}

abstract class UnaryArithmeticInstruction extends ArithmeticInstruction {
    validateInstruction_(): void {
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
}

abstract class BinaryArithmeticInstruction extends ArithmeticInstruction {
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
}

class AddInstruction extends BinaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "add";
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
                if (this.operand_size == 1) opcode.push(0x04);
                else opcode.push(0x05);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operand_size == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 0);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operand_size == 1) opcode.push(0x00);
            else opcode.push(0x01);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operand_size == 1) opcode.push(0x02);
            else opcode.push(0x03);
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
        let op1: number = cpu.readValue(src, this.operand_size);
        let op2: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.operand_size);
        cpu.eFlags.set_carry_flag(result != uint_result);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (op2 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class SubInstruction extends BinaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "sub";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_308.html
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
                if (this.operand_size == 1) opcode.push(0x2C);
                else opcode.push(0x2D);
            } else {
                // Destination is R/M apart from EAX/AX/AL
                if (this.operand_size == 1) opcode.push(0x80);
                else opcode.push(0x81);
                mod_rm_sib_disp = fillModRmSibDisp(dst, null, 5);
            }
            immediate = getImmediateBytes(src.getValue(), this.operand_size);
        } else if (src.type == OperandType.Register) {
            // src is a register
            if (this.operand_size == 1) opcode.push(0x28);
            else opcode.push(0x29);
            mod_rm_sib_disp = fillModRmSibDisp(dst, src, null);
        } else {
            // src is a memory
            // src is a register
            if (this.operand_size == 1) opcode.push(0x2A);
            else opcode.push(0x2B);
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
        let op1: number = cpu.readValue(dst, this.operand_size);
        // Calculate a - b = a + (-b)
        let op2: number = -1 * cpu.readValue(src, this.operand_size);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.operand_size);

        // Carry flag for subtraction is inverse of the addition
        /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
        cpu.eFlags.set_carry_flag(result == uint_result);

        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (op2 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class IncOperator extends UnaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "inc";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_140.html
        let prefix: number[] = [];
        if (this.operand_size == 2) {
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
        this.machine_code = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let dst: Operand = this.operands[0];
        let op1: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 + 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.operand_size);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (1 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

class DecOperator extends UnaryArithmeticInstruction {
    setMnemonic_(): void {
        this.base_mnemonic = "dec";
    }

    genMachineCode_(): void {
        // Reference: https://c9x.me/x86/html/file_module_x86_id_71.html
        let prefix: number[] = [];
        if (this.operand_size == 2) {
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
        this.machine_code = combineMachineCode(
            (prefix = prefix),
            (opcode = opcode),
            (mod_rm_sib_disp = mod_rm_sib_disp)
        );
    }

    executeInstruction(cpu: CPU, assembled_code: AssembledCode): void {
        let dst: Operand = this.operands[0];
        let op1: number = cpu.readValue(dst, this.operand_size);
        let result: number = op1 - 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.operand_size);
        if (
            (op1 & get_sign_mask(this.operand_size)) ==
            (-1 & get_sign_mask(this.operand_size))
        ) {
            cpu.eFlags.set_overflow_flag(
                (op1 & get_sign_mask(this.operand_size)) !=
                    (uint_result & get_sign_mask(this.operand_size))
            );
        } else {
            cpu.eFlags.set_overflow_flag(false);
        }
        cpu.writeValue(dst, result, this.operand_size);
    }
}

export { AddInstruction, SubInstruction, IncOperator, DecOperator };
