import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-assembled-view',
  templateUrl: './assembled-view.component.html',
  styleUrls: ['./assembled-view.component.css'],
})
export class AssembledViewComponent implements OnInit {
  constructor(public x86Service: X86Service) {}

  instructions: object[];

  ngOnInit(): void {
    this.instructions = this.x86Service.assembledProgram.toTable();
  }
}
