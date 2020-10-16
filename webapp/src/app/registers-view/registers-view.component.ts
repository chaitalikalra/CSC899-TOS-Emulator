import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-registers-view',
  templateUrl: './registers-view.component.html',
  styleUrls: ['./registers-view.component.css'],
})
export class RegistersViewComponent {
  static readonly Registers32Bits = [
    'eax',
    'ebx',
    'ecx',
    'edx',
    'esi',
    'edi',
    'esp',
    'eip',
  ];

  static readonly DefaultValue = '';

  get defaultValue(): string {
    return RegistersViewComponent.DefaultValue;
  }

  get register32Bits(): string[] {
    return RegistersViewComponent.Registers32Bits;
  }

  constructor(public x86Service: X86Service) {
    console.log('Register View Constructor');
  }
}
