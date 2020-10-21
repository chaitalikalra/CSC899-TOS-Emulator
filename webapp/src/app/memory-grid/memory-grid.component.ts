import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-memory-grid',
  templateUrl: './memory-grid.component.html',
  styleUrls: ['./memory-grid.component.css'],
})
export class MemoryGridComponent implements OnInit {
  readonly numCols = 20;
  readonly numCells = 100;
  data: string[] = Array(this.numCells).fill('');
  dataChange: boolean[] = Array(this.numCells).fill(false);
  startAddress = 0;
  endAddress = this.startAddress + this.numCells - 1;
  ramSize = 256;

  constructor(public x86Service: X86Service) {
    this.ramSize = x86Service.ramSize;
    x86Service.slider$.subscribe((val) => {
      this._sliderChanged(val);
    });
    x86Service.executionCtxUpdate$.subscribe((val) => {
      this._refreshMemory();
    });
  }

  private _sliderChanged(val: number): void {
    this.startAddress = Math.min(val, this.ramSize - this.numCells);
    this.endAddress = this.startAddress + this.numCells - 1;
    this._refreshMemory();
  }

  private _refreshMemory(): void {
    if (this.x86Service.executionContext === null) {
      this.data.fill('');
      this.dataChange.fill(false);
    } else {
      for (let i = 0; i < this.numCells; i++) {
        this.data[i] = this.x86Service.executionContext.memory[
          this.startAddress + i
        ];
        this.dataChange[i] = this.x86Service.executionContext.memoryChange[
          this.startAddress + i
        ];
      }
    }
  }

  ngOnInit(): void {}
}
