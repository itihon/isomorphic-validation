# TODO


    ## Chores



    ## Features
        - [ ] access to a current validatable value through the validation result
        - [ ] the feature that allows to distinguish whether an optional validation is valid because the values were validated or because they are init values or undefined. May be unnecessary in case the above feature is implemented.
        - [ ] clearing a form field on the server side after the value has been preserved 
        - [x] recreate the form structure on the server side with regard of path. 
        - [x] data-mappers: .dataMapper
        - [ ] ignoreNext parameter to call a predicate regardles of previously set next parameter
        - [x] every validation probably should be a handler/middleware
        - [x] accept Event object in Validation().validate(event). In order to form.addEventListener('change', Validation().validate);
                or maybe Validation().validateForm(form, input|change)
                or maybe Validation().addForm(form, input|change)
                or maybe Validation().subscribe(form, input|change)
                or maybe Validation().listen(form, input|change)
                or maybe Validation.form(selector).validateOn('input') to validate every field on the same event
                or maybe Validation.form(selector)
                            .firstName.validateOn('input')
                            .email.validateOn('change') to validate different fields on different events
        - [ ] Validation().onServer.{API} Validation().onClient.{API} Validation[onBoth].{API}
        - [x] Validation.getForm(selector) or Validation.form(selector)
        - [ ] Representation -> ConsoleRepresentation, Representation -> DOMRepresentation
        - [x]   !consider adding Validation.from() as an immutable analog of .group()
                or maybe something like this 
                Validation.group([], {immutable: true}) or Validation.group([], {clone: true})
                Validation.glue([], {immutable: true}) or Validation.glue([], {clone: true}) 
                [x] Validation.clone(Validation()) to clone a single validation object
        - [ ] !consider for adding firing started and canceled??? and deferred (or delayed) events for debounced predicate
        - [x] optional constraint (when invalid, does not invalidate the Validation object)
                Validation().constraint(Predicate, { optional: true })
                    Possible use case:
                    when we are creating a product, the image constraints are required.
                    when we are editing the product, the image constraints are optional.
            or maybe optional Validation object (does not invalidate the group it is included in)
            or maybe optional Validation should mean it is valid with the value equal to initVal
            and runs predicates only when the value differs from initVal
            in other words: the value either should be empty or conform to the added predicates if not empty
                Validation(obj, propName, initVal, optinal = true)
                    .constraint(predicate1)
                    .constraint(predicate2, { optional: true })
                    .constraint(predicate3, { optional: true })

        - [x] Final decision: 
        - [x] Validation.profile(formSelector, ['formFildNames'], [assossiatedValidations])
                - [x] Maybe it'd be better if ValidationProfile would have validations passed in combained in a grouped validation instead of a collection. Because they have to be grouped later anyway.
                - [x] ValidatableForm
                - [x] getEnv
                - [x] cloning mechanism
            Validation().listen(validatableForm|validatableFormField, 'event', { target: true })
            - [x] Validation().bind(obj, propName, initVal) // !! can be invoked only on SINGLE validations
                - [x] ValidatableItem().setObj(obj, propName, initVal)
                - [x] ManyToManyMap().changeKey(oldKey, newKey)


    ## Refactor

        - [x] rename entities from Validated* to Validatable*.
        - [ ] consider renaming ObserverAnd to something like AndGate
        - [x] Validation.group, Validation.glue to accept validations divided by comma
        - [x] consider moving out the keepValid functionality from ObservablePredicate to ValidatableItem as a decorator after the according e2e tests are written:
            ValidatableItem.keepValid(ObservablePredicate()) or
            ObservablePredicate({decorators: [debounceP, ValidatableItem.keepValid]});

        - [x] ValidatableItem.keepValid([...items], validationResult{isValid})
        - [x] saveLastValid() and retrieveLastValid() into saveValue() and restoreValue()
        - [x] lastValidCBs -> restoredCBs, onLastValid(), keptValid() -> restored()
        - [x] getObj() -> getObject()
        
        - [ ] when two or more validation assosiated with one object grouped into another validation, consider the possibility of merging collections of predicates into one instead of keeping them all in a set.

        - [x] ObservablePredicate should unpack Predicate with valueOf() the same way Predicate does it inside itself while constructing an instance (from the consistency point of view).

        - [x] Remove ValidationBuilder.registry with valueOf() mechanism (for consistency) as it does exactly the same.

        - [x] Debounce should be unpacked in the same fashion as Predicate (i.e. two calls of valueOf())

    ## Tests
        - [ ] merge validation.test.js and index.test.js
        - [x] add a test script to package.json to run browser and node environment tests separately
        - [ ] require/import test to check CJS/ESM compatibility
        - [ ] performance: check what is faster new Set([value]) or new Set().add(value)
        - [ ] grouping.test.js should be in integration tests ?


    ## Bugs
        - [x] validations which are glued after creating a profile. Their grouping validation doesn't know about them being glued.
        - [x] ValidationResult.isValid should not be Validation's state, it should be a result of a particular operation
        - [x] next and invalidate doesn't work after cloning
        - [x] The value from a validatable object should be read immediately after invoking the validate function because when a predicate's execution is deferred the predicate might deal with irrelevant arguments which might be already changed up to the predicate's execution moment. This is crucial especially for the server side execution.
        - [x] debounce functionality should not be applied on the server side.
            check it!!!

    ## Notes

        - When a validated value is equal to its initial value, instead of validating it, maybe it's better to cancel and invalidate all validations.

        - Own pgs is always on the second place in containedGroups. This defines the order of validity callback invokations.

        - When a predicate added with the keepValid option, on every validation with the invalid result, it notifies subscribers twice: first when changed from valid to invalid and then when restores back to the last valid value. It also calls a predicate function twice. Not sure if this is appropriate. See ObservablePredicate integration tests.

        + UPD: removed memoization. On ValidatableItem. After calling setObject on a cloned item, the original item gets erased from the memoize function's registry. Should it be so??? This is a contradiction in logic: on the one hand memoization implies imposibility of existence of two instances of an item constructed with the same parameters, on the other hand in combination with cloning it becomes possible.

        - A predicate added on a glued validation is called twice while validating a group with no object passed in the validate() funciton. Although one call is enough. The second call is unnecessary.

        - When a Validation is bound to a new object after being grouped into another Validation, the grouping Validation doesn't know about it and the former remains assosiated with the old object in the group. Don't bind validations after grouping, do it before!

        - Because of the asyncronous nature of predicates execution and middlewares, the validatable form may be overwritten between predicate or middleware calls. Do not rely on the validatable form's data in middlewares.