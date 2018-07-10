import { TestBed, inject } from '@angular/core/testing';

import { TypingService } from './typing.service';

describe('TypingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TypingService]
    });
  });

  it('should be created', inject([TypingService], (service: TypingService) => {
    expect(service).toBeTruthy();
  }));
});
