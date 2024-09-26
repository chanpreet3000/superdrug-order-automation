const {sleepRandomly, changeViewport} = require("./utils/utils");
const Logger = require("./utils/Logger");


exports.startScraper = async (GL, browser, validatedData) => {
  const page = await browser.newPage();
  await changeViewport(GL, page);

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
    await page.type('input[name="username"]', validatedData.superdrugCredentials.email);
    await page.type('input[name="password"]', validatedData.superdrugCredentials.password);
    await sleepRandomly(3, 0, 'After entering password');

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForNavigation({waitUntil: 'networkidle0'});
    Logger.info('Successfully logged in to Superdrug');

    // Add products to cart
    for (const product of validatedData.products) {
      await addProductToCart(page, product);
      await sleepRandomly(4, 0, 'Between processing products');
    }

    Logger.info('All products added to cart successfully');

    Logger.info('Starting TopCashback integration');

    // TopCashback login
    await page.goto('https://www.topcashback.co.uk/logon/', {waitUntil: 'networkidle0'});
    Logger.debug('Navigated to TopCashback login page');

    try{
      await page.waitForSelector('#onetrust-accept-btn-handler', {timeout: 10000});
      await page.click('#onetrust-accept-btn-handler');
    }catch (error){
      Logger.warn('Could not find or click cookie accept button', error);
    }

    await page.type('#txtEmail', validatedData.topCashbackCredentials.email);
    await page.type('#loginPasswordInput', validatedData.topCashbackCredentials.password);

    await sleepRandomly(4, 0, 'Between entering login details');
    await page.click('#Loginbtn');
    await page.waitForNavigation({waitUntil: 'networkidle0', timeout: 10000 * 1000});
    Logger.info('Logged in to TopCashback');

    // Navigate to Superdrug cashback page
    await page.goto('https://www.topcashback.co.uk/superdrug/', {waitUntil: 'networkidle0'});
    Logger.debug('Navigated to Superdrug cashback page');

    const newTabPromise = new Promise(resolve => {
      browser.once('targetcreated', async target => {
        if (target.type() === 'page') {
          resolve(await target.page());
        }
      });
    });

    await page.click('#cashback-button');

    const newPage = await newTabPromise;
    Logger.info('New tab opened successfully');

    await changeViewport(GL, newPage);

    // Wait for the new page to load
    await sleepRandomly(10, 0, 'After clicking cashback button');
    Logger.info('New Superdrug page loaded');

    // Navigate to the cart in the new tab
    await newPage.goto('https://www.superdrug.com/cart', {waitUntil: 'networkidle0'});
    Logger.info('Navigated to Superdrug cart');

    // Apply coupon code if provided
    if (validatedData.couponCode) {
      await applyCouponCode(newPage, validatedData.couponCode);
    }

    // Initiate checkout
    await initiateCheckout(newPage, validatedData);

    await sleepRandomly(100000, 0, 'After initiating checkout');

    // Close the original page
    await page.close();

  } catch (error) {
    Logger.error('An error occurred during the scraping process', error);
  } finally {
    await browser.close();
    Logger.info('Scraper finished, browser closed');
  }
};

async function addProductToCart(page, product) {
  try {
    Logger.info(`Processing product: ${product.url}`);

    await page.goto(product.url, {waitUntil: 'networkidle0'});
    Logger.debug(`Navigated to product page: ${product.url}`);

    await page.waitForSelector('.product-add-to-cart__placeholder .add-to-cart__button');
    await page.click('.product-add-to-cart__placeholder .add-to-cart__button');
    Logger.debug('Clicked "Add to Basket" button');

    await page.waitForSelector('.add-to-cart-dialog__actions', {timeout: 10000});
    Logger.info(`Successfully added ${product.url} to cart`);

  } catch (error) {
    Logger.error(`Error processing product: ${product.url}`, error);
    throw error;
  }
}

async function applyCouponCode(page, couponCode) {
  try {
    Logger.info('Applying coupon code');

    await page.waitForSelector('input[name="couponCode"]');
    await page.type('input[name="couponCode"]', couponCode);

    await page.waitForSelector('.apply-coupon-button');
    await page.click('.apply-coupon-button');

    await sleepRandomly(10, 0, 'After applying coupon code');
    Logger.info('Coupon code applied');

  } catch (error) {
    Logger.error('Error applying coupon code', error);
  }
}

async function initiateCheckout(page, validatedData) {
  try {
    Logger.info('Initiating checkout');

    await page.waitForSelector('.proceed-to-checkout__button');
    await page.click('.proceed-to-checkout__button');

    await sleepRandomly(3, 0, 'After clicking first "Proceed to Checkout" button');
    try {
      await page.waitForSelector('.proceed-to-checkout__button', {timeout: 7000});
      await page.click('.proceed-to-checkout__button');
      Logger.debug('Clicked second "Proceed to Checkout" button');
    } catch (error) {
      Logger.warn('Could not find or click second "Proceed to Checkout" button', error);
    }

    await page.waitForNavigation({waitUntil: 'networkidle0'});
    Logger.info('Checkout initiated');

    // New steps after checkout
    await page.waitForSelector('.delivery-mode__icon--home');
    await page.click('.delivery-mode__icon--home');
    Logger.debug('Clicked on home delivery option');
    await sleepRandomly(5, 0, 'After selecting home delivery option');


    await page.waitForSelector('.delivery-options__name--uk-home-sd-shipping');
    await page.click('.delivery-options__name--uk-home-sd-shipping');
    Logger.debug('Selected UK home standard delivery');
    await sleepRandomly(5, 0, 'After selecting UK home standard delivery');

    await page.waitForSelector('.checkout-address-manager__shipping-address .change-address-btn');
    await page.click('.checkout-address-manager__shipping-address .change-address-btn');
    await sleepRandomly(5, 0, 'After selecting shipping address');

    // Fill in shipping details
    await fillShippingDetails(page, validatedData.shippingDetails);

    // Fill in billing address
    await page.waitForSelector('.checkout-address-book__billing .change-address-btn');
    await page.click('.checkout-address-book__billing .change-address-btn');
    Logger.debug('Clicked on change billing address button');
    await sleepRandomly(5, 0, 'After selecting billing address');

    // Fill in billing details
    await fillBillingDetails(page, validatedData.shippingDetails);
    await page.click('.proceed-to-payment__button')

    await sleepRandomly(5, 0, 'After filling billing details');
    // New steps for payment
    await page.waitForSelector('.payment-modes__fieldset');
    await page.click('.payment-modes__fieldset');
    Logger.debug('Clicked on payment modes fieldset');
    await sleepRandomly(2, 0, 'After clicking payment modes fieldset');

    await page.waitForSelector('e2-place-order button');
    await page.click('e2-place-order button');
    await sleepRandomly(7, 0, 'After clicking place order button');

    // Fill in card details
    await fillCardDetails(page, validatedData.cardDetails);

    // Wait for order confirmation or any relevant element
    await page.waitForSelector('.order-confirmation', {timeout: 60000});
    Logger.info('Order placed successfully');


  } catch (error) {
    Logger.error('Error initiating checkout', error);
  }
}

async function fillShippingDetails(page, shippingDetails) {
  try {
    Logger.info('Filling in shipping details');

    await page.waitForSelector('input[name="firstName"]');

    // Clear and fill firstName
    await page.$eval('input[name="firstName"]', el => el.value = '');
    await page.type('input[name="firstName"]', shippingDetails.firstName);

    // Clear and fill lastName
    await page.$eval('input[name="lastName"]', el => el.value = '');
    await page.type('input[name="lastName"]', shippingDetails.lastName);

    // Clear and fill line1 (addressLine1)
    await page.$eval('input[name="line1"]', el => el.value = '');
    await page.type('input[name="line1"]', shippingDetails.addressLine1);

    // Clear and fill line2 (addressLine2)
    await page.$eval('input[name="line2"]', el => el.value = '');
    await page.type('input[name="line2"]', shippingDetails.addressLine2);

    // Clear and fill town (city)
    await page.$eval('input[name="town"]', el => el.value = '');
    await page.type('input[name="town"]', shippingDetails.city);

    // Clear and fill postalCode
    await page.$eval('input[name="postalCode"]', el => el.value = '');
    await page.type('input[name="postalCode"]', shippingDetails.postCode);

    if (shippingDetails.county) {
      // Clear and fill county
      await page.$eval('input[name="county"]', el => el.value = '');
      await page.type('input[name="county"]', shippingDetails.county);
    }

    if (shippingDetails.phone) {
      // Clear and fill phone
      await page.$eval('input[name="phone"]', el => el.value = '');
      await page.type('input[name="phone"]', shippingDetails.phone);
    }

    await sleepRandomly(3, 0, 'After filling shipping details');
    // Click the "Use Address" button
    await page.waitForSelector('.step__submit');
    await page.click('.step__submit');
    await sleepRandomly(5, 0, 'After clicking "Use Address" button');

    Logger.info('Shipping details filled and submitted');

  } catch (error) {
    Logger.error('Error filling shipping details', error);
  }
}

async function fillBillingDetails(page, billingDetails) {
  try {
    Logger.info('Filling in billing details');

    await page.waitForSelector('.checkout-address-book__billing input[name="firstName"]');

    // Clear and fill firstName
    await page.$eval('.checkout-address-book__billing input[name="firstName"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="firstName"]', billingDetails.firstName);

    // Clear and fill lastName
    await page.$eval('.checkout-address-book__billing input[name="lastName"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="lastName"]', billingDetails.lastName);

    // Clear and fill line1 (addressLine1)
    await page.$eval('.checkout-address-book__billing input[name="line1"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="line1"]', billingDetails.addressLine1);

    // Clear and fill line2 (addressLine2)
    await page.$eval('.checkout-address-book__billing input[name="line2"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="line2"]', billingDetails.addressLine2);

    // Clear and fill town (city)
    await page.$eval('.checkout-address-book__billing input[name="town"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="town"]', billingDetails.city);

    // Clear and fill postalCode
    await page.$eval('.checkout-address-book__billing input[name="postalCode"]', el => el.value = '');
    await page.type('.checkout-address-book__billing input[name="postalCode"]', billingDetails.postCode);

    if (billingDetails.county) {
      // Clear and fill county
      await page.$eval('.checkout-address-book__billing input[name="county"]', el => el.value = '');
      await page.type('.checkout-address-book__billing input[name="county"]', billingDetails.county);
    }

    if (billingDetails.phone) {
      // Clear and fill phone
      await page.$eval('.checkout-address-book__billing input[name="phone"]', el => el.value = '');
      await page.type('.checkout-address-book__billing input[name="phone"]', billingDetails.phone);
    }

    await sleepRandomly(3, 0, 'After filling shipping details');
    // Click the "Use Address" button
    await page.waitForSelector('.checkout-address-book__billing .step__submit');
    await page.click('.checkout-address-book__billing .step__submit');
    await sleepRandomly(5, 0, 'After filling shipping details');
    Logger.info('Billing details filled and submitted');

  } catch (error) {
    Logger.error('Error filling billing details', error);
  }
}

async function fillCardDetails(page, cardDetails) {
  try {
    Logger.info('Filling in card details');

    await page.waitForSelector('#cardNumber');
    await page.type('#cardNumber', cardDetails.number);

    await page.$eval('#cardholderName', el => el.value = '');
    await page.type('#cardholderName', cardDetails.name);

    await page.type('#expiryMonth', cardDetails.expiryMonth);
    await page.type('#expiryYear', cardDetails.expiryYear);

    await page.type('#securityCode', cardDetails.cvv);

    await sleepRandomly(3, 0, 'After filling card details');
    Logger.info('Card details filled');

    // Click "Make Payment" button
    await page.waitForSelector('.btn-make-payment');
    await page.click('.btn-make-payment');
    Logger.debug('Clicked on Make Payment button');
    await sleepRandomly(5, 0, 'After clicking Make Payment button');

  } catch (error) {
    Logger.error('Error filling card details', error);
  }
}
