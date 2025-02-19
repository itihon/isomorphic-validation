import firstInvalid from './first-invalid.js';
import renderItem from '../helpers/render-item.js';

const renderFirstError =
  (msgPropName = 'msg', rendererFn = renderItem('⚠')) =>
  (validationResult) =>
    [firstInvalid(validationResult)]
      .map(([obj, validator]) => [obj, validator[msgPropName]])
      .map(rendererFn)
      .join('');

export default renderFirstError;
