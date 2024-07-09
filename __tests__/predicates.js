import { it, jest } from '@jest/globals';
import memoize from '../src/utils/memoize.js';

it.todo(
  'Import these predicates in test suits. Call jest.clearAllMocks() before using them.',
);

export const isOnlyLetters = jest.fn((value) => /^[A-Za-z]+$/.test(value));

export const isLongerThan = memoize((number) =>
  jest.fn((value) => String(value).length > number),
);
export const isShorterThan = memoize((number) =>
  jest.fn((value) => String(value).length < number),
);

export const isGreaterThan = memoize((number) =>
  jest.fn((value) => Number(number) < Number(value)),
);
export const isLessThan = memoize((number) =>
  jest.fn((value) => Number(number) > Number(value)),
);

export const isEmail = jest.fn((value) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    value,
  ),
);

export const isEmailNotBusy = jest.fn(
  (value) =>
    new Promise((res) => {
      setTimeout(
        res,
        2000 + Math.floor(Math.random() * (8000 - 2000)),
        value !== 'q@q.q',
      );
    }),
);

export const isPositiveInt = jest.fn(
  (value) => Number(value) >= 0 && Number.isInteger(Number(value)),
);

export const areEqual = jest.fn((...args) =>
  Boolean(args.reduce((acc, v) => (acc === v ? v : false))),
);
