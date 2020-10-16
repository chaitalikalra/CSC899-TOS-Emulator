import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyDisplayComponent } from './property-display.component';

describe('PropertyDisplayComponent', () => {
  let component: PropertyDisplayComponent;
  let fixture: ComponentFixture<PropertyDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertyDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
