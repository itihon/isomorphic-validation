import allInvalid from './all-invalid.js';
import renderEntry from '../helpers/render-entry.js';

const renderAllErrors =
  (errorPropName = 'msg', toString = renderEntry('⚠', errorPropName)) =>
  (validationResult) =>
    allInvalid(validationResult).map(toString).join('');

export default renderAllErrors;
