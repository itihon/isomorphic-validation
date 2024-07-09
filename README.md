# isomorphic-validation

## An isomorphic data and form validation javascript library which runs the same code both client and server side

## being developed

## This is a brief outline of the whole library's API

### Validation instance methods

    Validation(obj, propName, initVal)
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .constraint(Predicate()|Function.prototype, { next, debounce, keepValid })
        .validate(obj)

### Validation instance properties

    Validation().constraints
    Validation().validations
    Validation().isValid

### Validation static methods

    Validation.group([Validation(), Validation()])
    Validation.glue([Validation(), Validation()])

### Predicate instance properties
    
    Predicate(() => true|false|Promise{true|false})
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .restored(cb)