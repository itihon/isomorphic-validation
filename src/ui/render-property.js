import renderEntry from '../helpers/render-entry.js';

const renderProperty =
  (propName = 'msg', toString = renderEntry('', propName)) =>
  (validationResult) =>
    [...validationResult].map(toString).join('');

export default renderProperty;
