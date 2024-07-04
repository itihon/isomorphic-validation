# TODO


    ## Chores

        - [ ] change double quotes to single quotes in eslint.config.mjs and try to amend the commit in which eslint have been configured

        - [ ] remove test commit


    ## Features

        - [ ] add boolean parameter clone with default value true to the group and glue functions (group([validations], clone = true))


    ## Refactor

        - [ ] consider renaming ObserverAnd to something like AndGate
        - [x] consider moving out the keepValid functionality from ObservablePredicate to ValidatedItem as a decorator after the according e2e tests are written:
            ValidatedItem.keepValid(ObservablePredicate()) or
            ObservablePredicate({decorators: [debounceP, ValidatedItem.keepValid]});

        - [x] ValidatedItem.keepValid([...items], validationResult{isValid})
        - [x] saveLastValid() and retrieveLastValid() into saveValue() and restoreValue()
        - [x] lastValidCBs -> restoredCBs, onLastValid(), keptValid() -> restored()
        - [x] getObj() -> getObject()
        

    ## Tests

        - [ ] require/import test to check CJS/ESM compatibility


    ## Bugs

        - [ ] debounce functionality should not be applied on the server side.
            check it!!!

    ## Notes

        - When a predicate added with the keepValid option, on every validation with the invalid result, it notifies subscribers twice: first when changed from valid to invalid and then when restores back to the last valid value. It also calls a predicate function twice. Not sure if this is appropriate. See ObservablePredicate integration tests.
