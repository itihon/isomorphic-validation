import retrieveIfHasOrCreate, {
  newMap,
} from '../utils/retrieve-if-has-or-create.js';

const OrderedTwoKeyedMap = () => {
  const map1 = new Map();

  return {
    set(key1, key2, value) {
      const map2 = retrieveIfHasOrCreate(map1, key1, newMap);
      map2.set(key2, value);
      return this;
    },
    get(key1, key2) {
      const map2 = map1.get(key1);
      if (map2) return map2.get(key2);
      return undefined;
    },
  };
};

export default OrderedTwoKeyedMap;
