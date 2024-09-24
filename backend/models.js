const {z} = require("zod");

const SuperdrugCredentialsSchema = z.object({
  email: z.string().email(), password: z.string().min(8),
});

const ProductSchema = z.object({
  url: z.string().url(), quantity: z.number().int().positive(),
});

const RequestBodySchema = z.object({
  superdrugCredentials: SuperdrugCredentialsSchema, products: z.array(ProductSchema), couponCode: z.string().optional(),
});


module.exports = {
  SuperdrugCredentialsSchema, ProductSchema, RequestBodySchema,
}