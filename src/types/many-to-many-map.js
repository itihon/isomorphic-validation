/**
 * @typedef {Object} MapOfSets
 * @property {(key, value) => ManyToManyMap} add
 * @property {() => Set} getAll
 * @property {(mtmm: ManyToManyMap) => ManyToManyMap} mergeWith
 * @property {(cb: (value, key, values: ManyToManyMap) => void) => void} forEach
 * @property {(cb: (value, key, values: ManyToManyMap) => any) => ManyToManyMap} map
 */

/**
 * @typedef {MapOfSets & Map} ManyToManyMap
 */

/**
 * @returns {ManyToManyMap}
 */

export default function ManyToManyMap() {
  const values = new Set();
  // const map = new class extends Map {};
  const map = new Map();

  Object.defineProperties(map, {
    [Symbol.toStringTag]: {
      value: ManyToManyMap.name,
      configurable: true,
    },
  });

  return Object.assign(map, {
    add(key, value) {
      values.add(value);

      if (map.has(key)) {
        map.get(key).add(value);
      } else {
        map.set(key, new Set().add(value));
      }

      return this;
    },
    getAll() {
      return values;
    },
    mergeWith(mtmm = ManyToManyMap()) {
      mtmm.forEach((value, key) => this.add(key, value));
      return this;
    },
    forEach(cbfunction = (/* value, key, values */) => {}) {
      // ! Eslint disliked this code, but for-loops should run faster than forEach
      // for (const {0:key, 1:set} of map) {
      //     for (const value of set) {
      //         cbfunction(value, key, map);
      //     }
      // }

      map.constructor.prototype.forEach.call(map, (set, key) => {
        set.forEach((value) => {
          cbfunction(value, key, map);
        });
      });
    },
    map(cbfunction = (/* value, key, values */) => {}) {
      const mtmm = ManyToManyMap();
      this.forEach((value, key, valuesSet) =>
        mtmm.add(key, cbfunction(value, key, valuesSet)),
      );
      return mtmm;
    },
  });
}
