import { AssembledCode } from "./assembled_code";
import { CPU } from "./cpu";
import { Instruction } from "./instruction";
import { InstructionSet } from "./x86_instructions/x86_instruction";

class Executor {
  assembledCode: AssembledCode;
  cpu: CPU;

  constructor(program: string, cpu: CPU) {
    this.cpu = cpu;
    this.assembledCode = AssembledCode.parseAssembly(program, this.cpu);
    this.cpu.initStackPointer();
  }

  private executeInstruction(instruction: Instruction) {
    if (!(instruction.operator in InstructionSet)) {
      throw new Error("Unsupported Instruction: " + instruction.operator);
    }

    InstructionSet[instruction.operator](
      this.cpu,
      this.assembledCode,
      instruction.operands
    );
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
