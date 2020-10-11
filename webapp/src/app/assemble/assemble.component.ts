import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assemble',
  templateUrl: './assemble.component.html',
  styleUrls: ['./assemble.component.css'],
})
export class AssembleComponent implements OnInit {
  code = 'Type some code here';
  assembledCode = '';
  constructor(private x86Service: X86Service, private router: Router) {
    console.log('Assemble constructor');
  }

  ngOnInit(): void {
    console.log('Assemble on init');
    this.x86Service.onAssemblerReady();
  }

  onAssemble(): void {
    let s = this.x86Service.assembleProgram(this.code);
    this.assembledCode = s.toString();
  }

  onRoute(): void {
    this.router.navigateByUrl('/test', { skipLocationChange: true });
  }
}
