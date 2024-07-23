# TODO


    ## Chores

        - [ ] change double quotes to single quotes in eslint.config.mjs and try to amend the commit in which eslint have been configured

        - [ ] remove test commit


    ## Features

        - [ ] accept Event object in Validation().validate(event). In order to form.addEventListener('change', Validation().validate);
                or maybe Validation().validateForm(form, input|change)
                or maybe Validation().addForm(form, input|change)
                or maybe Validation().subscribe(form, input|change)
                or maybe Validation().listen(form, input|change)
                or maybe Validation.form(selector).validateOn('input') to validate every field on the same event
                or maybe Validation.form(selector)
                            .firstName.validateOn('input')
                            .email.validateOn('change') to validate different fields on different events
        - [ ] Validation().onServer.{API} Validation().onClient.{API} Validation[onBoth].{API}
        - [ ] Validation.getForm(selector) or Validation.form(selector)
        - [ ] Representation -> ConsoleRepresentation, Representation -> DOMRepresentation
        - [x]   !consider adding Validation.from() as an immutable analog of .group()
                or maybe something like this 
                Validation.group([], {immutable: true}) or Validation.group([], {clone: true})
                Validation.glue([], {immutable: true}) or Validation.glue([], {clone: true}) 
                [x] Validation.clone(Validation()) to clone a single validation object
        - [ ] !consider for adding firing started and canceled??? and deferred (or delayed) events for debounced predicate
        - [ ] optional constraint (when invalid, does not invalidate the Validation object)
                Validation().constraint(Predicate, { optional: true })
            or maybe optional Validation object (does not invalidate the group it is included in)
            or maybe optional Validation should mean it is valid with the value equal to initVal
            and runs predicates only when the value differs from initVal
            in other words: the value either should be empty or conform to the added predicates if not empty
                Validation(obj, propName, initVal, optinal = true)
        - [ ] taking object's value as initial value when creating a new Validation (may be used for adding the optional constraint feature)

        - [ ] Final decision: 
            Validation.profile(formSelector, ['formFildNames'], [assossiatedValidations])
                - [ ] ValidatedForm
                - [ ] getEnv
                - [x] cloning mechanism
            Validation().listen(validatedForm|validatedFormField, 'event', { target: true })
            - [x] Validation().bind(obj, propName, initVal) // !! can be invoked only on SINGLE validations
                - [x] ValidatedItem().setObj(obj, propName, initVal)
                - [x] ManyToManyMap().changeKey(oldKey, newKey)


    ## Refactor

        - [ ] consider renaming ObserverAnd to something like AndGate
        - [x] Validation.group, Validation.glue to accept validations divided by comma
        - [x] consider moving out the keepValid functionality from ObservablePredicate to ValidatedItem as a decorator after the according e2e tests are written:
            ValidatedItem.keepValid(ObservablePredicate()) or
            ObservablePredicate({decorators: [debounceP, ValidatedItem.keepValid]});

        - [x] ValidatedItem.keepValid([...items], validationResult{isValid})
        - [x] saveLastValid() and retrieveLastValid() into saveValue() and restoreValue()
        - [x] lastValidCBs -> restoredCBs, onLastValid(), keptValid() -> restored()
        - [x] getObj() -> getObject()
        
        - [ ] when two or more validation assosiated with one object grouped into another validation, consider the possibility of merging collections of predicates into one instead of keeping them all in a set.

        - [x] ObservablePredicate should unpack Predicate with valueOf() the same way Predicate does it inside itself while constructing an instance (from the consistency point of view).

        - [x] Remove ValidationBuilder.registry with valueOf() mechanism (for consistency) as it does exactly the same.

        - [x] Debounce should be unpacked in the same fashion as Predicate (i.e. two calls of valueOf())

    ## Tests

        - [x] add a test script to package.json to run browser and node environment tests separately
        - [ ] require/import test to check CJS/ESM compatibility
        - [ ] performance: check what is faster new Set([value]) or new Set().add(value)
        - [ ] grouping.test.js should be in integration tests


    ## Bugs

        - [ ] debounce functionality should not be applied on the server side.
            check it!!!

    ## Notes

        - Own pgs is always on the second place in containedGroups. This defines the order of validity callback invokations.

        - When a predicate added with the keepValid option, on every validation with the invalid result, it notifies subscribers twice: first when changed from valid to invalid and then when restores back to the last valid value. It also calls a predicate function twice. Not sure if this is appropriate. See ObservablePredicate integration tests.

        - Binding Validation with a validated object makes more sense in validation profiles because each profile may have a form with it's own unique selector (e.g. #signin_form, #signup_form). Also having different form objects on the server is nessessary.
        Consider to add this feature. Validation().bindObj(obj, propName, initVal)

        - On ValidatedItem. After calling setObject on a cloned item, the original item gets erased from the memoize function's registry. Should it be so??? This is a contradiction in logic: on the one hand memoization implies imposibility of existence of two instances of an item constructed with the same parameters, on the other hand in combination with cloning it becomes possible.