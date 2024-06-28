export default function isFunction(arg) {
  return typeof arg === 'function' && arg.toString().slice(0, 5) !== 'class';
}
