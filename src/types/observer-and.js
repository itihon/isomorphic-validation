import preventCyclicSubscription from '../helpers/prevent-cyclic-subscription.js';
import Functions from './functions.js';

export default function ObserverAnd(initVal = false) {
  if (!ObserverAnd.slotCount) {
    ObserverAnd.slotCount = 0;
  }

  const ID = ++ObserverAnd.slotCount;
  const onChangedCBs = Functions();
  const slots = new Map().set(ID, initVal);

  let sum = initVal ? ID : 0;
  let depSum = ID;
  let ownValue = sum === depSum;
  let oldValue = initVal;

  return {
    subscribe(subject = ObserverAnd()) {
      const subjectID = subject.getID();

      preventCyclicSubscription(ID, subjectID);

      if (!slots.has(subjectID)) {
        depSum += subjectID;
        slots.set(subjectID, false);
        subject.onChanged(this.update);
        this.update(subject.getValue(), undefined, subjectID);

        // unsubscribe from ourselves
        // from now on our own state depends only on the subjects
        if (slots.has(ID)) {
          this.update(true);
          slots.delete(ID);
        }
      }
      return this;
    },
    update(value = false, args = undefined, id = ID) {
      if (value === true) {
        if (slots.get(id) === false) {
          sum += id;
          slots.set(id, value);
        }
      } else if (slots.get(id) === true) {
        sum -= id;
        slots.set(id, value);
      }

      oldValue = ownValue;
      ownValue = sum === depSum;

      if (ownValue !== oldValue) {
        onChangedCBs.run(value, args, ID);
      }

      return ownValue;
    },
    getID() {
      return ID;
    },
    getValue: () => ownValue,
    onChanged: onChangedCBs.push,
    [Symbol.toStringTag]: ObserverAnd.name,
  };
}
