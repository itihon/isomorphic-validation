export default function CloneRegistry() {
  const cloneRegistry = new Map();
  const retrieveIfHas = (item, factoryFn) =>
    cloneRegistry.get(item) || cloneRegistry.set(item, factoryFn()).get(item);

  return {
    cloneOnce(item, registry) {
      return retrieveIfHas(item, () => item.clone(registry));
    },
    cloneMapOnce(items = [], registry = CloneRegistry()) {
      return retrieveIfHas(items, () =>
        items.map((item) => registry.cloneOnce(item, registry)),
      );
    },
  };
}
