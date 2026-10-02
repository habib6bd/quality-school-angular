import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ResponseStatusService } from './response-status.service';

describe('ResponseStatusService', () => {
  it('sets a 404 on the server response', () => {
    const init: ResponseInit = { status: 200 };
    TestBed.configureTestingModule({ providers: [{ provide: RESPONSE_INIT, useValue: init }] });
    TestBed.inject(ResponseStatusService).notFound();
    expect(init.status).toBe(404);
  });

  it('does nothing in the browser, where there is no response', () => {
    expect(() => TestBed.inject(ResponseStatusService).notFound()).not.toThrow();
  });
});
