import { it, describe, expect } from '@jest/globals';
import runPredicatesQueue from '../../src/helpers/run-predicates-queue.js';

function syncPredicateWithError() {
  throw new Error(syncPredicateWithError.msg);
}
syncPredicateWithError.msg = 'sync predicate error';

function asyncPredicateWithError() {
  return new Promise((_, reject) => {
    setTimeout(reject, 10, new Error(asyncPredicateWithError.msg));
  });
}
asyncPredicateWithError.msg = 'async predicate error';

describe('runPredicatesQueue', () => {
  describe('errors', () => {
    it('should return a rejected Promise if an error occurs', async () => {
      await expect(
        runPredicatesQueue(
          [() => true, syncPredicateWithError, asyncPredicateWithError],
          [false],
        ),
      ).rejects.toThrowError(syncPredicateWithError.msg);

      await expect(
        runPredicatesQueue(
          [() => true, syncPredicateWithError, asyncPredicateWithError],
          [true, false],
        ),
      ).rejects.toThrowError(syncPredicateWithError.msg);

      await expect(
        runPredicatesQueue(
          [() => true, () => true, asyncPredicateWithError],
          [true, false],
        ),
      ).rejects.toThrowError(asyncPredicateWithError.msg);
    });
  });
});
