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
  selectedInstruction = -1;
  @ViewChild('assembled') assembledTable: ElementRef;

  ngOnInit(): void {
    this.instructions = this.x86Service.assembledProgram.toTable();
  }

  public setSelectedInstruction(num: number): void {
    this.selectedInstruction = num;
    if (this.assembledTable) {
      const row = this.assembledTable.nativeElement.children[num];
      row.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }
}
