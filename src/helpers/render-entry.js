const renderEntry =
  (icon = '') =>
  ([, value, itemPropName = '']) =>
    `<div>${icon ? `<span>${icon}</span> ` : ''}${value[itemPropName] || ''}</div>`;

export default renderEntry;
