import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemorySliderComponent } from './memory-slider.component';

describe('MemorySliderComponent', () => {
  let component: MemorySliderComponent;
  let fixture: ComponentFixture<MemorySliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemorySliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemorySliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
