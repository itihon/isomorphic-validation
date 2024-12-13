export default function ManyToManyMap() {
  const values = new Set(); // for faster access to all unique values
  const map = new Map();
  const orderedSet = new Set(); // for consistency of mapping and merging order

  const api = {
    add(key, value, keepOrder = true) {
      values.add(value);

      if (map.has(key)) {
        const set = map.get(key);
        const { size } = set;

        set.add(value);

        if (size !== set.size) {
          if (keepOrder) orderedSet.add([key, value]);
        }
      } else {
        map.set(key, new Set().add(value));
        if (keepOrder) orderedSet.add([key, value]);
      }

      return this;
    },
    changeKey(oldKey, newKey) {
      if (oldKey === newKey) {
        throw new Error('Old key must not be the same as new key');
      }
      if (map.has(oldKey)) {
        map.get(oldKey).forEach((value) => api.add(newKey, value, false));
        map.delete(oldKey);
        orderedSet.forEach((entry) => {
          if (entry[0] === oldKey) {
            entry[0] = newKey;
          }
        });
      } else {
        throw new Error('There is no such old key');
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
      orderedSet.forEach(([key, value]) => {
        cbfunction(value, key, map);
      });
    },
    map(cbfunction = (/* value, key, values */) => {}) {
      const mtmm = ManyToManyMap();
      this.forEach((value, key, valuesSet) =>
        mtmm.add(key, cbfunction(value, key, valuesSet)),
      );
      return mtmm;
    },

    has: map.has.bind(map),
    get: map.get.bind(map),
    keys: map.keys.bind(map),
    values: map.values.bind(map),
    entries: map.entries.bind(map),
    [Symbol.iterator]: map[Symbol.iterator].bind(map),
  };

  Object.defineProperties(api, {
    [Symbol.toStringTag]: {
      value: ManyToManyMap.name,
      configurable: true,
    },
    size: { get: () => map.size },
  });

  Reflect.setPrototypeOf(api, map);

  return api;
}
