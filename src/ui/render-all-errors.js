import allInvalid from './all-invalid.js';
import renderEntry from '../helpers/render-entry.js';

const renderAllErrors =
  (errorPropName = 'msg', toString = renderEntry('⚠')) =>
  (validationResult) =>
    allInvalid(validationResult)
      .map((entry) => entry.concat(errorPropName))
      .map(toString)
      .join('');

export default renderAllErrors;
