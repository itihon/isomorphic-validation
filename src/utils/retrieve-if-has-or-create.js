const retrieveIfHasOrCreate = (map, key, creatorFn, ...args) => {
  if (!map.has(key)) {
    map.set(key, creatorFn(...args));
  }
  return map.get(key);
};

export default retrieveIfHasOrCreate;
