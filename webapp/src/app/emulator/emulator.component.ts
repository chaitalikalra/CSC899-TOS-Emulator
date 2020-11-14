import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { X86Service, States } from '../x86.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emulator',
  templateUrl: './emulator.component.html',
  styleUrls: ['./emulator.component.css'],
})
export class EmulatorComponent implements OnInit {
  // Number of Memory grids
  maxNumMemoryGrids = 4;
  currentNumMemoryGrids = 1;

  // Error State
  errorMessage = '';

  // Button states
  showStartButton = false;
  showRestartButton = false;
  showNextButton = false;

  // @ViewChild('editor') editor;
  @ViewChild('assembledview') assembledView;

  constructor(public x86Service: X86Service, private router: Router) {
    console.log('Emulator Constructor');
  }

  ngOnInit(): void {
    console.log('Emulator onInit');
    if (!this.x86Service.checkValidEmulatorState()) {
      this.router.navigateByUrl('');
    } else {
      this.x86Service.onEmulatorReady();
      this.updateButtonStates();
    }
  }

  onExit(): void {
    const originalCode = this.x86Service.originalCode;
    this.x86Service.clear();
    // Fill original code backup so that editor is initialized with
    // the current code
    this.x86Service.originalCode = originalCode;
    this.router.navigateByUrl('');
  }

  onStart(): void {
    this.x86Service.beginEmulation();
    this.updateButtonStates();
    this.assembledView.setSelectedInstruction(
      this.x86Service.executionContext.instructionNum
    );
  }

  onRestart(): void {
    console.log('On Restart');
    this.errorMessage = '';
    this.x86Service.restartEmulation();
    this.updateButtonStates();
    // init cursor
    // this.editor.setCursorLine(1);
    this.assembledView.setSelectedInstruction(0);
  }

  onNext(): void {
    console.log('On Next');
    this.x86Service.executeNextInstruction();
    // this.editor.setCursorLine(
    //   this.x86Service.executionContext.currentLineNumber
    // );
    this.assembledView.setSelectedInstruction(
      this.x86Service.executionContext.instructionNum
    );
    this.updateButtonStates();
  }

  updateButtonStates(): void {
    this.showStartButton = this.x86Service.state === States.EmulatorReady;
    this.showRestartButton =
      this.x86Service.state === States.EmulationStart ||
      this.x86Service.state === States.EmulationEnd ||
      this.x86Service.state === States.RuntimeError;

    this.showNextButton = this.x86Service.state === States.EmulationStart;
  }

  range(start: number, end: number): number[] {
    const arr: number[] = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  }

  onAdd(): void {
    if (this.currentNumMemoryGrids < this.maxNumMemoryGrids) {
      this.currentNumMemoryGrids++;
    }
  }
}
