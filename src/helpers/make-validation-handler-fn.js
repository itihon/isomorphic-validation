import { ifSide } from '../utils/getenv.js';

export default function makeValidationHandlerFn(form, validation) {
  return ifSide(
    // server side
    async (req, res, next) => {
      // express middleware
      // body-parser-mapper
      const { body } = req;
      Object.keys(body).forEach((fieldName) => {
        form[fieldName].value = body[fieldName];
      });

      req.validationResult = await validation.validate();

      next();
    },

    // client side
    async (e) => {
      await validation.validate(e ? e.target : undefined);
    },
  );
}
