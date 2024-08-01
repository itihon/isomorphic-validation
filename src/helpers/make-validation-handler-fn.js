import { ifSide } from '../utils/getenv.js';

export default function makeValidationHandlerFn(validation, form) {
  return ifSide(
    // server side
    async (req, res, next) => {
      // express middleware
      Object.keys(form).forEach((fieldName) => {
        form[fieldName].value = req.body[fieldName];
      });

      req.validationResult = await validation.validate();

      next();
    },

    // client side
    async (e) => {
      await validation.validate(e.target);
    },
  );
}
