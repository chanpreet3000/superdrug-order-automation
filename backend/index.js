const express = require('express');
const {z} = require('zod');
const Logger = require("./utils/Logger");
const {error_handler, tryCatch} = require("./utils/utils");

const app = express();
app.use(express.json());

const SuperdrugCredentialsSchema = z.object({
  email: z.string().email(), password: z.string().min(8),
});

const ProductSchema = z.object({
  url: z.string().url(), quantity: z.number().int().positive(),
});

const RequestBodySchema = z.object({
  superdrugCredentials: SuperdrugCredentialsSchema, products: z.array(ProductSchema),
});

app.post('/process-order', tryCatch(async (req, res) => {
  const validatedData = RequestBodySchema.parse(req.body);

  const {superdrugCredentials, products} = validatedData;

  res.json({
    message: 'Order processed successfully', orderDetails: 'Ordered!',
  });
}));


// Global error handler
app.use(error_handler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  Logger.warn(`Server is running on port ${PORT}`);
});