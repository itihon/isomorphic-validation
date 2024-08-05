export default function acceptOnlyBoolean(value) {
  if (typeof value !== 'boolean') {
    throw new Error(
      'The returned value of a predicate must be a Boolean ' +
        'or a Promise that resolves to a Boolean.',
    );
  }
}
