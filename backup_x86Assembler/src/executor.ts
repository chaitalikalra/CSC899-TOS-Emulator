import { AssembledCode } from "./assembled_code";
import { CPU } from "./cpu";
import { Instruction } from "./instruction";

class Executor {
  assembledCode: AssembledCode;
  cpu: CPU;

  constructor(program: string, cpu: CPU) {
    this.cpu = cpu;
    this.assembledCode = AssembledCode.parseAssembly(program, this.cpu);
    this.cpu.initStackPointer();
  }

  private executeInstruction(instruction: Instruction) {
    instruction.executeInstruction(this.cpu, this.assembledCode);
  }

  public executeNext(): void {
    if (
      this.assembledCode.instructionPtr >=
      this.assembledCode.instructions.length
    ) {
      console.log("Executed all instructions");
    }

    let next_instruction: Instruction = this.assembledCode.instructions[
      this.assembledCode.instructionPtr
    ];
    this.assembledCode.instructionPtr += 1;
    this.executeInstruction(next_instruction); 
  }
}

export { Executor };
