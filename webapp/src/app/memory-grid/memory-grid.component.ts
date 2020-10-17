import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-memory-grid',
  templateUrl: './memory-grid.component.html',
  styleUrls: ['./memory-grid.component.css'],
})
export class MemoryGridComponent implements OnInit {
  readonly numCols = 20;
  readonly numCells = 100;
  data: number[] = Array(this.numCells).fill('00');
  startAddress = 0;
  constructor() {}

  ngOnInit(): void {}
}
