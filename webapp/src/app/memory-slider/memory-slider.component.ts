import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-memory-slider',
  templateUrl: './memory-slider.component.html',
  styleUrls: ['./memory-slider.component.css'],
})
export class MemorySliderComponent implements OnInit {
  autoTicks = false;
  disabled = false;
  invert = false;
  max = 100;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = true;
  tickInterval = 1;

  constructor() {}

  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  ngOnInit(): void {}
}
