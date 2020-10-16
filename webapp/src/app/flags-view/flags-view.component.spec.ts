import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagsViewComponent } from './flags-view.component';

describe('FlagsViewComponent', () => {
  let component: FlagsViewComponent;
  let fixture: ComponentFixture<FlagsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlagsViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
