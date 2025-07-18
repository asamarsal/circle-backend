// src/validations/auth.validation.ts
import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[0-9]).*$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 special character, 1 lowercase letter and 1 number'
    }),
    role: Joi.string().valid('user', 'superuser').default('user')
});

export const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
});
export const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().min(0).default(0),
});
