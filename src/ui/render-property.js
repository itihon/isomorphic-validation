import renderItem from '../helpers/render-item.js';

const renderProperty =
  (propName = 'msg', rendererFn = renderItem()) =>
  (validationResult) =>
    [...validationResult]
      .map(([obj, validator]) => [obj, validator[propName]])
      .map(rendererFn)
      .join('');

export default renderProperty;
