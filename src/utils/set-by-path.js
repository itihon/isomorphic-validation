export default function setByPath(
  obj = {},
  path = '',
  value = '',
  delim = '.',
  isPath = path.includes(delim),
) {
  if (isPath) {
    const arr = path.split(delim);
    const lastIdx = arr.length - 1;

    arr.reduce((object, propName, idx) => {
      if (idx === lastIdx) {
        object[propName] = value;
      }
      return object[propName];
    }, obj);
  } else {
    obj[path] = value;
  }
}
