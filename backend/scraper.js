const {sleepRandomly, changeViewport} = require("./utils/utils");
const Logger = require("./utils/Logger");

const loginToSuperdrug = async (page, superdrugCredentials) => {
  // Navigate directly to the login page
  Logger.info('Starting Superdrug login process');

  Logger.info('Navigating to Superdrug login page');
  await page.goto('https://www.superdrug.com/login', {waitUntil: 'networkidle0'});
  Logger.debug('Navigated to login page');

  // Accept cookies
  try {
    await page.waitForSelector('#onetrust-accept-btn-handler');
    await page.click('#onetrust-accept-btn-handler');
    Logger.debug('Accepted cookies');
  } catch (error) {
    Logger.warn('Could not find or click cookie accept button');
  }

  // Wait for the login form to appear
  await page.waitForSelector('input[name="username"]');
  await page.waitForSelector('input[name="password"]');
  await page.type('input[name="username"]', superdrugCredentials.email);
  await sleepRandomly(1, 0, 'Between entering email and password');
  await page.type('input[name="password"]', superdrugCredentials.password);
  await sleepRandomly(1, 0, 'Between entering password and submitting form');

  // Submit the form
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
  Logger.info('Submitted login form');

  await page.waitForNavigation({waitUntil: 'networkidle0'});
  Logger.info('Successfully logged in to Superdrug');
}

async function topCashbackLogin(page, validatedData, browser, GL) {
  try {
    // TopCashback login
    Logger.info('Starting TopCashback integration');
    await page.goto('https://www.topcashback.co.uk/logon/', {waitUntil: 'networkidle0'});
    Logger.debug('Navigated to TopCashback login page');

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', {timeout: 10000});
      await page.click('#onetrust-accept-btn-handler');
    } catch (error) {
      Logger.warn('Could not find or click cookie accept button');
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
    Logger.info('Superdrug Cashback page loaded');
    return newPage;
  } catch (error) {
    // Continue without topcashback
    Logger.error('Error logging in to TopCashback', error);
    return page;
  }
}

exports.startScraper = async (GL, browser, validatedData) => {
  Logger.info('Starting Superdrug scraper');
  const page = await browser.newPage();
  await changeViewport(GL, page);

  // Login to Superdrug
  await loginToSuperdrug(page, validatedData.superdrugCredentials);

  // Add products to cart
  Logger.info('Starting Adding all products to cart');
  for (const product of validatedData.products) {
    await addProductToCart(page, product);
    await sleepRandomly(4, 0, 'Between processing products');
  }
  Logger.info('All products added to cart successfully');

  // Login to TopCashback and goto Superdrug cashback page
  const newPage = await topCashbackLogin(page, validatedData, browser, GL);

  // Navigate to the cart in the new tab
  await newPage.goto('https://www.superdrug.com/cart', {waitUntil: 'domcontentloaded'});
  Logger.info('Navigated to Superdrug cart');

  // Apply coupon code if provided
  if (validatedData.couponCode) {
    await applyCouponCode(newPage, validatedData.couponCode);
  }

  // Initiate checkout
  const orderDetails = await initiateCheckout(newPage, validatedData);
  Logger.info('Finished Superdrug scraper');
  return orderDetails;
};

async function addProductToCart(page, product) {
  Logger.info(`Processing product: ${product.url}`);

  await page.goto(product.url, {waitUntil: 'networkidle0'});
  Logger.debug(`Navigated to product page: ${product.url}`);

  const dropdownSelector = '.add-to-cart__quantity-selector select';
  const dropdownExists = await page.$(dropdownSelector);

  const quantity = product.quantity;
  if (dropdownExists) {
    Logger.info('Selecting quantity from dropdown');
    if (quantity >= 10) {
      await page.select(dropdownSelector, '10');
      await page.waitForSelector('.quantity-input input', {visible: true});
      await page.evaluate(() => {
        document.querySelector('.quantity-input input').value = '';
      });
      await page.type('.quantity-input input', quantity.toString());
    } else {
      await page.select(dropdownSelector, quantity.toString());
    }
  } else {
    const inputSelector = '.item-counter>input';
    await page.evaluate((selector) => {
      document.querySelector(selector).value = '';
    }, inputSelector);
    await page.type(inputSelector, quantity.toString());
  }

  await sleepRandomly(2, 0, 'After selecting quantity');

  await page.waitForSelector('.product-add-to-cart__placeholder .add-to-cart__button');
  await page.click('.product-add-to-cart__placeholder .add-to-cart__button');
  Logger.debug('Clicked "Add to Basket" button');


  Logger.debug(`Quantity ${quantity} selected successfully.`);

  await page.waitForSelector('.add-to-cart-dialog__actions', {timeout: 10000});
  Logger.info(`Successfully added ${product.url} to cart`);
}

async function applyCouponCode(page, couponCode) {
  Logger.info('Starting coupon application process');

  try {
    await page.evaluate(() => {
      const accordion = document.querySelector('.cart-coupon-title');
      if (accordion) {
        accordion.click();
      }
    });
    Logger.info('Clicked accordion to reveal coupon input');

    // Wait for the input field to be visible
    await page.waitForSelector('input[name="couponCode"]', {visible: true, timeout: 5000});

    // Type the coupon code
    await page.evaluate((code) => {
      const input = document.querySelector('input[name="couponCode"]');
      if (input) {
        input.value = code;
        input.dispatchEvent(new Event('input', {bubbles: true}));
        input.dispatchEvent(new Event('change', {bubbles: true}));
      }
    }, couponCode);
    Logger.info('Entered coupon code');
    await sleepRandomly(2, 0, 'After entering coupon code');

    // Click the submit button
    await page.evaluate(() => {
      const button = document.querySelector('.apply-coupon-button');
      if (button && !button.disabled) {
        button.click();
      }
    });
    Logger.info('Clicked submit button');

    // Wait for either success or error message
    const result = await page.evaluate(() => {
      return new Promise((resolve) => {
        const checkForResult = () => {
          const appliedCoupon = document.querySelector('.coupon-card-grid .voucher-code');
          const errorMessage = document.querySelector('div.alert.alert-warning');

          if (appliedCoupon) {
            resolve({success: true, code: appliedCoupon.textContent.trim()});
          } else if (errorMessage) {
            resolve({success: false, message: errorMessage.textContent.trim()});
          } else {
            setTimeout(checkForResult, 500);
          }
        };
        checkForResult();
      });
    });

    if (result.success) {
      Logger.info(`Coupon applied successfully: ${result.code}`);
      return result.code;
    } else {
      throw new Error(`Coupon application failed: ${result.message}`);
    }

  } catch (error) {
    Logger.error(`Error in coupon application process: ${error.message}`);
    throw error;
  }
}

async function initiateCheckout(page, validatedData) {
  Logger.info('Initiating checkout');

  await page.waitForSelector('.proceed-to-checkout__button');
  await page.click('.proceed-to-checkout__button');

  await sleepRandomly(3, 0, 'After clicking first "Proceed to Checkout" button');
  try {
    // will fix this later, seems to be a bug.
    await page.waitForSelector('.proceed-to-checkout__button', {timeout: 7000});
    await page.click('.proceed-to-checkout__button');
    Logger.debug('Clicked second "Proceed to Checkout" button');
  } catch (error) {
    Logger.warn('Could not find or click second "Proceed to Checkout" button');
  }

  await page.waitForNavigation({waitUntil: 'networkidle0'});
  Logger.info('Checkout initiated');

  // Selecting Home Delivery option
  await page.waitForSelector('.delivery-mode__icon--home');
  await page.click('.delivery-mode__icon--home');
  Logger.debug('Clicked on home delivery option');
  await sleepRandomly(5, 0, 'After selecting home delivery option');

  // Selecting UK home standard delivery
  await page.waitForSelector('.delivery-options__name--uk-home-sd-shipping');
  await page.click('.delivery-options__name--uk-home-sd-shipping');
  Logger.debug('Selected UK home standard delivery');
  await sleepRandomly(5, 0, 'After selecting UK home standard delivery');

  // Selecting shipping address
  await page.waitForSelector('.checkout-address-manager__shipping-address .change-address-btn');
  await page.click('.checkout-address-manager__shipping-address .change-address-btn');
  await sleepRandomly(5, 0, 'After selecting shipping address');

  // Fill in shipping details
  await fillShippingDetails(page, validatedData.shippingDetails);

  // // Selecting billing address
  // await page.waitForSelector('.checkout-address-book__billing .change-address-btn');
  // await page.click('.checkout-address-book__billing .change-address-btn');
  // Logger.debug('Clicked on change billing address button');
  // await sleepRandomly(5, 0, 'After selecting billing address');
  //
  // // Fill in billing details
  // await fillBillingDetails(page, validatedData.shippingDetails);

  // Going for payment
  await page.waitForSelector('.proceed-to-payment__button');
  await page.click('.proceed-to-payment__button')

  // Select Pay with Credit/Debit Card
  await page.waitForSelector('.payment-modes__fieldset', {visible: true});
  await sleepRandomly(3, 0, 'After waiting for payment modes fieldset to be clickable');
  await page.click('.payment-modes__fieldset');
  Logger.debug('Clicked on payment modes fieldset');
  await sleepRandomly(2, 0, 'After clicking payment modes fieldset');

  // Click on Button Complete Secure Payment
  await page.waitForSelector('e2-place-order button');
  await page.click('e2-place-order button');
  await sleepRandomly(7, 0, 'After clicking place order button');

  // Fill in card details
  await fillCardDetails(page, validatedData.cardDetails);

  // Get order details
  const orderDetails = await getOrderDetails(page);
  Logger.info('Order details extracted', orderDetails);
  return orderDetails;
}

async function getOrderDetails(page) {
  Logger.info('Getting order details');
  await page.waitForSelector('.order-confirmation-data', {timeout: 20 * 1000});
  Logger.info('Order details found');
  return await page.$eval('.order-confirmation-data', element => element.innerText);
}

async function fillShippingDetails(page, shippingDetails) {
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

  await sleepRandomly(2, 0, 'After filling shipping details');
  // Click the "Use Address" button
  await page.waitForSelector('.step__submit');
  await page.click('.step__submit');
  await sleepRandomly(5, 0, 'After clicking "Use Address" button');

  Logger.info('Shipping details filled and submitted');
}

// async function fillBillingDetails(page, billingDetails) {
//   Logger.info('Filling in billing details');
//
//   await page.waitForSelector('.checkout-address-book__billing input[name="firstName"]');
//
//   // Clear and fill firstName
//   await page.$eval('.checkout-address-book__billing input[name="firstName"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="firstName"]', billingDetails.firstName);
//
//   // Clear and fill lastName
//   await page.$eval('.checkout-address-book__billing input[name="lastName"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="lastName"]', billingDetails.lastName);
//
//   // Clear and fill line1 (addressLine1)
//   await page.$eval('.checkout-address-book__billing input[name="line1"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="line1"]', billingDetails.addressLine1);
//
//   // Clear and fill line2 (addressLine2)
//   await page.$eval('.checkout-address-book__billing input[name="line2"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="line2"]', billingDetails.addressLine2);
//
//   // Clear and fill town (city)
//   await page.$eval('.checkout-address-book__billing input[name="town"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="town"]', billingDetails.city);
//
//   // Clear and fill postalCode
//   await page.$eval('.checkout-address-book__billing input[name="postalCode"]', el => el.value = '');
//   await page.type('.checkout-address-book__billing input[name="postalCode"]', billingDetails.postCode);
//
//   if (billingDetails.county) {
//     // Clear and fill county
//     await page.$eval('.checkout-address-book__billing input[name="county"]', el => el.value = '');
//     await page.type('.checkout-address-book__billing input[name="county"]', billingDetails.county);
//   }
//
//   if (billingDetails.phone) {
//     // Clear and fill phone
//     await page.$eval('.checkout-address-book__billing input[name="phone"]', el => el.value = '');
//     await page.type('.checkout-address-book__billing input[name="phone"]', billingDetails.phone);
//   }
//
//   await sleepRandomly(2, 0, 'After filling billing details');
//   // Click the "Use Address" button
//   await page.waitForSelector('.checkout-address-book__billing .step__submit');
//   await page.click('.checkout-address-book__billing .step__submit');
//   await sleepRandomly(5, 0, 'After clicking "Use Address" button');
//   Logger.info('Billing details filled and submitted');
// }
//

async function fillCardDetails(page, cardDetails) {
  Logger.info('Starting to fill in card details');

  const iframeSelector = '#wp-cl-wp-iframe-iframe';

  Logger.debug('Waiting for Worldpay iframe to load');
  await page.waitForSelector(iframeSelector, {timeout: 30000});

  const elementHandle = await page.$(iframeSelector);
  const frame = await elementHandle.contentFrame();

  if (!frame) {
    throw new Error('Worldpay iframe content not accessible');
  }

  Logger.debug('Worldpay iframe found, proceeding to fill details');

  // Card Number
  Logger.debug('Waiting for card number field');
  await frame.waitForSelector('#cardNumber', {timeout: 30000});
  Logger.debug('Card number field found, starting to type');
  await frame.type('#cardNumber', cardDetails.number);
  await sleepRandomly(1.25, 0);
  Logger.debug('Card number typed');

  // Cardholder Name
  Logger.debug('Waiting for cardholder name field');
  await frame.waitForSelector('#cardholderName');
  Logger.debug('Clearing cardholder name field');
  await frame.$eval('#cardholderName', el => el.value = '');
  Logger.debug('Cardholder name field found, starting to type');
  await frame.type('#cardholderName', cardDetails.name);
  await sleepRandomly(1.25, 0);
  Logger.debug('Cardholder name typed');

  // Expiry Month
  Logger.debug('Waiting for expiry month field');
  await frame.waitForSelector('#expiryMonth');
  Logger.debug('Expiry month field found, starting to type');
  await frame.type('#expiryMonth', cardDetails.expiryMonth);
  await sleepRandomly(1.25, 0);
  Logger.debug('Expiry month typed');

  // Expiry Year
  Logger.debug('Waiting for expiry year field');
  await frame.waitForSelector('#expiryYear');
  Logger.debug('Expiry year field found, starting to type');
  await frame.type('#expiryYear', cardDetails.expiryYear);
  await sleepRandomly(1.25, 0);
  Logger.debug('Expiry year typed');

  // Security Code (CVV)
  Logger.debug('Waiting for security code field');
  await frame.waitForSelector('#securityCode');
  Logger.debug('Security code field found, starting to type');
  await frame.type('#securityCode', cardDetails.cvv);
  await sleepRandomly(1.25, 0);
  Logger.debug('Security code typed');

  Logger.info('All card details filled in Worldpay iframe');

  await sleepRandomly(4, 0, 'After filling card details');

  Logger.debug('Waiting for Make Payment button');
  await frame.waitForSelector('.btn-make-payment', {timeout: 30000});
  Logger.debug('Make Payment button found, clicking');
  await frame.click('.btn-make-payment');
  Logger.info('Clicked on Make Payment button');

  await sleepRandomly(5, 0, 'After clicking Make Payment button');
  Logger.info('fillCardDetails function completed');
}