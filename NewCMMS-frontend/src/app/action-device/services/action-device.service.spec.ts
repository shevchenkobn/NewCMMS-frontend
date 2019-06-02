import { TestBed } from '@angular/core/testing';

import { ActionDeviceService } from './action-device.service';

describe('ActionDeviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActionDeviceService = TestBed.get(ActionDeviceService);
    expect(service).toBeTruthy();
  });
});
