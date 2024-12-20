export default function preventPropNamesClash(src = {}, dst = {}) {
  Object.keys(src).forEach((propName) => {
    if (propName in dst) {
      throw new Error(
        `The property "${propName}" overrides one in ${JSON.stringify(dst)}`,
      );
    }
  });
}
