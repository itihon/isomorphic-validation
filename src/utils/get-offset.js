export default function getOffset(htmlElement) {
  let offsetLeft = 0;
  let offsetTop = 0;
  let element = htmlElement;
  const { offsetParent } = element;

  do {
    const { parentNode: parent } = element;
    const { offsetLeft: childX, offsetTop: childY } = element;
    const {
      offsetLeft: parentX,
      offsetTop: parentY,
      scrollLeft: parentScrollX,
      scrollTop: parentScrollY,
    } = parent;

    if (parent !== offsetParent) {
      offsetLeft += childX - parentX - parentScrollX;
      offsetTop += childY - parentY - parentScrollY;
    } else {
      offsetLeft += childX;
      offsetTop += childY;
    }

    element = parent;
  } while (element !== offsetParent);

  return { offsetLeft, offsetTop };
}
