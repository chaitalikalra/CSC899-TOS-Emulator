import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-emulator',
  templateUrl: './emulator.component.html',
  styleUrls: ['./emulator.component.css'],
})
export class EmulatorComponent implements OnInit {
  constructor(public x86Service: X86Service, private router: Router) {
    console.log('Emulator Constructor');
  }
  ngOnInit(): void {
    console.log('Emulator onInit');
    if (!this.x86Service.checkValidEmulatorState()) {
      this.router.navigateByUrl('');
    }
  }
}
