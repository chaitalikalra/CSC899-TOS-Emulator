import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-assembled-view',
  templateUrl: './assembled-view.component.html',
  styleUrls: ['./assembled-view.component.css'],
})
export class AssembledViewComponent implements OnInit {
  constructor(public x86Service: X86Service) {}

  instructions: object[];
  tableRows: TableRow[];
  selectedInstruction = -1;
  @ViewChild('assembled') assembledTable: ElementRef;

  ngOnInit(): void {
    this.instructions = this.x86Service.assembledProgram.toTable();
    this.tableRows = [];
    for (const codeLine of this.x86Service.originalCode.split('\n')) {
      this.tableRows.push(new TableRow(codeLine));
    }
    for (let i = 0; i < this.x86Service.metadata['line_nums'].length; i++) {
      const lineNum: number = this.x86Service.metadata['line_nums'][i];
      this.tableRows[lineNum - 1].machineCode = this.instructions[i][
        'machine_code'
      ];
      this.tableRows[lineNum - 1].address = this.instructions[i]['address'];
    }
  }

  public setSelectedInstruction(num: number): void {
    // Line numbers begin from 1 and row numbers begin from 0
    const rowNum: number = this.x86Service.metadata['line_nums'][num] - 1;
    const prevSelection = this.selectedInstruction;
    this.selectedInstruction = rowNum;
    if (this.assembledTable) {
      const row = this.assembledTable.nativeElement.children[rowNum];
      if (this.selectedInstruction < prevSelection) {
        row.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      } else {
        row.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
      
    }
  }
}

class TableRow {
  address = '';
  machineCode = '';
  code = '';
  constructor(code: string) {
    this.code = code;
  }
}
