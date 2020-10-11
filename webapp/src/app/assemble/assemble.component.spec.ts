import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssembleComponent } from './assemble.component';

describe('AssembleComponent', () => {
  let component: AssembleComponent;
  let fixture: ComponentFixture<AssembleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssembleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssembleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
