const fs = require('fs').promises;
const path = require('path');
const {startBrowserWithProfile} = require("./go-login");
const {RequestBodySchema} = require("./models");
const Logger = require("./utils/Logger");

async function main() {
  try {
    const jsonPath = path.join(__dirname, 'input.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(jsonData);

    // Validate the data
    const validatedData = RequestBodySchema.parse(data);

    // Start the browser with the validated data
    await startBrowserWithProfile(validatedData);

    console.log('Browser session completed successfully');
  } catch (error) {
    Logger.critical('An error occurred', error);
  }
}

main();