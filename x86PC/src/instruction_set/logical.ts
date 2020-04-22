import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";
import { getSignMask, getParity } from "../utils";

abstract class BinaryLogicalInstruction extends x86Instruction {
    protected abstract binaryLogicalFunction(op1: number, op2: number): number;

    executeInstruction(cpu: CPU): void {
        let src: x86Operand = this.operands[0];
        let dst: x86Operand = this.operands[1];

        let result: number = this.binaryLogicalFunction(
            cpu.readOperand(src, this.instructionOpSize),
            cpu.readOperand(dst, this.instructionOpSize)
        );
        this.setFlags_(result, cpu);
        cpu.writeOperand(dst, result, this.instructionOpSize);
    }

    protected setFlags_(result: number, cpu: CPU): void {
        // https://x86.puri.sm/html/file_module_x86_id_12.html
        // Logical instructions do the following:

        // 1. The OF and CF flags are cleared;
        cpu.eFlags.setOverflowFlag(false);
        cpu.eFlags.setCarryFlag(false);

        // 2. The SF, ZF, and PF flags are set according to the result
        cpu.eFlags.setZeroFlag(result == 0);
        cpu.eFlags.setSignFlag(
            Boolean(result & getSignMask(this.instructionOpSize))
        );
        cpu.eFlags.setParityFlag(getParity(result));
    }
}

class AndInstruction extends BinaryLogicalInstruction {
    binaryLogicalFunction(op1: number, op2: number): number {
        // needed to convert to uint
        return (op1 & op2) >>> 0;
    }
}

class OrInstruction extends BinaryLogicalInstruction {
    binaryLogicalFunction(op1: number, op2: number): number {
        // needed to convert to uint
        return (op1 | op2) >>> 0;
    }
}

class XorInstruction extends BinaryLogicalInstruction {
    binaryLogicalFunction(op1: number, op2: number): number {
        // needed to convert to uint
        return (op1 ^ op2) >>> 0;
    }
}

export { AndInstruction, OrInstruction, XorInstruction };
