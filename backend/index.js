const express = require('express');
const Logger = require("./utils/Logger");
const {error_handler, tryCatch} = require("./utils/utils");
const {createProfile, startBrowserWithProfile, deleteProfile} = require("./go-login");
const {RequestBodySchema} = require("./models");

const app = express();
app.use(express.json());


app.post('/process-order', tryCatch(async (req, res) => {
  const validatedData = RequestBodySchema.parse(req.body);
  const profile_id = await createProfile();
  await startBrowserWithProfile(profile_id, validatedData);
  await deleteProfile(profile_id);
  res.json({
    message: 'Order processed successfully', orderDetails: 'Ordered!',
  });
}));


// Global error handler
app.use(error_handler);

const PORT = 8000;
app.listen(PORT, () => {
  Logger.warn(`Server is running on port ${PORT}`);
});