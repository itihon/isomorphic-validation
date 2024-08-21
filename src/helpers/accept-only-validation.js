export default function accepOnlyValidation(arg) {
  // validation...client... or /validation...server... might have been passed in
  const validation = Object(Object(arg).isomorphic);

  if (validation[Symbol.toStringTag] !== 'Validation') {
    throw new Error('Not a Validation was passed in');
  }

  return validation;
}
