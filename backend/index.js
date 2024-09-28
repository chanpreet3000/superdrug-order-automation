const express = require('express');
const Logger = require("./utils/Logger");
const {error_handler, tryCatch} = require("./utils/utils");
const {startBrowserWithProfile} = require("./go-login");
const {
  RequestBodySchema, SuperdrugCredentialsSchema, TopCashbackCredentialsSchema, CardDetailsSchema, ShippingDetailsSchema
} = require("./models");
const SuperdrugCredentialsDataManager = require('./data_managers/SuperdrugCredentialsDataManager');
const {z} = require("zod");
const {v4: uuidv4} = require('uuid');
const cors = require('cors');
const TopCashbackCredentialsDataManager = require("./data_managers/TopCashbackCredentialsDataManager");
const CouponsDataManager = require("./data_managers/CouponDataManager");
const CardDetailsDataManager = require("./data_managers/CardDetailsDataManager");
const ShippingAddressDataManager = require("./data_managers/ShippingAddressDataManager");
const BillingAddressDataManager = require("./data_managers/BillingAddressDataManager");


const superdrugCredentialsDataManager = new SuperdrugCredentialsDataManager();
const topcashbackCredentialsDataManager = new TopCashbackCredentialsDataManager();
const couponsDataManager = new CouponsDataManager();
const cardDetailsDataManager = new CardDetailsDataManager();
const shippingAddressDataManager = new ShippingAddressDataManager();
const billingAddressDataManager = new BillingAddressDataManager();

const app = express();
app.use(cors());
app.use(express.json());


app.post('/process-order', tryCatch(async (req, res) => {
  const validatedData = RequestBodySchema.parse(req.body);
  await startBrowserWithProfile(validatedData);
  res.json({
    message: 'Order processed successfully', orderDetails: 'Ordered!',
  });
}));


app.get('/superdrug_credentials', tryCatch(async (req, res) => {
  const credentials = superdrugCredentialsDataManager.getCredentials();
  res.json(credentials);
}));

app.post('/superdrug_credentials', tryCatch(async (req, res) => {
  const parsedData = SuperdrugCredentialsSchema.parse(req.body);
  await superdrugCredentialsDataManager.addCredential(parsedData);
  res.status(201).json({message: 'Credential added successfully'});
}));

app.delete('/superdrug_credentials/:email', tryCatch(async (req, res) => {
  const parsedEmail = z.string().email().parse(req.params.email);
  await superdrugCredentialsDataManager.removeCredential(parsedEmail);
  res.json({message: 'Credential removed successfully'});
}));

app.get('/topcashback_credentials', tryCatch(async (req, res) => {
  const credentials = topcashbackCredentialsDataManager.getCredentials();
  res.json(credentials);
}));

app.post('/topcashback_credentials', tryCatch(async (req, res) => {
  const parsedData = TopCashbackCredentialsSchema.parse(req.body);
  await topcashbackCredentialsDataManager.addCredential(parsedData);
  res.status(201).json({message: 'Credential added successfully'});
}));

app.delete('/topcashback_credentials/:email', tryCatch(async (req, res) => {
  const parsedEmail = z.string().email().parse(req.params.email);
  await topcashbackCredentialsDataManager.removeCredential(parsedEmail);
  res.json({message: 'Credential removed successfully'});
}));

app.get('/coupons', tryCatch(async (req, res) => {
  const coupons = couponsDataManager.getCoupons();
  res.json(coupons);
}));

app.post('/coupons', tryCatch(async (req, res) => {
  const parsedData = z.string().parse(req.body.code);
  await couponsDataManager.addCoupon(parsedData);
  res.status(201).json({message: 'Coupon added successfully'});
}));

app.delete('/coupons/:code', tryCatch(async (req, res) => {
  const parsedCode = z.string().parse(req.params.code);
  await couponsDataManager.removeCoupon(parsedCode);
  res.json({message: 'Coupon removed successfully'});
}));

app.get('/card_details', tryCatch(async (req, res) => {
  const cardDetails = cardDetailsDataManager.getCardDetails();
  // Remove CVV from the response for security reasons
  const sanitizedCardDetails = cardDetails.map(({cvv, ...rest}) => rest);
  res.json(sanitizedCardDetails);
}));

app.post('/card_details', tryCatch(async (req, res) => {
  const parsedData = CardDetailsSchema.parse(req.body);
  await cardDetailsDataManager.addCardDetails(parsedData);
  res.status(201).json({message: 'Card details added successfully'});
}));

app.delete('/card_details/:number', tryCatch(async (req, res) => {
  const cardNumber = z.string().regex(/^\d{13,19}$/).parse(req.params.number);
  await cardDetailsDataManager.removeCardDetails(cardNumber);
  res.json({message: 'Card details removed successfully'});
}));

app.get('/shipping_addresses', tryCatch(async (req, res) => {
  const addresses = shippingAddressDataManager.getAddresses();
  res.json(addresses);
}));

app.post('/shipping_addresses', tryCatch(async (req, res) => {
  const parsedData = ShippingDetailsSchema.parse(req.body);
  const newAddress = {id: uuidv4(), ...parsedData};
  await shippingAddressDataManager.addAddress(newAddress);
  res.status(201).json({message: 'Shipping address added successfully', address: newAddress});
}));

app.delete('/shipping_addresses/:id', tryCatch(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  await shippingAddressDataManager.removeAddress(id);
  res.json({message: 'Shipping address removed successfully'});
}));

app.get('/billing_addresses', tryCatch(async (req, res) => {
  const addresses = billingAddressDataManager.getAddresses();
  res.json(addresses);
}));

app.post('/billing_addresses', tryCatch(async (req, res) => {
  const parsedData = ShippingDetailsSchema.parse(req.body);
  const newAddress = {id: uuidv4(), ...parsedData};
  await billingAddressDataManager.addAddress(newAddress);
  res.status(201).json({message: 'Billing address added successfully', address: newAddress});
}));

app.delete('/billing_addresses/:id', tryCatch(async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  await billingAddressDataManager.removeAddress(id);
  res.json({message: 'Billing address removed successfully'});
}));

// Global error handler
app.use(error_handler);

const PORT = 8000;
app.listen(PORT, () => {
  Logger.warn(`Server is running on port ${PORT}`);
});