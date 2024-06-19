import { SINGLE } from "../constants.js";
import PredicateGroups from "./predicate-groups.js";
import ManyToManyMap from "./many-to-many-map.js";
import ConsoleRepresentation from "./console-representation.js";
import Predicate from "./predicate.js";
import addObservablePredicate from '../helpers/add-observable-predicate.js';

export default function ValidationBuilder({
    pgs = PredicateGroups(),
    items = ManyToManyMap(),
    containedGroups = new Set(),
    TYPE = SINGLE,
    validations = [],
} = {}) {

    const representation = ConsoleRepresentation(
        'Validation',
        {
            constraint(
                predicate = Predicate(),
                {
                    next = true,
                    debounce = 0,
                    // !! consider moving it out since it is not the library's concern
                    keepValid = false,
                    ...anyData
                } = {}
            ) {
                predicate = Predicate(predicate);
                pgs.forEach(
                    addObservablePredicate(
                        predicate, 
                        items, 
                        { TYPE, next, debounce, keepValid, anyData }
                    )
                );
                return this;
            },
            validate(target) {
                return pgs
                    .run(target)
                    .then(
                        res => {
                            // !!! duplicate of logic
                            (
                                containedGroups.get(target) ||
                                containedGroups.getAll()
                            ).forEach(
                                containedPgs => {
                                    containedPgs.runCBs(
                                        containedPgs.isValid, 
                                        containedPgs.toRepresentation(target)
                                    );
                                }
                            );

                            return pgs.toRepresentation(target);
                        }
                    );
            },
            //constraints: new Map(pgs.toRepresentation()),
            constraints: pgs.toRepresentation(),
            validations: new Set(validations),
            valid: pgs.valid,
            invalid: pgs.invalid,
            changed: pgs.changed,
            validated: pgs.validated,
            // !consider for adding: started
        },
        {
            isValid: Object.getOwnPropertyDescriptor(pgs, 'isValid')
        }
    );
    
    return ValidationBuilder.registry.set(
        Object.freeze(representation),
        { pgs, items, containedGroups }
    );
};

ValidationBuilder.registry = (function createRegistry() {
    const registry = new Map();

    return {
        set(id, value) {
            registry.set(id, value);
            return id;
        },
        get(id) {
            return registry.get(id);
        }
    };
})();