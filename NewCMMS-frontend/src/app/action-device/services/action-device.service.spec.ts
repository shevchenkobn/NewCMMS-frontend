import { TestBed } from '@angular/core/testing';

import { ActionDevicesService } from './action-devices.service';

describe('ActionDevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActionDevicesService = TestBed.get(ActionDevicesService);
    expect(service).toBeTruthy();
  });
});
