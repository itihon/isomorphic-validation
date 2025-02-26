import firstInvalid from './first-invalid.js';
import renderEntry from '../helpers/render-entry.js';

const renderFirstError =
  (errorPropName = 'msg', toString = renderEntry('⚠', errorPropName)) =>
  (validationResult) =>
    [firstInvalid(validationResult)].map(toString).join('');

export default renderFirstError;
