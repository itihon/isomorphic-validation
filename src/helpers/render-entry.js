const renderEntry =
  (icon = '', itemPropName = '') =>
  ([, value]) =>
    `<div>${icon ? `<span>${icon}</span> ` : ''}${value[itemPropName]}</div>`;

export default renderEntry;
