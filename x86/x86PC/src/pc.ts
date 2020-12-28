import { CPU } from "./cpu";
import { Memory } from "./memory";
import { RuntimeError } from "./error";
import { x86Disassembler } from "./disassembler";

class PC {
    cpu: CPU;
    memory: Memory;
    memorySize: number;
    disassembler: x86Disassembler;

    constructor(memorySize: number) {
        this.memorySize = memorySize;
    }

    private initPC_(): void {
        this.memory = new Memory(this.memorySize);
        this.cpu = new CPU(this.memory);
        this.disassembler = new x86Disassembler();
    }

    public loadAssembledProgram(
        code: Uint8Array,
        loadAddress: number = 0,
        startInstructionOffset: number = 0
    ): void {
        this.initPC_();
        let codeByteCount: number = code.length;
        if (this.memory.size - loadAddress < codeByteCount) {
            RuntimeError.throwLowMemoryError(
                "Code size greater than available memory."
            );
        }
        // Copy code into memory
        for (let i: number = 0; i < codeByteCount; i++) {
            this.memory.pokeMemory(i + loadAddress, code[i], 1);
        }
        
        // Set eip to point to startInstructionOffset
        this.cpu.setInstructionPointer(startInstructionOffset + loadAddress);
        // Init stack pointer to last memory address
        this.cpu.setStackPointer(this.memory.size);
    }

    public executeNextInstruction(): boolean {
        return this.cpu.executeNextInstruction(this.disassembler);
    }
    
    public getInstructionPtr(): number {
        return this.cpu.getInstructionPointer();
    }

    public getRegisterValues(): object {
        return this.cpu.getRegisterValues();
    }

    public getFlagValues(): object {
        return this.cpu.getFlagValues();
    }

    public getMemoryBytes(): string[] {
        return this.memory.getHexadecimalBytes();
    }
}

export { PC };
