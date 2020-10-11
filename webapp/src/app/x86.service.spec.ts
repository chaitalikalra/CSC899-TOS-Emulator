import { TestBed } from '@angular/core/testing';

import { X86Service } from './x86.service';

describe('X86Service', () => {
  let service: X86Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(X86Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
