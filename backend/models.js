const {z} = require("zod");

const SuperdrugCredentialsSchema = z.object({
  email: z.string().email(), password: z.string(),
});

const TopCashbackCredentialsSchema = z.object({
  email: z.string().email(), password: z.string(),
});

const ProductSchema = z.object({
  url: z.string().url(), quantity: z.number().int().positive(),
});

const ShippingDetailsSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  postCode: z.string(),
  county: z.string(),
  phone: z.string(),
});

const CardDetailsSchema = z.object({
  number: z.string().regex(/^\d{13,19}$/),
  name: z.string(),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^\d{2}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
});

const RequestBodySchema = z.object({
  superdrugCredentials: SuperdrugCredentialsSchema,
  topCashbackCredentials: TopCashbackCredentialsSchema,
  products: z.array(ProductSchema),
  couponCode: z.string().optional(),
  shippingDetails: ShippingDetailsSchema,
  cardDetails: CardDetailsSchema,
});

module.exports = {
  RequestBodySchema,
  SuperdrugCredentialsSchema,
  TopCashbackCredentialsSchema,
  CardDetailsSchema,
  ShippingDetailsSchema
};
