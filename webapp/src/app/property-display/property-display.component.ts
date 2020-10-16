import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-property-display',
  templateUrl: './property-display.component.html',
  styleUrls: ['./property-display.component.css'],
})
export class PropertyDisplayComponent {
  @Input() name = '';
  @Input() value = '';

  constructor() {}
}
