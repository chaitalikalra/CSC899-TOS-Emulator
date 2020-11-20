import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { x86Assembler, x86PC, x86AssembledProgram } from 'x86';
import { ExecutionContext } from './execution_context';
import { getClassExample } from './class_examples';

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
  static readonly ramSize = 256;

  state: States = States.Begin;
  // Assembler
  assembler: x86Assembler = null;
  assembledProgram: x86AssembledProgram = null;
  originalCode = '';

  // Emulator
  pc: x86PC = null;
  metadata: object = null;
  executionContext: ExecutionContext = null;
  isAuto = false;

  // Observable for Clear instruction state
  private clearInsStateSource = new Subject<boolean>();
  clearInsState$ = this.clearInsStateSource.asObservable();

  // Observable for State change
  private stateSource = new Subject<string>();
  state$ = this.stateSource.asObservable();

  // Observable for Slider value
  private sliderSource = new Subject<SliderChange>();
  slider$ = this.sliderSource.asObservable();

  // Observable for execution context update
  private executionCtxUpdateSource = new Subject<boolean>();
  executionCtxUpdate$ = this.executionCtxUpdateSource.asObservable();

  constructor() {}

  private _changeState(state: States, isAuto: boolean = false): void {
    this.state = state;
    this.isAuto = isAuto;
    this.stateSource.next(States[state]);
  }

  onAssemblerReady(): void {
    this._changeState(States.AssembleReady);
    this.assembler = new x86Assembler();
  }

  onEmulatorReady(): void {
    this._changeState(States.EmulatorReady);
    this.metadata = this.assembledProgram.genMetadata();
    this.pc = new x86PC(X86Service.ramSize);
    this.clearInstructionState();
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
      this._changeState(States.Assembled);
      this.originalCode = code;
    } catch (e) {
      this._changeState(States.AssembleError);
      throw e;
    }
  }

  clear(): void {
    this._changeState(States.Begin);
    this.assembledProgram = null;
    this.assembler = null;
    this.pc = null;
    this.originalCode = '';
    this.metadata = null;
    this._updateExecutionContext(true);
    this.clearInstructionState();
    this.onAssemblerReady();
  }

  beginEmulation(isAuto: boolean = false): void {
    this._changeState(States.EmulationStart, isAuto);
    this.clearInstructionState();
    this.pc.loadAssembledProgram(this.assembledProgram.getMachineCode(), 0);
    this._updateExecutionContext(false, false);
  }

  executeNextInstruction(): void {
    this.clearInstructionState();
    try {
      const success = this.pc.executeNextInstruction();
      this._updateExecutionContext(false, !success);
      if (!success) {
        this._changeState(States.EmulationEnd);
      }
    } catch (e) {
      this._changeState(States.RuntimeError);
      throw e;
    }
  }

  restartEmulation(): void {
    this.onEmulatorReady();
    this._updateExecutionContext(true);
  }

  clearInstructionState(): void {
    this.clearInsStateSource.next(true);
  }

  get ramSize(): number {
    return X86Service.ramSize;
  }

  getClassExample(example: string): string {
    return getClassExample(example);
  }

  sliderChanged(val: number, sliderIndex: number): void {
    this.sliderSource.next(new SliderChange(val, sliderIndex));
  }

  private _updateExecutionContext(setNull = false, programEnded = false): void {
    if (setNull) {
      this.executionContext = null;
    } else {
      this.executionContext = ExecutionContext.buildContext(
        this.pc,
        this.metadata,
        this.executionContext,
        programEnded,
        this.assembledProgram
      );
    }
    this.executionCtxUpdateSource.next(true);
  }
}

export class SliderChange {
  constructor(public value: number, public index: number) {}
}
