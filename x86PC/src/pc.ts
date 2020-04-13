import { CPU } from "./cpu";
import { Memory } from "./memory";
import { RuntimeError } from "./error"

class PC {
    cpu: CPU;
    memory: Memory;
    memorySize: number;

    constructor(memorySize: number) {
        this.memorySize = memorySize;
    }

    private initPC_(): void {
        this.cpu = new CPU();
        this.memory = new Memory(this.memorySize);
    }

    public loadMachineCode(code: Uint8Array, loadAddress: number = 0, startInstructionOffset: number = 0): void {
        this.initPC_();
        let codeByteCount: number = code.length;
        if (this.memory.size - loadAddress < codeByteCount) {
            RuntimeError.throwLowMemoryError("Code size greater than available memory.");
        }
        // Copy code into memory
        for (let i:number=0; i<codeByteCount; i++) {
            this.memory.pokeByte(i + loadAddress, code[i]);
        }
        // Set eip to point to startInstructionOffset
        this.cpu.setInstructionPointer(startInstructionOffset + loadAddress);
        // Init stack pointer to last memory address
        this.cpu.setStackPointer(this.memory.size); 
    }
}

export { PC };
