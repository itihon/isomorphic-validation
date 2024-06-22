export default function runPredicatesQueue(
  predicates = [][Symbol.iterator](),
  nexts = [][Symbol.iterator](),
  itemsToCheck = [],
) {
  const promises = [];
  let resolve;

  const finish = () =>
    Promise.all(promises).then((results) => resolve(results));

  const runPromiseQueue = (predicateIt, nextIt) => {
    let promise;
    let predicate;

    while ((predicate = predicateIt.next().value)) {
      promises.push((promise = Promise.resolve(predicate(...itemsToCheck))));

      if (!nextIt.next().value) {
        promise.then((pRes) =>
          pRes ? runPromiseQueue(predicateIt, nextIt) : finish(),
        );
        return;
      }
    }
    finish();
  };

  runPromiseQueue(predicates[Symbol.iterator](), nexts[Symbol.iterator]());

  return new Promise((res /* rej */) => {
    resolve = res;
  });
}
