import { TestBed } from '@angular/core/testing';

import { TriggerActionsService } from './trigger-actions.service';

describe('TriggerActionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TriggerActionsService = TestBed.get(TriggerActionsService);
    expect(service).toBeTruthy();
  });
});
