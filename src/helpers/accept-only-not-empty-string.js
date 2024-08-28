export default function acceptOnlyNotEmptyString(value) {
  if (typeof value !== 'string' || value.length < 1) {
    throw new Error('Form field name must be a not empty string.');
  }

  return value;
}
