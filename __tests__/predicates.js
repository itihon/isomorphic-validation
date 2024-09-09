import { it, jest } from '@jest/globals';
import memoize from '../src/utils/memoize.js';

it('Import these predicates in test suits. Call jest.clearAllMocks() before using them.', () => {});

export const isOnlyLetters = jest.fn((value) => /^[A-Za-z]+$/.test(value));

export const isLongerThan = memoize((number) =>
  Object.defineProperty(
    jest.fn((value) => String(value).length > number),
    'name',
    { value: isLongerThan.name },
  ),
);

export const isShorterThan = memoize((number) =>
  Object.defineProperty(
    jest.fn((value) => String(value).length < number),
    'name',
    { value: isShorterThan.name },
  ),
);

export const isGreaterThan = memoize((number) =>
  Object.defineProperty(
    jest.fn((value) => Number(number) < Number(value)),
    'name',
    { value: isGreaterThan.name },
  ),
);

export const isGreaterOrEqual = memoize((number) =>
  Object.defineProperty(
    jest.fn((value) => Number(number) <= Number(value)),
    'name',
    { value: isGreaterThan.name },
  ),
);

export const isLessThan = memoize((number) =>
  Object.defineProperty(
    jest.fn((value) => Number(number) > Number(value)),
    'name',
    { value: isLessThan.name },
  ),
);

export const isEmail = jest.fn((value) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    value,
  ),
);

export const isNotOneTimeEmail = jest.fn((value) => {
  const domainBlacklist = [
    'bacaki.com',
    'hellomailo.net',
    'belgianairways.com',
  ];
  const domain = String(value).split('@')[1];

  return !domainBlacklist.some((v) => v === domain);
});

export const isEmailNotBusy = jest.fn(
  (value) =>
    new Promise((res) => {
      setTimeout(
        res,
        200 + Math.floor(Math.random() * (800 - 200)),
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

export const areNotEqual = jest.fn((value1, value2) => value1 !== value2);

Object.entries({
  isOnlyLetters,
  isEmail,
  isNotOneTimeEmail,
  isEmailNotBusy,
  isPositiveInt,
  areEqual,
  areNotEqual,
}).forEach(([name, predicate]) => {
  Object.defineProperty(predicate, 'name', { value: name });
});
