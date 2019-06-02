import { TestBed } from '@angular/core/testing';

import { TriggerDevicesService } from './trigger-devices.service';

describe('TriggerDevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TriggerDevicesService = TestBed.get(TriggerDevicesService);
    expect(service).toBeTruthy();
  });
});
