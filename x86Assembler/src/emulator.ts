import { CPU } from "./cpu";
import { Instruction } from "./instruction";
import { parse } from './x86_parser';

interface LabelMap {
    [index: string]: number;
}

class Emulator {
    static stackSize = 256; // in bytes
    cpu:CPU;

    constructor() {
        this.reset();
    }

    public reset() {
        this.cpu = new CPU(Emulator.stackSize);
    }

    parseAssembly(program: string) : [Instruction[], LabelMap] {
        let rawInstructions: object[];
        rawInstructions = parse(program);

        let returnInstructions: Instruction[] = [];
        let labelMap = {}

        for (let i of rawInstructions) {
            let label: object | null = i["label"];
            let instruction: Instruction = Instruction.parseInstruction(i["instruction"],
                this.cpu);
            // Returns count after pushing
            let count: number = returnInstructions.push(instruction);
            if (label != null) {
                // Label points to the newly added instruction
                labelMap[label["value"]] = count - 1;
            }
        }
        return [returnInstructions, labelMap];
    }
}

export { Emulator };
