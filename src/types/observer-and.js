import Functions from "./functions.js";

export default function ObserverAnd(initVal = false) {
    if (!ObserverAnd.slotCount) {
        ObserverAnd.slotCount = 0;
    }

    const ID = ++ObserverAnd.slotCount;
    const onChangedCBs = Functions();
    const slots = new Map().set(ID, initVal);
    
    var sum = initVal ? ID : 0;
    var depSum = ID;
    var ownValue = sum === depSum;
    
    return {
        subscribe(subject = ObserverAnd()) {
            var subjectID = subject.getID();
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
        update(value = false, args, id = ID) {

            if (value === true) {
                if (slots.get(id) === false) {
                    sum += id;
                    slots.set(id, value);
                }
            } else {
                if (slots.get(id) === true) {
                    sum -= id;
                    slots.set(id, value);
                }
            }
            
            if (ownValue !== (sum === depSum)) {
                onChangedCBs.run(value, args, ID);
            }

            return ownValue = sum === depSum;
        },
        getID() {
            return ID;
        },
        getValue: () => ownValue,
        onChanged: onChangedCBs.push,
        [Symbol.toStringTag]: ObserverAnd.name,
    };
};