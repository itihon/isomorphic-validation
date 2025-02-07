export const isType = (value, type) =>
  type === Object
    ? Object.getPrototypeOf(Object(value)) === Object.prototype
    : Object(value) instanceof type;

export const getTypeOf = (value) =>
  Object.getPrototypeOf(Object(value)) === Object.prototype
    ? Object
    : Object(value).constructor;
