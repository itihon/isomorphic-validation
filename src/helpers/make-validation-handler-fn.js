import { ifSide } from '../utils/getenv.js';
import isFunction from '../utils/is-function.js';

const defaultMapper = (req, form) => {
  const { body } = req;
  Object.keys(body).forEach((fieldName) => {
    form[fieldName].value = body[fieldName];
  });
};

// express middleware
const createMiddlewareFn = (form, validation, dataMapper) => () => {
  let mapper = dataMapper;

  Object.defineProperty(validation, 'dataMapper', {
    value(Mapper) {
      if (!form) {
        throw new Error(
          'Calling the dataMapper method on a validation' +
            ' that is not associated with a form. ' +
            'Create a validation profile first.',
        );
      }

      if (!isFunction(Mapper)) {
        throw new Error('The data mapper must be a function.');
      }

      mapper = Mapper;
      return this;
    },
    configurable: true, // to work with Proxy in makeIsomorphicAPI
  });

  if (!form) {
    return () => {
      throw new Error(
        'Using a validation as a middleware' +
          ' that is not associated with a form. ' +
          'Create a validation profile first.',
      );
    };
  }

  return async (req, res, next) => {
    mapper(req, form);
    req.validationResult = await validation.validate();
    next();
  };
};

const createEventHandlerFn = (validation) => () => {
  Object.defineProperty(validation, 'dataMapper', {
    value() {
      const { warn } = console;
      warn('The dataMapper method does nothing on the client side');
      return this;
    },
    configurable: true, // to work with Proxy in makeIsomorphicAPI
  });

  return (event) => validation.validate(event ? event.target : undefined);
};

const makeValidationHandlerFn = (form) => (validation) => {
  const middleware = ifSide(
    // server side
    createMiddlewareFn(form, validation, defaultMapper),

    // client side
    createEventHandlerFn(validation),
  )();
  Reflect.setPrototypeOf(middleware, validation);
  return middleware;
};

export default makeValidationHandlerFn;
