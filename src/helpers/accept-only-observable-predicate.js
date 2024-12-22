export default function acceptOnlyObservablePredicate(value) {
  if (Object(value)[Symbol.toStringTag] !== 'ObservablePredicate') {
    throw new Error('Not an ObservablePredicate was passed in.');
  }
  return value;
}
