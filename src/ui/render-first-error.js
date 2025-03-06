import firstInvalid from './first-invalid.js';
import renderEntry from '../helpers/render-entry.js';

const renderFirstError =
  (errorPropName = 'msg', toString = renderEntry('⚠')) =>
  (validationResult) =>
    [firstInvalid(validationResult)]
      .filter((entry) => entry.length)
      .map((entry) => entry.concat(errorPropName))
      .map(toString)
      .join('');

export default renderFirstError;
