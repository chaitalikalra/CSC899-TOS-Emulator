import { Component, OnInit } from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-memory-slider',
  templateUrl: './memory-slider.component.html',
  styleUrls: ['./memory-slider.component.css'],
})
export class MemorySliderComponent implements OnInit {
  autoTicks = false;
  disabled = true;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = true;
  tickInterval = 1;

  constructor(public x86Service: X86Service) {
    x86Service.state$.subscribe((state) => {
      this._stateChanged(state);
    });
  }

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  ngOnInit(): void {
    this.max = this.x86Service.ramSize;
  }

  private _stateChanged(state: string): void {
    switch (state) {
      case 'EmulatorReady':
        this.disabled = true;
        this.value = 0;
        break;
      case 'EmulationStart':
        this.disabled = false;
        break;
    }
  }
}
