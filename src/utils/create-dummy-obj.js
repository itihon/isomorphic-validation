export default function createDummyObj(fromObj) {
  return new Proxy(
    fromObj != null
      ? Object(fromObj)
      : Object.defineProperty(() => createDummyObj(), 'name', {
          writable: true,
        }),
    {
      get(target, property, receiver) {
        if (!Reflect.has(target, property)) {
          Reflect.defineProperty(target, property, {
            writable: true,
            value: createDummyObj(),
          });
          Reflect.defineProperty(target, Symbol.toPrimitive, {
            writable: true,
            value: () => '',
          });
        }
        return Reflect.get(target, property, receiver);
      },
    },
  );
}
