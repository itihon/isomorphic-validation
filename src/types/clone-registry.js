import retrieveIfHasOrCreate from '../utils/retrieve-if-has-or-create.js';

export default function CloneRegistry() {
  const cloneRegistry = new Map();

  return {
    cloneOnce(item, registry) {
      return retrieveIfHasOrCreate(cloneRegistry, item, () =>
        item.clone(registry),
      );
    },
    cloneMapOnce(items = [], registry = CloneRegistry()) {
      return retrieveIfHasOrCreate(cloneRegistry, items, () =>
        items.map((item) => registry.cloneOnce(item, registry)),
      );
    },
  };
}
