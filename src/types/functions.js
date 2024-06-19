import isFunction from '../utils/is-function.js';

export default function Functions(iterable = [][Symbol.iterator]()) {
    
    function push(...args) {
        Array.prototype.push.call(fns, ...args.filter(isFunction));
        return this;
    }

    var fns = [...iterable].filter(isFunction);

    // !Object assign takes less lines of code.
    // rewrite as in ManyToManyMap
    return Object.defineProperties(
        fns,
        {
            push: {
                value: push,
            },
            run: {
                value: function (...args) {
                    return fns.map(fn => fn(...args));
                },
            },
            [Symbol.toStringTag]: {
                value: Functions.name,
            },
        }
    );
};