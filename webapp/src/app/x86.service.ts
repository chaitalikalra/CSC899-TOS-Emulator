import { Injectable } from '@angular/core';
import { x86Assembler, x86PC, x86AssembledProgram } from 'x86';

export enum States {
  Begin,
  AssembleReady,
  AssembleError,
  Assembled,
  EmulatorReady,
  EmulationStart,
  RuntimeError,
  EmulationEnd,
}

@Injectable({
  providedIn: 'root',
})
export class X86Service {
  static ramSize = 256;

  state: States = States.Begin;
  // Assembler
  assembler: x86Assembler = null;
  assembledProgram: x86AssembledProgram = null;
  originalCode = '';

  // Emulator
  pc: x86PC = null;
  metadata: object = null;

  constructor() {}

  onAssemblerReady(): void {
    this.state = States.AssembleReady;
    this.assembler = new x86Assembler();
  }

  onEmulatorReady(): void {
    this.state = States.EmulatorReady;
    this.pc = new x86PC(X86Service.ramSize);
  }

  checkValidEmulatorState(): boolean {
    if (this.state !== States.Assembled) {
      return false;
    } else {
      return true;
    }
  }

  assembleProgram(code: string): void {
    try {
      this.assembledProgram = this.assembler.assembleProgram(code);
      this.state = States.Assembled;
      this.originalCode = code;
    } catch (e) {
      this.state = States.AssembleError;
      throw e;
    }
  }

  clear(): void {
    this.state = States.Begin;
    this.assembleProgram = null;
    this.assembler = null;
    this.pc = null;
    this.originalCode = '';
    this.metadata = null;
    this.onAssemblerReady();
  }

  beginEmulation(): void {
    this.state = States.EmulationStart;
    this.metadata = this.assembledProgram.genMetadata();
    this.pc.loadAssembledProgram(this.assembledProgram.getMachineCode(), 0);
  }

  restartEmulation(): void {
    this.onEmulatorReady();
    this.metadata = null;
  }
}
