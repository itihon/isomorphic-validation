export default function accepOnlyValidation(arg) {
  if (Object(arg)[Symbol.toStringTag] !== 'Validation') {
    throw new Error('Not a Validation was passed in');
  }
}
