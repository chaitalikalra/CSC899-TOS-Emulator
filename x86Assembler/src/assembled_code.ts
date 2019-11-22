import { Instruction } from "./instruction";
import { parse } from "./x86_parser";
import { CPU } from "./cpu";

interface LabelMap {
  [index: string]: number;
}

class AssembledCode {
  instructions: Instruction[];
  labelMap: LabelMap;
  instructionPtr: number;

  constructor(
    instructions: Instruction[],
    labelMap: LabelMap,
    instructionPtr: number | null = null
  ) {
    this.instructions = instructions;
    this.labelMap = labelMap;

    if (instructionPtr != null) this.instructionPtr = instructionPtr;

    if (this.instructionPtr == null) {
      if ("start" in this.labelMap)
        this.instructionPtr = this.labelMap["start"];
      else this.instructionPtr = 0;
    }
  }

  static parseAssembly(program: string, cpu: CPU): AssembledCode {
    let rawInstructions: object[];
    rawInstructions = parse(program);

    let returnInstructions: Instruction[] = [];
    let labelMap = {};

    for (let i of rawInstructions) {
      let label: object | null = i["label"];
      let instruction: Instruction = Instruction.parseInstruction(
        i["instruction"],
        cpu
      );
      // Returns count after pushing
      let count: number = returnInstructions.push(instruction);
      if (label != null) {
        // Label points to the newly added instruction
        labelMap[label["value"]] = count - 1;
      }
    }
    return new AssembledCode(returnInstructions, labelMap);
  }
}

export { AssembledCode };
