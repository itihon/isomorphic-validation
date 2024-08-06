const pathError = (obj, path) => {
  throw new Error(
    `There is no path '${path}' in object ${JSON.stringify(obj)}`,
  );
};

const traverse = (object, propName) => object[propName];

export default function getByPath(
  obj = {},
  path = '',
  delim = '.',
  isPath = path.includes(delim),
) {
  if (isPath) {
    try {
      // ! split it in ValidatableItem in init()
      return path.split(delim).reduce(traverse, obj);
    } catch {
      pathError(obj, path);
    }
  }
  return obj[path];
}
