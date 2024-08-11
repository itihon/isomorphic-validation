import { ifSide } from '../utils/getenv.js';

const defaultMapper = (req, form) => {
  const { body } = req;
  Object.keys(body).forEach((fieldName) => {
    form[fieldName].value = body[fieldName];
  });
};

// express middleware
const createMiddlewareFn = (form, validation, dataMapper) => () => {
  let mapper = dataMapper;

  // defined on a validation for working with makeIsomorphicAPI
  Object.defineProperty(validation, 'dataMapper', {
    value(Mapper) {
      mapper = Mapper;
      return this;
    },
    configurable: true, // to work with Proxy in makeIsomorphicAPI
  });

  return async (req, res, next) => {
    mapper(req, form);
    req.validationResult = await validation.validate();
    next();
  };
};

const createEventHandlerFn = (validation) => () => (event) =>
  validation.validate(event ? event.target : undefined);

export default function makeValidationHandlerFn(form, validation) {
  return ifSide(
    // server side
    createMiddlewareFn(form, validation, defaultMapper),

    // client side
    createEventHandlerFn(validation),
  )();
}
