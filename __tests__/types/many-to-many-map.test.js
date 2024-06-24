import {
  describe,
  it,
  expect,
  beforeAll,
  jest,
  beforeEach,
} from '@jest/globals';
import ManyToManyMap from '../../src/types/many-to-many-map.js';

const keyObj1 = { prop: 1 };
const keyObj2 = { prop: 2 };
const keyObj3 = { prop: 3 };
const keyObj4 = { prop: 4 };
const keyObj5 = { prop: 5 };

const valueObj1 = { v: 1 };
const valueObj2 = { v: 2 };
const valueObj3 = { v: 3 };
const valueObj4 = { v: 4 };
const valueObj5 = { v: 5 };

const testData1 = [
  [[keyObj1, keyObj2], valueObj1],
  [[keyObj2, keyObj3], valueObj2],
  [[keyObj3], valueObj3],
];

const testData2 = [
  [[keyObj1], valueObj1],
  [[keyObj2], valueObj1],
  [[keyObj2], valueObj2],
  [[keyObj2, keyObj3, keyObj4], valueObj2],
  [[keyObj3], valueObj3],
  [[keyObj3, keyObj4], valueObj3],
];

const testData3 = [
  [[keyObj1, keyObj5], valueObj4],
  [[keyObj5, keyObj3], valueObj5],
  [[keyObj3], valueObj4],
];

describe('ManyToManyMap', () => {
  const mtmm1 = ManyToManyMap();
  const mtmm2 = ManyToManyMap();

  const keyValuePairs = new Map();
  const seen = [];
  const getPairID = (value, key) => {
    const pairId = keyValuePairs.get(key).get(value);
    seen[pairId] = true;
    return pairId;
  };

  beforeAll(() => {
    let pairID = 0;
    const origAdd = mtmm2.add;
    jest.spyOn(mtmm2, 'add').mockImplementation((key, value) => {
      keyValuePairs.set(
        key,
        keyValuePairs.get(key)?.set(value, pairID) ||
          new Map().set(value, pairID),
      );
      pairID++;
      return origAdd.call(mtmm2, key, value);
    });
  });

  beforeEach(() => {
    seen.fill(false);
  });

  beforeAll(() => {
    testData2.concat(testData1).forEach(([keys, value]) => {
      keys.forEach((key) => mtmm1.add(key, value));
    });

    testData3.forEach(([keys, value]) => {
      keys.forEach((key) => mtmm2.add(key, value));
    });
  });

  describe('mtmm1', () => {
    it('should have keyObj1 ... keyObj4 as keys', () => {
      expect(mtmm1.size).toStrictEqual(4);

      expect(mtmm1.has(keyObj1)).toBe(true);
      expect(mtmm1.has(keyObj2)).toBe(true);
      expect(mtmm1.has(keyObj3)).toBe(true);
      expect(mtmm1.has(keyObj4)).toBe(true);
    });

    it('should retreive values in accordance with keyObj1 ... keyObj4 keys', () => {
      expect(mtmm1.getAll()).toStrictEqual(
        new Set([valueObj1, valueObj2, valueObj3]),
      );

      expect(mtmm1.get(keyObj1)).toStrictEqual(new Set([valueObj1]));
      expect(mtmm1.get(keyObj2)).toStrictEqual(new Set([valueObj1, valueObj2]));
      expect(mtmm1.get(keyObj3)).toStrictEqual(new Set([valueObj2, valueObj3]));
      expect(mtmm1.get(keyObj4)).toStrictEqual(new Set([valueObj2, valueObj3]));
    });
  });

  describe('mtmm2', () => {
    it('should have keyObj1, keyObj3, keyObj5 as keys', () => {
      expect(mtmm2.size).toStrictEqual(3);

      expect(mtmm2.has(keyObj1)).toBe(true);
      expect(mtmm2.has(keyObj3)).toBe(true);
      expect(mtmm2.has(keyObj5)).toBe(true);
    });

    it('should retreive values in accordance with keyObj1, keyObj3, keyObj5 keys', () => {
      expect(mtmm2.getAll()).toStrictEqual(new Set([valueObj4, valueObj5]));

      expect(mtmm2.get(keyObj1)).toStrictEqual(new Set([valueObj4]));
      expect(mtmm2.get(keyObj3)).toStrictEqual(new Set([valueObj4, valueObj5]));
      expect(mtmm2.get(keyObj5)).toStrictEqual(new Set([valueObj4, valueObj5]));
    });
  });

  describe('mtmm2 merged with mtmm1', () => {
    beforeAll(() => {
      mtmm2.mergeWith(mtmm1);
    });

    it('should have keyObj1 ... keyObj5 as keys', () => {
      expect(mtmm2.size).toStrictEqual(5);

      expect(mtmm2.has(keyObj1)).toBe(true);
      expect(mtmm2.has(keyObj2)).toBe(true);
      expect(mtmm2.has(keyObj3)).toBe(true);
      expect(mtmm2.has(keyObj4)).toBe(true);
      expect(mtmm2.has(keyObj5)).toBe(true);
    });

    it('should retreive values in accordance with keyObj1 ... keyObj5 keys', () => {
      expect(mtmm2.getAll()).toStrictEqual(
        new Set([valueObj1, valueObj2, valueObj3, valueObj4, valueObj5]),
      );

      expect(mtmm2.get(keyObj1)).toStrictEqual(new Set([valueObj1, valueObj4]));
      expect(mtmm2.get(keyObj2)).toStrictEqual(new Set([valueObj1, valueObj2]));
      expect(mtmm2.get(keyObj3)).toStrictEqual(
        new Set([valueObj2, valueObj3, valueObj4, valueObj5]),
      );
      expect(mtmm2.get(keyObj4)).toStrictEqual(new Set([valueObj2, valueObj3]));
      expect(mtmm2.get(keyObj5)).toStrictEqual(new Set([valueObj4, valueObj5]));
    });
  });

  describe('map and forEach', () => {
    it('should map to...', () => {
      const mtmmMappedTo = ManyToManyMap()
        .add(keyObj1, 0)
        .add(keyObj5, 1)
        .add(keyObj5, 2)
        .add(keyObj3, 3)
        .add(keyObj3, 4)
        .add(keyObj1, 5)
        .add(keyObj2, 6)
        .add(keyObj2, 7)
        .add(keyObj3, 8)
        .add(keyObj3, 9)
        .add(keyObj4, 10)
        .add(keyObj4, 11);

      const pairIds = mtmm2.map(getPairID);

      expect(seen.every((value) => value === true)).toBe(true);
      expect([...pairIds]).toStrictEqual([...mtmmMappedTo]);
    });

    it('should be seen every key-value pair via forEach', () => {
      mtmm2.forEach(getPairID);

      expect(seen.every((value) => value === true)).toBe(true);
    });

    it('should map and iterate over all values via forEach', () => {
      const mtmmArr = [];
      const mtmmArrMapped = [];

      mtmm2
        .map((value) => ({ val: value.v }))
        .forEach((v) => mtmmArrMapped.push(v.val));

      mtmm2.forEach((v) => mtmmArr.push(v.v));

      expect(mtmmArr).toStrictEqual(mtmmArrMapped);
    });
  });
});
