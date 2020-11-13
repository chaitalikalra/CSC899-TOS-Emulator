import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-registers-view',
  templateUrl: './registers-view.component.html',
  styleUrls: ['./registers-view.component.css'],
})
export class RegistersViewComponent implements OnChanges {
  static readonly Registers32Bits = [
    'eax',
    'ebx',
    'ecx',
    'edx',
    'ebp',
    'esi',
    'edi',
    'esp',
    'eip',
  ];

  static readonly RegisterPopOver = {
    eax: ['ax', 'al', 'ah'],
    ebx: ['bx', 'bl', 'bh'],
    ecx: ['cx', 'cl', 'ch'],
    edx: ['dx', 'dl', 'dh'],
    ebp: ['bp'],
    esi: ['si'],
    edi: ['di'],
    esp: ['sp'],
  };

  static readonly DefaultValue = '';

  get defaultValue(): string {
    return RegistersViewComponent.DefaultValue;
  }

  get register32Bits(): string[] {
    return RegistersViewComponent.Registers32Bits;
  }

  getPopoverRegisters(reg: string): string[] {
    if (RegistersViewComponent.RegisterPopOver[reg] !== undefined) {
      return RegistersViewComponent.RegisterPopOver[reg];
    } else {
      return [];
    }
  }

  getPopoverContent(reg: string): string {
    const popoverRegs = this.getPopoverRegisters(reg);
    const ret: string[] = [];
    for (const r of popoverRegs) {
      const value =
        this.x86Service.executionContext === null
          ? this.defaultValue
          : this.x86Service.executionContext.registers[r];
      ret.push(r + ': ' + value);
    }
    return ret.join('<br />');
  }

  constructor(public x86Service: X86Service) {
    console.log('Register View Constructor');
  }

  ngOnChanges(s: SimpleChanges): void {
    console.log('onChange');
  }
}
