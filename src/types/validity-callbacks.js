import Functions from "./functions.js";

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
    initVal = false, 
    CBs = ValidityCallbacks(false, {})
) {
    var isValid = initVal;
    var { validCBs, invalidCBs, changedCBs, validatedCBs } = CBs.valueOf();

    validCBs = Functions(validCBs);
    invalidCBs = Functions(invalidCBs);
    changedCBs = Functions(changedCBs);
    validatedCBs = Functions(validatedCBs);

    return {
        set(value = false, cbArgs) {
            value ? validCBs.run(cbArgs) : invalidCBs.run(cbArgs);
            if (isValid !== value) {
                isValid = value;
                changedCBs.run(cbArgs);
            }
            validatedCBs.run(cbArgs);
            return isValid;
        },
        valueOf() {
            return { validCBs, invalidCBs, changedCBs };
        },
        valid: validCBs.push,
        invalid: invalidCBs.push,
        changed: changedCBs.push,
        validated: validatedCBs.push,
        // !consider for adding: validated
        [Symbol.toStringTag]: ValidityCallbacks.name,
    };
};