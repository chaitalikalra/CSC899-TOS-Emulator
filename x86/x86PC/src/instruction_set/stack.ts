import { InstructionOperandSize, x86Instruction } from "../instruction";
import { CPU } from "../cpu";
import { x86Operand } from "../operand";
import { get_uint } from "../utils";

class PushInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let src: x86Operand = this.operands[0];
        cpu.pushStack(
            cpu.readOperand(src, this.instructionOpSize),
            this.instructionOpSize
        );
    }
}

class PopInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let dst: x86Operand = this.operands[0];
        cpu.writeOperand(
            dst,
            cpu.popStack(this.instructionOpSize),
            this.instructionOpSize
        );
    }
}

class PushfInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.pushStack(
            cpu.getFlagsNumericValue(true),
            InstructionOperandSize.Word
        );
    }
}

class PushfdInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.pushStack(cpu.getFlagsNumericValue(), InstructionOperandSize.Long);
    }
}

class PopfInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.writeNumericToFlags(
            cpu.popStack(InstructionOperandSize.Word),
            true
        );
    }
}

class PopfdInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        cpu.writeNumericToFlags(cpu.popStack(InstructionOperandSize.Word));
    }
}

class PushaInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let registerList: string[] = [
            "ax",
            "cx",
            "dx",
            "bx",
            "sp",
            "bp",
            "si",
            "di",
        ];
        for (let reg of registerList) {
            cpu.pushStack(
                get_uint(
                    cpu.registers[reg].getNumericValue(),
                    InstructionOperandSize.Word
                ),
                InstructionOperandSize.Word
            );
        }
    }
}

class PushadInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let registerList: string[] = [
            "eax",
            "ecx",
            "edx",
            "ebx",
            "esp",
            "ebp",
            "esi",
            "edi",
        ];
        for (let reg of registerList) {
            cpu.pushStack(
                get_uint(
                    cpu.registers[reg].getNumericValue(),
                    InstructionOperandSize.Long
                ),
                InstructionOperandSize.Long
            );
        }
    }
}

class PopaInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let registerList: string[] = [
            "di",
            "si",
            "bp",
            "", // skip sp
            "bx",
            "dx",
            "cx",
            "ax",
        ];
        for (let reg of registerList) {
            if (reg.length == 0) continue;
            cpu.registers[reg].setNumericvalue(
                get_uint(
                    cpu.popStack(InstructionOperandSize.Word),
                    InstructionOperandSize.Word
                )
            );
        }
    }
}

class PopadInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        let registerList: string[] = [
            "edi",
            "esi",
            "ebp",
            "", // skip esp
            "ebx",
            "edx",
            "ecx",
            "eax",
        ];
        for (let reg of registerList) {
            if (reg.length == 0) continue;
            cpu.registers[reg].setNumericvalue(
                get_uint(
                    cpu.popStack(InstructionOperandSize.Long),
                    InstructionOperandSize.Long
                )
            );
        }
    }
}

export {
    PushInstruction,
    PopInstruction,
    PushfInstruction,
    PushfdInstruction,
    PopfInstruction,
    PopfdInstruction,
    PushaInstruction,
    PushadInstruction,
    PopaInstruction,
    PopadInstruction,
};
