// const randomID = (prefix = '') => prefix + (Math.random()*1e6).toString().replace('.', '_');
export default (function indexedName() {
  let counter = 0;
  return (name = '', delim = '_') => name + delim + counter++;
})();
