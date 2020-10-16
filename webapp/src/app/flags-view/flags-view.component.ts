import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-flags-view',
  templateUrl: './flags-view.component.html',
  styleUrls: ['./flags-view.component.css'],
})
export class FlagsViewComponent {
  static readonly DefaultValue = '';
  static readonly Flags = ['carry', 'zero', 'sign', 'overflow', 'parity'];

  constructor(public x86Service: X86Service) {
    console.log('Flags View Constructor');
  }

  get defaultValue(): string {
    return FlagsViewComponent.DefaultValue;
  }

  get flags(): string[] {
    return FlagsViewComponent.Flags;
  }
}
