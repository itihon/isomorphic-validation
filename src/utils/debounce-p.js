// !consider for adding firing canceled??? and deferred (or delayed) events
export default function debounceP (fn = Function.prototype, delay = 0) {
    var timeout, promise, resolver = () => {};
    const suffix = '_DP';
    const debouncedFnName = fn.name + suffix;
    const deferredFn = (...args) => { resolver(fn(...args)); promise = null; };
    const debouncedFn = {
        [debouncedFnName]: (...args) => {
            clearTimeout(timeout);
            
            timeout = setTimeout(deferredFn, delay, ...args);

            return promise || 
                (promise = new Promise((res, rej) => resolver = res));
        },
    }[debouncedFnName];  
    
    debouncedFn.cancel = () => { 
        clearTimeout(timeout); 
        resolver();
        promise = null;
    };

    debouncedFn.valueOf = () => fn;

    return debouncedFn;
};