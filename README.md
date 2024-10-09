# isomorphic-validation

## An isomorphic data and form validation javascript library which runs the same code both client and server side

<img src="./isomorphic-validation_smaller.gif" alt="isomorphic validation" width="550" height="700">

## developing

## This is a brief outline of the whole library's API

### Validation instance methods

```js
    Validation(obj, propName, initVal)
        .started(cb)
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .error(cb)
        .constraint(Predicate()|Function.prototype, { next, debounce, keepValid, optional, ...anyData })
        .bind(obj, propName, initVal)
        .dataMapper((req, form) => {}) 
        .validate(obj)
```


### Validation instance properties

```js
    Validation().constraints
    Validation().validations
    Validation().isValid
    Validation().server // isomorphic API
    Validation().client // isomorphic API
    Validation().isomorphic // isomorphic API
```

### Validation static methods

```js
    Validation.group([Validation(), Validation()])
    Validation.glue([Validation(), Validation()])
    Validation.clone(Validation())
    Validation.profile(selector, [fieldNames], [Validation(), Validation()])
```

### Predicate instance methods

```js  
    Predicate(() => true|false|Promise{true|false})
        .started(cb)
        .valid(cb)
        .invalid(cb)
        .changed(cb)
        .validated(cb)
        .restored(cb)
        .error(cb)
```

### Predicate instance properties

```js
    Predicate().server // isomorphic API
    Predicate().client // isomorphic API
    Predicate().isomorphic // isomorphic API
```