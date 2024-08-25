# isomorphic-validation

## An isomorphic data and form validation javascript library which runs the same code both client and server side

## developing

## This is a brief outline of the whole library's API

### Validation instance methods

    Validation(obj, propName, initVal)
        .started(cb)
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .constraint(Predicate()|Function.prototype, { next, debounce, keepValid, optional, ...anyData })
        .bind(obj, propName, initVal)
        .validate(obj)
        .dataMapper((req, form) => {}) // available after creating a profile

### Validation instance properties

    Validation().constraints
    Validation().validations
    Validation().isValid
    Validation().server // isomorphic API
    Validation().client // isomorphic API
    Validation().isomorphic // isomorphic API

### Validation static methods

    Validation.group([Validation(), Validation()])
    Validation.glue([Validation(), Validation()])
    Validation.clone(Validation())
    Validation.profile(selector, [fieldNames], [Validation(), Validation()])

### Predicate instance properties
    
    Predicate(() => true|false|Promise{true|false})
        .started(cb)
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .restored(cb)