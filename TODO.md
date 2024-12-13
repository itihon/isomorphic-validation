# TODO


    ## Chores

        - [ ] install rollup dts plugin to bundle type declarations in order to 
            avoid exposing unnecessary types and polluting IntelliSense.


    ## Features
        - [x] consider leaving .forEach method in Representation 
        - [x] implement a custom iterator for Representation [...Validation().constraints] to avoid complecated destructuring syntax so it yields exactly what is needed instead of what it actually contains
        - consider throwing an error if not an options object is passed into Validation().
        - [x] consider change the behavior for the `.validate()` method of a "single" validation so that it uses its own validatable object as the target if the passed in validatableObject is `undefined` and just runs the only predicate group it contains. This would facilitate easier validations chainig in the following way:
            > v1.invalid(() => v2())   -->   v1.invalid(v2)
        - [ ] consider for adding ValidationResult.wasValid
        - [ ] consider for adding `.each` property for adding state callbacks to each validation in a group
        - [x] consider for adding `Validation().initial()` to run callbacks when the validatable value is equal to the initial value
            NOT IMPLEMENTED. REASON: ambiguity in call logic of grouping validations.
        - [x] .error() or .catch() for error handling
        - [ ] access to the current validatable value through the validation result
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
        - [x] Validation().server.{API} Validation().client.{API} Validation[onBoth].{API}
        - [x] Validation.getForm(selector) or Validation.form(selector)
        - [x]   !consider adding Validation.from() as an immutable analog of .group()
                or maybe something like this 
                Validation.group([], {immutable: true}) or Validation.group([], {clone: true})
                Validation.glue([], {immutable: true}) or Validation.glue([], {clone: true}) 
                [x] Validation.clone(Validation()) to clone a single validation object
        - [ ] !consider for adding firing canceled??? and deferred (or delayed) events for debounced predicate
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

        - [x] ObservablePredicate: parameter "target" probably should be passed during creation time since it is known what validatable object the predicate belongs to;
            it will affect: .clone(), Validation.bind() methods.
        - [-] parameter "optional"
            [x] Validation(obj { path: 'value', initialValue: '', optional: false });
            [x] Validation().bind(obj { path: 'value', initialValue: '' });
            [x] d.ts signature of Validation() and Validation().bind()
            [x] d.ts signature of Validation().constraint()
            [x] move "optional" logic from `ObservablePredicate` to an upper level, possibly to `ObservablePredicates` to make the whole group "optional" instead of predicates.
            `ObservablePredicates` should be "aware" of `ValidatableItem`.
            ObservablePredicates().clone() method will be affected
            Validation().bind() method will be affected
            [x] change documentation accordingly 
                [x] Validation(), [x] Validation().bind(), [x] Validation.constraint()
        - [ ] remove default parameters that are used only as type hints and add jsdoc instead. It may result in less file size after minimization.
        - [ ] rename src to lib, src/types to lib/entities
        - [ ] move all error files from the helpers folder into one module Errors.
        - [ ] makeValidationHandlerFn wraps validations twice: first in ValidationBuilder, second in createProfile(). Rewrite so that it happens once.
        Probably, it would be needed to add a method to ValidationBuilder for adding a form.
        - [ ] since Validation instance is a middleware/event handler, it is better to rename its .bind method to something else to avoid conflicting with Function.prototype.bind
        - [ ] think through if it is possible to completely get rid of memoization of ValidationBuilder in the clone function and use CloneRegestry instead
        - [x] rename entities from Validated* to Validatable*.
        - [ ] consider renaming ObserverAnd to something like AndGate
        - [ ] consider using the .isValid property of a group in the .run method of PredicateGroups in order to avoid iterating over the result loop. Like this:
                id !== undefined ? obs.isValid : group.isValid;
        const predicateGroups = id !== undefined ? pgs.get(id) : pgs.getAll();
        - [ ] consider renaming ValidityCallbacks to ValidityEvents
        - [x] Validation.group, Validation.glue to accept validations divided by comma
        - [x] consider moving out the keepValid functionality from ObservablePredicate to ValidatableItem as a decorator after the according e2e tests are written:
            ValidatableItem.keepValid(ObservablePredicate()) or
            ObservablePredicate({decorators: [debounceP, ValidatableItem.keepValid]});

        - [x] ValidatableItem.keepValid([...items], validationResult{isValid})
        - [x] saveLastValid() and retrieveLastValid() into saveValue() and restoreValue()
        - [x] lastValidCBs -> restoredCBs, onLastValid(), keptValid() -> restored()
        - [x] getObj() -> getObject()
        
        - [ ] consider using containedPgs for validation instead of ownPgs, this will allow to implement .started method in Validation.

        - [x] ObservablePredicate should unpack Predicate with valueOf() the same way Predicate does it inside itself while constructing an instance (from the consistency point of view).

        - [x] Remove ValidationBuilder.registry with valueOf() mechanism (for consistency) as it does exactly the same.

        - [x] Debounce should be unpacked in the same fashion as Predicate (i.e. two calls of valueOf())

    ## Tests

        - [ ] ...anyData
        - [ ] `Validation.bind()` with options "{ path, initVal }"
        - [ ] adding state callbacks to a "validator" of different "glued" validations. It probably should be the same instance: 
        Validation.glue(Validation(), Validation())
            .constraint(() => true)
            .constraints.forEach((set, key) => set.forEach(
                validator => validator
                    .validated(() => {})
            ))
        should add a validated state callback twice to the same validator. (in comparison to a "grouped" validations, one to each)

        - [ ] chaining validations
            .error() catching errors in chained validations
        - [ ] performance: makeIsomorphicAPI current version vs proxying the whole API object 
        - [ ] performance: Validation() with and without makeIsomorphicAPI()
        - [ ] merge validation.test.js and index.test.js
        - [x] add a test script to package.json to run browser and node environment tests separately
        - [ ] require/import test to check CJS/ESM compatibility
        - [ ] performance: check what is faster new Set([value]) or new Set().add(value)
        - [ ] grouping.test.js should be in integration tests ?
        - [ ] When `Validation` containing a few predicates was validated and is valid, add another constraint, the `Validation` must become invalid unless the constraint is optional.


    ## Bugs

        - [ ] Validation.group() and Validation.glue() methods should throw if nothing is passed in.
        - [ ] http://localhost:4321/isomorphic-validation-docs/api/validation/static-methods/glue/#validating-one-field-depending-on-another
        method .error() does not catch the error in state callbacks (target undefined)
        - [ ] when a validatable object doesn't have a one level path it does not throw an error.
        Instead, undefined is passed to predicates. Validation({}, 'prop1').validate() - doesn't throw an error, Validation({}, 'prop1.prop2').validate() - throws an error.
        - [ ] typescript incorrectly infers the type of an imported validation which comes from array destructuring.
        - [x] missed argument that should be passed to changed cbs for Validation and Predicate
        - [x] validations which are glued after creating a profile. Their grouping validation doesn't know about them being glued.
        - [x] ValidationResult.isValid should not be Validation's state, it should be a result of a particular operation
        - [x] next and invalidate doesn't work after cloning
        - [x] The value from a validatable object should be read immediately after invoking the validate function because when a predicate's execution is deferred the predicate might deal with irrelevant arguments which might be already changed up to the predicate's execution moment. This is crucial especially for the server side execution.
        - [x] debounce functionality should not be applied on the server side.
            check it!!!
        - [x] Optional predicates should be valid by default. Temporarily fixed. See the comment in observable-predicate.js REFACTORED.
        - [ ] The `.error()` method should accept an errorStateCallback in validation.d.ts and predicate.d.ts
        - [x] A predicated added with the option keepValid=true runs started state callback twice (second time after the restored state callback)

    ## Notes

        - The parameter "next" when one predicate invalidates another: should an invalidated predicate invoke its state callbacks??? Probably only "changed" state callbacks should be invoked in this case, because "started", "valid", "invalid", "validated" are called when Validation().validate() method is called.

        - changed callback invokations have a slightly different order for original validation group and its clone. See grouping.test.js

        - When a validated value is equal to its initial value, instead of validating it, maybe it's better to cancel and invalidate all validations.

        - When a predicate added with the keepValid option, on every validation with the invalid result, it notifies subscribers twice: first when changed from valid to invalid and then when restores back to the last valid value. It also calls a predicate function twice. Not sure if this is appropriate. See ObservablePredicate integration tests.

        + UPD: removed memoization. On ValidatableItem. After calling setObject on a cloned item, the original item gets erased from the memoize function's registry. Should it be so??? This is a contradiction in logic: on the one hand memoization implies imposibility of existence of two instances of an item constructed with the same parameters, on the other hand in combination with cloning it becomes possible.

        - A predicate added on two glued validations is called 4 times (twice on each) while validating a group with no object passed in the validate() function. Although one call is enough. The rest are unnecessary. This is because two instances of ObservablePredicate are called in each predicate group (ObservablePredicates). Glued predicate groups can not have the same instance of ObservablePredicate because any of them can possibly be optional ("valid" by default, therefore all predicates added to it also should be "valid" by default whereas non-optional are "invalid").

        - When a Validation is bound to a new object after being grouped into another Validation, the grouping Validation doesn't know about it and the former remains assosiated with the old object in the group. Don't bind validations after grouping, do it before!

        - Because of the asyncronous nature of predicates execution and middlewares, the validatable form may be overwritten between predicate or middleware calls. Do not rely on the validatable form's data in middlewares.

        - The returned value of the isomorphic protocol properties (.client/.server) and ignored functions shouldn't be assigned and used anywhere but in the libriry's methods since the library knows how to deal with this protocol. Use the original object or .isomorphic property instead.

        - When you add error state callbacks to validations and then group them and validate through the grouping validation, an error will not be catched. Error state callbacks must be added to a validation on which the `.validate()` method is called or which is used as middleware/event handler (the grouping validation in this case). Grouping validation doesn't invoke the `.validate()` method of the grouped validations.

        - The parameter next=false cancels the execution of the predicates following after the current one and invalidates them every time the current one gets invalid. Probably a more optimized way would be if it would happen only on state change from valid to invalid.

        - Once a predicate added with the parameter next=false gets valid, predicates added with the parameter "debounce" following after it start getting invoked, and after their deferred execution their state callbacks are called as many times as the debounced predicates were called even though the deferred execution was only one. The state callbacks invokation number of time probably should be considered as one invokation. So this behavious needs to be changed.

        - A predicate added with the parameter next=false when invalid first invalidates the predicates following after it causing their invalid state callbacks to be invoked and then causes its own invalid state callback to be invoked.