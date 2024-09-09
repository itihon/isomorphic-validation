export default function runPredicatesQueue(
  predicates = [][Symbol.iterator](),
  nexts = [][Symbol.iterator](),
  itemsToCheck = [],
) {
  const promises = [];
  let resolve;
  let reject;

  const finish = () =>
    Promise.all(promises).then((results) => resolve(results));

  const runPromiseQueue = (predicateIt, nextIt) => {
    let promise;
    let predicate;

    while ((predicate = predicateIt.next().value)) {
      try {
        promises.push(
          (promise = Promise.resolve(predicate(...itemsToCheck)).catch(reject)),
        );
      } catch (err) {
        reject(err);
        return;
      }

      if (!nextIt.next().value) {
        promise.then((pRes) =>
          pRes ? runPromiseQueue(predicateIt, nextIt) : finish(),
        );
        return;
      }
    }
    finish();
  };

  const retVal = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  runPromiseQueue(predicates[Symbol.iterator](), nexts[Symbol.iterator]());

  return retVal;
}
