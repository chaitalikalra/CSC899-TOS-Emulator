import { CPU } from "./cpu";
import { Register } from "./register";
import { Executor } from "./executor";
import { assert } from "./utils";

class Emulator {
    static stackSize = 128; // in bytes
    cpu: CPU;
    executor: Executor | null;

    constructor() {
        this.reset();
    }

    public reset() {
        this.cpu = new CPU(Emulator.stackSize);
        this.executor = null;
    }

    public assemble(program: string) {
        this.executor = new Executor(program, this.cpu);
    }

    public displayRegister(registerName: string): string[] {
        let register: Register = this.cpu.getRegister(registerName);
        return register.getHexadecimalBytes();
    }

    public displayAllRegisters(): void {
        for (let reg of CPU.registerNames) {
            console.log(reg + " : " + this.displayRegister(reg));
        }
    }

    public displayMemoryBytes(): string[] {
        return this.cpu.stackMemory.getHexadecimalBytesJson();
    }

    public displayMemoryWords(): string[] {
        return this.cpu.stackMemory.getHexadecimalWordsJson();
    }

    public displayMemoryLongs(): string[] {
        return this.cpu.stackMemory.getHexadecimalLongsJson();
    }

    public executeNext(): void {
        assert(this.executor != null, "No program assembled");
        this.executor.executeNext();
    }
}

export { Emulator };
