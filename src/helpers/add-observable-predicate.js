import { SINGLE, GROUPED, GLUED } from '../constants.js';
import Predicate from '../types/predicate.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ObservablePredicate from '../types/observable-predicate.js';

export default function addObservablePredicate(
    predicate = Predicate(), 
    items = ManyToManyMap(),
    {
        TYPE = SINGLE,
        next = true,
        debounce = 0,
        keepValid = false,
        anyData
    } = {}
) {
    if (TYPE === SINGLE || TYPE === GROUPED) {
        return function forSingleOrMulti(predicateGroup, key) {
            predicateGroup.add(
                ObservablePredicate(
                    Predicate(predicate), 
                    [...items.get(key)],
                    keepValid,
                    anyData
                ),
                { next, debounce }
            );
        }
    }

    if (TYPE === GLUED) {
        var op = ObservablePredicate(
            predicate, 
            [...items.getAll()],
            keepValid,
            anyData
        );
        return function forGlued(predicateGroup, key) {
            predicateGroup.add(op, { next, debounce });
        }
    }
};