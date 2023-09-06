import Joi from 'joi';

export const productSchema = Joi.object().keys({
  name: Joi.string().required(),
  departments: Joi.array().items(Joi.string()),
  // @ts-ignore
  avatar: Joi.string().required().error((errors) => {
    errors.forEach((err) => {
      switch (err.code) {
        // @ts-ignore
        case 'any.empty':
          // eslint-disable-next-line no-param-reassign
          err.message = 'The \'avatar\' field cannot be empty';
          break;
        default:
          break;
      }
    });
    return errors;
  }),
  productId: Joi.string(),
  productIds: Joi.array().min(1),
  options: Joi.array().items(Joi.object().keys({
    category: Joi.string().required(),
    value: Joi.string().required(),
    image: Joi.string(),
  })),
})
  .or('productId', 'productIds')
  .options({ allowUnknown: true });
