import { Component, Input, OnInit } from '@angular/core';
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

  ngOnInit(): void {
    this.instructions = this.x86Service.assembledProgram.toTable();
  }

  public setSelectedInstruction(num: number): void {
    console.log('Delho chaand aya');
    this.selectedInstruction = num;
  }
}
