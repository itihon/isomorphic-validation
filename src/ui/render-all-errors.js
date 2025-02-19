import allInvalid from './all-invalid.js';
import renderItem from '../helpers/render-item.js';

const renderAllErrors =
  (msgPropName = 'msg', rendererFn = renderItem) =>
  (validationResult) =>
    allInvalid(validationResult)
      .map(([obj, validator]) => [obj, validator[msgPropName]])
      .map(rendererFn)
      .join('');

export default renderAllErrors;
