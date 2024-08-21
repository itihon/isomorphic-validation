export default function firstEntry(map = new Map()) {
  return map.entries().next().value;
}
