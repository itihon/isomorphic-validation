const renderItem =
  (icon = '') =>
  ([, content]) =>
    `<div>${icon ? `<span>${icon}</span> ` : ''}${content}</div>`;

export default renderItem;
