import { TestBed } from '@angular/core/testing';

import { X86Service, States } from './x86.service';

describe('X86Service', () => {
  let service: X86Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(X86Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('initial state should be begin', () => {
    expect(service.state).toEqual(States.Begin);
  });

  it('check assembler ready', () => {
    expect(service.state).toBe(States.Begin);
    expect(service.assembler).toBeNull();
    service.onAssemblerReady();
    expect(service.assembler).toBeTruthy();
    expect(service.state).toEqual(States.AssembleReady);
  });

  it('check assemble correct program', () => {
    service.onAssemblerReady();
    let program = "pop %ax";
    expect(service.originalCode).toEqual('');
    expect(service.assembledProgram).toBeNull();
    service.assembleProgram(program);
    expect(service.assembledProgram).toBeTruthy();
    expect(service.originalCode).toEqual(program);
    expect(service.state).toEqual(States.Assembled);
  });

  it('check assemble incorrect program', () => {
    service.onAssemblerReady();
    expect(service.originalCode).toEqual('');
    expect(service.assembledProgram).toBeNull();
    expect(() => {service.assembleProgram('test')}).toThrowError();
    expect(service.originalCode).toEqual('');
    expect(service.assembledProgram).toBeNull();
    expect(service.state).toEqual(States.AssembleError);
  });

  it('validate checkValidEmulatorState', () => {
    service.onAssemblerReady();
    let program = "pop %ax";
    expect(service.checkValidEmulatorState()).toBeFalse();
    service.assembleProgram(program);
    expect(service.checkValidEmulatorState()).toBeTrue();
  });

  it('check emulator ready', () => {
    service.onAssemblerReady();
    let program = "pop %ax";
    service.assembleProgram(program);
    expect(service.metadata).toBeNull();
    expect(service.pc).toBeNull();
    expect(service.state).toEqual(States.Assembled);
    service.onEmulatorReady();
    expect(service.state).toEqual(States.EmulatorReady);
    expect(service.metadata).toBeTruthy();
    expect(service.pc).toBeTruthy();
  });

  it('test begin execution', () => {
    service.onAssemblerReady();
    let program = "pop %ax";
    service.assembleProgram(program);
    service.onEmulatorReady();
    expect(service.executionContext).toBeNull();
    service.beginEmulation();
    expect(service.executionContext).toBeTruthy();
    expect(service.state).toEqual(States.EmulationStart);
  });
});
