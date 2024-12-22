export default function acceptOnlyPredicate(value) {
  if (Object(value)[Symbol.toStringTag] !== 'Predicate') {
    throw new Error('Not a Predicate was passed in.');
  }
  return value;
}
