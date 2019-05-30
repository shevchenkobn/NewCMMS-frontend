import { TestBed } from '@angular/core/testing';

import { L10nService } from './l10n.service';

describe('L10nService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: L10nService = TestBed.get(L10nService);
    expect(service).toBeTruthy();
  });
});
