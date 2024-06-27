import { describe, it, expect } from '@jest/globals';
import preventCyclicSubscription from '../../src/helpers/prevent-cyclic-subscription.js';

describe('preventCyclicSubscription', () => {
  it('should not throw an error', () => {
    expect(() => preventCyclicSubscription(123, 1)).not.toThrow();
    expect(() => preventCyclicSubscription(123, 2)).not.toThrow();
    expect(() => preventCyclicSubscription(123, 3)).not.toThrow();
    expect(() => preventCyclicSubscription(123456, 123)).not.toThrow();
    expect(() => preventCyclicSubscription(123456789, 123456)).not.toThrow();

    // repetetive subscription is simply ignored
    expect(() => preventCyclicSubscription(123, 1)).not.toThrow();
    expect(() => preventCyclicSubscription(123, 2)).not.toThrow();
    expect(() => preventCyclicSubscription(123, 3)).not.toThrow();
    expect(() => preventCyclicSubscription(123456, 123)).not.toThrow();
  });

  it('should throw an error', () => {
    expect(() => preventCyclicSubscription(123, 123)).toThrowError(
      'Self subscription',
    );

    expect(() => preventCyclicSubscription(1, 123)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(1, 123456)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(1, 123456789)).toThrowError(
      'Cyclic subscription',
    );

    expect(() => preventCyclicSubscription(2, 123)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(2, 123456)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(2, 123456789)).toThrowError(
      'Cyclic subscription',
    );

    expect(() => preventCyclicSubscription(3, 123)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(3, 123456)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(3, 123456789)).toThrowError(
      'Cyclic subscription',
    );

    expect(() => preventCyclicSubscription(123, 123456)).toThrowError(
      'Cyclic subscription',
    );
    expect(() => preventCyclicSubscription(123, 123456789)).toThrowError(
      'Cyclic subscription',
    );
  });
});
