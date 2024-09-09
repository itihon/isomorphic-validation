import { it, describe, expect } from '@jest/globals';
import debounceP from '../../src/utils/debounce-p.js';

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

describe('debounceP', () => {
  describe('errors', () => {
    it('should return a rejected Promise if an error occurs', async () => {
      await expect(
        debounceP(syncPredicateWithError, 10)(),
      ).rejects.toThrowError(syncPredicateWithError.msg);

      await expect(
        debounceP(asyncPredicateWithError, 10)(),
      ).rejects.toThrowError(syncPredicateWithError.msg);
    });
  });
});
