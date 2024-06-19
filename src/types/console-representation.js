// !think through how to move out same usage of this function 
//  from ObservablePredicate and ObservablePredicates below 
export default function ConsoleRepresentation(
    name = 'Representation', 
    obj = {},
    descriptors = Object.getOwnPropertyDescriptors({})
) {
    return Object.defineProperties(
        Object.defineProperties(obj, descriptors),
        {
            [Symbol.toStringTag]: { value: name, configurable: true },
        }
    );
};

// !JSON representation should be generated in advance.
// ! when toJSON is being called, the representation should be ready to use