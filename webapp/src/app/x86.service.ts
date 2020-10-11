import { Injectable } from '@angular/core';
import { x86Assembler, x86PC } from 'x86';

enum States {
  Begin = 0,
  AssembleReady = 1,
  Assembled = 2,
  EmulatorReady = 3,
}

@Injectable({
  providedIn: 'root',
})
export class X86Service {
  state: States = States.Begin;
  assembler: x86Assembler;
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

  assembleProgram(code: string): object {
    this.state = States.Assembled;
    return this.assembler.assembleProgram(code);
  }
}
