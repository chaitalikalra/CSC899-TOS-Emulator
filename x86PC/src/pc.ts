import { CPU } from "./cpu";
import { Memory } from "./memory";
import { RuntimeError } from "./error";
import { x86Disassembler } from "./disassembler";

class PC {
    cpu: CPU;
    memory: Memory;
    memorySize: number;
    disassembler: x86Disassembler;

    static NOOP_OPCODE = 0x90;

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
            this.memory.pokeByte(i + loadAddress, code[i]);
        }
        // Enter a dummy noop instruction to end execution
        this.memory.pokeByte(codeByteCount + loadAddress, PC.NOOP_OPCODE);

        // Set eip to point to startInstructionOffset
        this.cpu.setInstructionPointer(startInstructionOffset + loadAddress);
        // Init stack pointer to last memory address
        this.cpu.setStackPointer(this.memory.size);
    }

    public executeNextInstruction(): boolean {
        return this.cpu.executeNextInstruction(this.disassembler);
    }
}

export { PC };
