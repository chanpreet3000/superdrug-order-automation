const {sleepRandomly} = require("./utils/utils");
const Logger = require("./utils/Logger");

exports.startScraper = async (browser, validatedData) => {
  const page = await browser.newPage();

  try {
    Logger.info('Starting Superdrug scraper');

    // Navigate directly to the login page
    await page.goto('https://www.superdrug.com/login', {waitUntil: 'networkidle0'});
    Logger.debug('Navigated to login page');

    // Accept cookies
    try {
      await page.waitForSelector('#onetrust-accept-btn-handler');
      await page.click('#onetrust-accept-btn-handler');
      Logger.debug('Accepted cookies');
    } catch (error) {
      Logger.warn('Could not find or click cookie accept button', error);
    }

    // Wait for the login form to appear
    await page.waitForSelector('input[name="username"]');
    await page.waitForSelector('input[name="password"]');
    Logger.debug('Login form loaded');

    // Enter username (email)
    await page.type('input[name="username"]', validatedData.superdrugCredentials.email);
    await sleepRandomly(3, 0, 'After entering username');

    // Enter password
    await page.type('input[name="password"]', validatedData.superdrugCredentials.password);
    await sleepRandomly(3, 0, 'After entering password');

    // Submit the form
    await page.click('button[type="submit"]');
    Logger.debug('Submitted login form');

    // Wait for navigation after login
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    Logger.info('Successfully logged in to Superdrug');

    // Navigate to each product page and enter the quantity
    for (const product of validatedData.products) {
      await navigateAndEnterQuantity(page, product);
      await sleepRandomly(4, 0, 'Between processing products');
    }

    Logger.info('All products processed successfully');

  } catch (error) {
    Logger.error('An error occurred during the scraping process', error);
  } finally {
    await page.close();
    Logger.info('Scraper finished, page closed');
  }
};

async function navigateAndEnterQuantity(page, product) {
  try {
    Logger.info(`Processing product: ${product.url}`);

    // Navigate to the product page
    await page.goto(product.url, {waitUntil: 'networkidle0'});
    Logger.debug(`Navigated to product page: ${product.url}`);

    // Wait for the quantity input to be visible
    await page.waitForSelector('e2-item-counter.item-counter input');

    // Clear the current quantity
    await page.evaluate(() => {
      const input = document.querySelector('e2-item-counter.item-counter input');
      input.value = '';
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });
    Logger.debug('Cleared current quantity');

    // Enter the new quantity
    await page.type('e2-item-counter.item-counter input', product.quantity.toString());
    await sleepRandomly(3, 1, 'After entering quantity');

    // Trigger an input event to ensure the website recognizes the change
    await page.evaluate(() => {
      const input = document.querySelector('e2-item-counter.item-counter input');
      input.dispatchEvent(new Event('input', {bubbles: true}));
    });

    Logger.info(`Updated quantity for ${product.url} to ${product.quantity}`);

    // Click the "Add to Basket" button
    await page.waitForSelector('.product-add-to-cart__placeholder .add-to-cart__button');
    await page.click('.product-add-to-cart__placeholder .add-to-cart__button');
    Logger.debug('Clicked "Add to Basket" button');

    // Check if the item was added to cart
    await page.waitForSelector('.add-to-cart-dialog__actions', {timeout: 10000});
    Logger.info(`Successfully added ${product.quantity} of ${product.url} to cart`);

  } catch (error) {
    Logger.error(`Error processing product: ${product.url}`, error);
    throw error
  }
}
