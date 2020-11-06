import { x86PC } from 'x86';
import { AssembledProgram } from 'x86/dist/x86Assembler/src/assembler';

export class ExecutionContext {
  constructor(
    readonly registers: RegisterMapping,
    readonly flags: FlagsMapping,
    readonly memory: string[],
    readonly memoryChange: boolean[],
    readonly instructionPtr: number,
    readonly currentLineNumber: number,
    readonly programEnded: boolean
  ) {}

  static buildContext(
    pc: x86PC,
    metadata: any,
    oldContext: ExecutionContext,
    programEnded: boolean,
    assembledProgram: AssembledProgram
  ): ExecutionContext {
    const eip: number = pc.getInstructionPtr();
    const instructionNum = metadata.addr_instruction_map[eip];
    let lineNum: number;
    if (instructionNum === undefined) {
      lineNum = oldContext ? oldContext.currentLineNumber : 1;
    } else {
      lineNum = metadata.line_nums[instructionNum];
    }

    const memoryBytes: string[] = pc.getMemoryBytes();
    const memoryChange: boolean[] = Array(memoryBytes.length).fill(false);
    if (oldContext) {
      for (let i = 0; i < memoryBytes.length; i++) {
        memoryChange[i] = memoryBytes[i] !== oldContext.memory[i];
      }
    } else {
      const assembledCodeLength = assembledProgram.getMachineCode().length;
      for (let i = 0; i < memoryBytes.length; i++) {
        memoryChange[i] =
          i < assembledCodeLength ? true : memoryBytes[i] !== '00';
      }
    }

    return new ExecutionContext(
      pc.getRegisterValues() as RegisterMapping,
      pc.getFlagValues() as FlagsMapping,
      memoryBytes,
      memoryChange,
      eip,
      lineNum,
      programEnded
    );
  }
}

interface FlagsMapping {
  [index: string]: boolean;
}

interface RegisterMapping {
  [index: string]: Register;
}

class Register {
  constructor(name: string, value: number) {}
}
