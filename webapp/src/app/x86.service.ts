import { Injectable } from '@angular/core';
import { x86Assembler, x86PC, x86AssembledProgram } from 'x86';

enum States {
  Begin,
  AssembleReady,
  AssembleError,
  Assembled,
  EmulatorReady,
}

@Injectable({
  providedIn: 'root',
})
export class X86Service {
  state: States = States.Begin;
  assembler: x86Assembler;
  assembledProgram: x86AssembledProgram = null;

  pc: x86PC;

  constructor() {
    this.assembler = new x86Assembler();
    this.pc = new x86PC(256);
  }

  onAssemblerReady(): void {
    this.state = States.AssembleReady;
  }

  checkValidEmulatorState(): boolean {
    if (this.state !== States.Assembled) {
      return false;
    } else {
      this.state = States.EmulatorReady;
      return true;
    }
  }

  assembleProgram(code: string): void {
    try {
      this.assembledProgram = this.assembler.assembleProgram(code);
      this.state = States.Assembled;
    } catch (e) {
      this.state = States.AssembleError;
      throw(e);
    }
  }

  clear(): void {
    this.state = States.AssembleReady;
    this.assembleProgram = null;
  }
}
