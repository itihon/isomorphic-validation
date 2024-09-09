import { it, describe, expect, jest, beforeEach } from '@jest/globals';
import tryCatch from '../../src/utils/try-catch.js';

function syncFnWithError() {
  throw new Error(syncFnWithError.msg);
}
syncFnWithError.msg = 'sync function error';

function asyncFnWithError() {
  return new Promise((_, reject) => {
    setTimeout(reject, 10, new Error(asyncFnWithError.msg));
  });
}
asyncFnWithError.msg = 'async function error';

// fallback values
const errorCallbackFB = { value: 'errorCallback fallback value' };
const catchFn2FB = { value: 'catchFn2 fallback value' };

const catchFn = jest.fn();
const enableFn = jest.fn(() => true);
const catchFn2 = jest.fn(() => catchFn2FB);
const errorCallback = jest.fn(() => errorCallbackFB);

describe('tryCatch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should catch sync errors when enabled and run the error callback anyways', () => {
    const syncFnWithErrorTC = tryCatch(
      syncFnWithError,
      catchFn,
      enableFn,
      catchFn2,
      errorCallback,
    );
    let retVal;

    expect(() => {
      retVal = syncFnWithErrorTC();
    }).not.toThrow();
    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(catchFn.mock.calls[0][0].message).toBe(syncFnWithError.msg);
    expect(errorCallback).toHaveBeenCalledTimes(1);
    expect(retVal).toBe(errorCallbackFB);

    enableFn.mockImplementationOnce(() => false);

    expect(() => {
      retVal = syncFnWithErrorTC();
    }).toThrowError(syncFnWithError.msg);
    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(errorCallback).toHaveBeenCalledTimes(2);

    expect(catchFn2).not.toHaveBeenCalled();
  });

  it('should catch async errors when enabled and run the error callback anyways', async () => {
    const asyncFnWithErrorTC = tryCatch(
      asyncFnWithError,
      catchFn,
      enableFn,
      catchFn2,
      errorCallback,
    );

    await expect(asyncFnWithErrorTC()).resolves.toBe(errorCallbackFB);

    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(catchFn.mock.calls[0][0].message).toBe(asyncFnWithError.msg);
    expect(errorCallback).toHaveBeenCalledTimes(1);

    enableFn.mockImplementationOnce(() => false);

    await expect(asyncFnWithErrorTC).rejects.toThrow();
    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(errorCallback).toHaveBeenCalledTimes(2);

    expect(catchFn2).not.toHaveBeenCalled();
  });

  it('should forward sync errors', () => {
    const syncFnWithErrorTC = tryCatch(syncFnWithError, catchFn, enableFn);
    catchFn.mockImplementationOnce((err, next) => {
      next();
    });

    try {
      syncFnWithErrorTC();
    } catch (err) {
      catchFn2(err);
    }

    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(catchFn.mock.calls[0][0].message).toBe(syncFnWithError.msg);

    expect(catchFn2).toHaveBeenCalledTimes(1);
    expect(catchFn2.mock.calls[0][0].message).toBe(syncFnWithError.msg);
  });

  it('should forward async errors', async () => {
    const asyncFnWithErrorTC = tryCatch(asyncFnWithError, catchFn, enableFn);
    catchFn.mockImplementationOnce((err, next) => {
      next();
    });

    await asyncFnWithErrorTC().catch(catchFn2);

    expect(catchFn).toHaveBeenCalledTimes(1);
    expect(catchFn.mock.calls[0][0].message).toBe(asyncFnWithError.msg);

    expect(catchFn2).toHaveBeenCalledTimes(1);
    expect(catchFn2.mock.calls[0][0].message).toBe(asyncFnWithError.msg);
  });
});
