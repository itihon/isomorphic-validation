import renderEntry from '../helpers/render-entry.js';

const renderProperty =
  (propName = 'msg', toString = renderEntry('')) =>
  (validationResult) =>
    [...validationResult]
      .map((entry) => entry.concat(propName))
      .map(toString)
      .join('');

export default renderProperty;
