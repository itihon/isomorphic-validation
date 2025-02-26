import firstInvalid from './first-invalid.js';
import renderEntry from '../helpers/render-entry.js';

const renderFirstError =
  (errorPropName = 'msg', toString = renderEntry('⚠', errorPropName)) =>
  (validationResult) =>
    [firstInvalid(validationResult)]
      .filter((entry) => entry.length)
      .map(toString)
      .join('');

export default renderFirstError;
