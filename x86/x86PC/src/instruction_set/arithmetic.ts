import { InstructionOperandSize, x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";
import { get_uint, getSignMask, getParity } from "../utils";

abstract class ArithmeticInstruction extends x86Instruction {
    protected setSomeFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_5.html
        // Arithmetic instructions do the following:
        // The OF, SF, ZF, CF, and PF flags are set according to the result.

        // Set only SF, ZF and PF. OF and CF are set in individual functions
        let uint_result: number = get_uint(result, this.instructionOpSize);
        cpu.eFlags.setZeroFlag(uint_result == 0);
        cpu.eFlags.setSignFlag(
            Boolean(uint_result & getSignMask(this.instructionOpSize))
        );
        cpu.eFlags.setParityFlag(getParity(uint_result));
    }
}

class AddInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        let op1: number = cpu.readOperand(src, this.instructionOpSize);
        let op2: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.instructionOpSize);
        cpu.eFlags.setCarryFlag(result != uint_result);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (op2 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class SubInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        // Calculate a - b = a + (-b)
        let op2: number = -1 * cpu.readOperand(src, this.instructionOpSize);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.instructionOpSize);

        // Carry flag for subtraction is inverse of the addition
        /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
        cpu.eFlags.setCarryFlag(result == uint_result);

        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (op2 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class IncInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let dst: x86Operand = this.operands[0];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 + 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.instructionOpSize);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (1 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class DecInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let dst: x86Operand = this.operands[0];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        let result: number = op1 - 1;

        this.setSomeFlags_(result, cpu);

        // Set only OF
        // inc and dec do not impact carry flag
        let uint_result: number = get_uint(result, this.instructionOpSize);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (-1 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class NegInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let dst: x86Operand = this.operands[0];
        let op1: number = cpu.readOperand(dst, this.instructionOpSize);
        // Set CF
        if (op1 == 0) cpu.eFlags.setCarryFlag(false);
        else cpu.eFlags.setCarryFlag(true);
        let result: number = -op1;
        this.setSomeFlags_(result, cpu);
        // Set OF
        let uint_result: number = get_uint(result, this.instructionOpSize);
        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (-1 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }
}

class CmpInstruction extends ArithmeticInstruction {
    executeInstruction(cpu: CPU): void {
        let operand1: x86Operand = this.operands[0];
        let operand2: x86Operand = this.operands[1];
        let op1: number = cpu.readOperand(operand1, this.instructionOpSize);
        // Calculate a - b = a + (-b)
        let op2: number =
            -1 * cpu.readOperand(operand2, this.instructionOpSize);
        let result: number = op1 + op2;

        this.setSomeFlags_(result, cpu);
        // Set CF and OF
        let uint_result: number = get_uint(result, this.instructionOpSize);

        // Carry flag for subtraction is inverse of the addition
        /* https://stackoverflow.com/questions/8053053/how-does-an-adder-perform-unsigned-integer-subtraction/8061989#8061989 */
        cpu.eFlags.setCarryFlag(result == uint_result);

        if (
            (op1 & getSignMask(this.instructionOpSize)) ==
            (op2 & getSignMask(this.instructionOpSize))
        ) {
            cpu.eFlags.setOverflowFlag(
                (op1 & getSignMask(this.instructionOpSize)) !=
                    (uint_result & getSignMask(this.instructionOpSize))
            );
        } else {
            cpu.eFlags.setOverflowFlag(false);
        }
    }
}

class MulInstruction extends x86Instruction {
    executeInstruction(cpu: CPU): void {
        let op: x86Operand = this.operands[0];
        let multiplier: bigint = BigInt(
            cpu.readOperand(op, this.instructionOpSize)
        );
        let baseRegister: string;
        let overflowRegister: string;
        let binaryMask: bigint;
        switch (this.instructionOpSize) {
            case InstructionOperandSize.Byte:
                baseRegister = "al";
                overflowRegister = "ah";
                binaryMask = BigInt(0xff);
                break;
            case InstructionOperandSize.Word:
                baseRegister = "ax";
                overflowRegister = "dx";
                binaryMask = BigInt(0xffff);
                break;
            case InstructionOperandSize.Long:
                baseRegister = "eax";
                overflowRegister = "edx";
                binaryMask = BigInt(0xffffffff);
                break;
        }
        let product: bigint =
            BigInt(cpu.registers[baseRegister].getNumericValue()) * multiplier;
        // Store base result
        cpu.registers[baseRegister].setNumericvalue(
            Number(product & binaryMask) >>> 0
        );
        let numBits: bigint = BigInt(this.instructionOpSize * 8);
        let overflowResult: bigint =
            ((product & (binaryMask << numBits)) >> numBits) & binaryMask;
        // Store overflow result
        cpu.registers[overflowRegister].setNumericvalue(Number(overflowResult));
        cpu.eFlags.setOverflowFlag(overflowResult != BigInt(0));
        cpu.eFlags.setCarryFlag(overflowResult != BigInt(0));
    }
}

class DivInstruction extends x86Instruction {
    executeInstruction(cpu: CPU): void {
        // https://c9x.me/x86/html/file_module_x86_id_72.html
        let op: x86Operand = this.operands[0];
        let divisor: bigint = BigInt(
            cpu.readOperand(op, this.instructionOpSize)
        );
        if (divisor == BigInt(0)) {
            // throw Division Error
        }
        let dividend: bigint;
        let binaryMask: number;
        let quotientReg: string;
        let remainderReg: string;
        switch (this.instructionOpSize) {
            case InstructionOperandSize.Byte:
                dividend = BigInt(cpu.registers["ax"].getNumericValue());
                binaryMask = 0xff;
                quotientReg = "al";
                remainderReg = "ah";
                break;
            case InstructionOperandSize.Word:
                dividend =
                    (BigInt(cpu.registers["dx"].getNumericValue()) <<
                        BigInt(16)) |
                    BigInt(cpu.registers["ax"].getNumericValue());
                binaryMask = 0xffff;
                quotientReg = "ax";
                remainderReg = "dx";
                break;
            case InstructionOperandSize.Long:
                dividend =
                    (BigInt(cpu.registers["edx"].getNumericValue()) <<
                        BigInt(32)) |
                    BigInt(cpu.registers["eax"].getNumericValue());
                binaryMask = 0xffffffff;
                quotientReg = "eax";
                remainderReg = "edx";
                break;
        }
        let quotient: number;
        let remainder: number;
        remainder = Number(dividend % divisor);
        quotient = Number((dividend - BigInt(remainder)) / divisor);
        if (quotient > binaryMask) {
            // throw division error
        }
        cpu.registers[quotientReg].setNumericvalue(quotient);
        cpu.registers[remainderReg].setNumericvalue(remainder);
    }
}

export {
    AddInstruction,
    SubInstruction,
    IncInstruction,
    DecInstruction,
    NegInstruction,
    CmpInstruction,
    MulInstruction,
    DivInstruction,
};
