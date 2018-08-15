import { TestBed, inject } from '@angular/core/testing';

import { WebSqlService } from './web-sql.service';

describe('WebSqlService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebSqlService]
    });
  });

  it('should be created', inject([WebSqlService], (service: WebSqlService) => {
    expect(service).toBeTruthy();
  }));
});
