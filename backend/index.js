const express = require('express');
const Logger = require("./utils/Logger");
const {error_handler, tryCatch} = require("./utils/utils");
const {startBrowserWithProfile} = require("./go-login");
const {RequestBodySchema, SuperdrugCredentialsSchema, TopCashbackCredentialsSchema} = require("./models");
const SuperdrugCredentialsDataManager = require('./data_managers/SuperdrugCredentialsDataManager');
const {z} = require("zod");
const cors = require('cors');
const TopCashbackCredentialsDataManager = require("./data_managers/TopCashbackCredentialsDataManager");


const superdrugCredentialsDataManager = new SuperdrugCredentialsDataManager();
const topcashbackCredentialsDataManager = new TopCashbackCredentialsDataManager();

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


// Global error handler
app.use(error_handler);

const PORT = 8000;
app.listen(PORT, () => {
  Logger.warn(`Server is running on port ${PORT}`);
});