import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssembledViewComponent } from './assembled-view.component';

describe('AssembledViewComponent', () => {
  let component: AssembledViewComponent;
  let fixture: ComponentFixture<AssembledViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssembledViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssembledViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
