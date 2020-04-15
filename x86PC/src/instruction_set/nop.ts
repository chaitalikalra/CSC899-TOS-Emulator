import { x86Instruction } from "../instruction";
import { CPU } from "../cpu";

class NopInstruction extends x86Instruction {
    executeInstruction(cpu: CPU) {
        
    }
}

export { NopInstruction };
