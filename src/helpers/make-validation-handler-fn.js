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

  const middleware = async (req, res, next) => {
    mapper(req, form);
    req.validationResult = await validation.validate();
    next();
  };

  return Object.defineProperty(middleware, 'dataMapper', {
    value: (Mapper) => {
      mapper = Mapper;
    },
  });
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
