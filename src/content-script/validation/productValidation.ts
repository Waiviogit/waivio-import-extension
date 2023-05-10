import Joi from 'joi';

export const productSchema = Joi.object().keys({
  name: Joi.string().required(),
  departments: Joi.array().items(Joi.string()).min(1).required(),
  avatar: Joi.string().required(),
  productId: Joi.string().required(),
  options: Joi.array().items(Joi.object().keys({
    category: Joi.string().required(),
    value: Joi.string().required(),
    image: Joi.string(),
  }).required()),
}).options({ allowUnknown: true });
