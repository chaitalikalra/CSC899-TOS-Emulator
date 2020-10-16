import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { X86Service } from '../x86.service';

@Component({
  selector: 'app-property-display',
  templateUrl: './property-display.component.html',
  styleUrls: ['./property-display.component.css'],
})
export class PropertyDisplayComponent implements OnChanges {
  @Input() name = '';
  @Input() value = '';

  highlightText = false;

  constructor(public x86Service: X86Service) {
    x86Service.clearInsState$.subscribe((val) => {
      this._clearState();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('change');
    if (!changes.hasOwnProperty('value') || changes.value.firstChange) {
      this.highlightText = false;
    } else {
      this.highlightText = changes.value.currentValue.trim().length > 0;
    }
  }

  private _clearState(): void {
    this.highlightText = false;
  }
}
