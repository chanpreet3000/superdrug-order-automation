const GoLogin = require("gologin-commonjs");
const {connect} = require("puppeteer");
require('dotenv').config();
const {startScraper} = require("./scraper");
const Logger = require('./utils/Logger');

const GO_LOGIN_TOKEN = process.env.GO_LOGIN_TOKEN;
Logger.info(`GoLogin token: ${GO_LOGIN_TOKEN}`);

const startBrowserWithProfile = async (validatedData) => {
  const GL = new GoLogin({
    token: GO_LOGIN_TOKEN
  });

  let profile_id;
  let browser;

  try {
    Logger.info('Creating new GoLogin profile');
    profile_id = await GL.create({
      name: 'uk-london-automation', os: 'win', navigator: {
        userAgent: 'random', resolution: '1920x1080', platform: 'win32',
      }, 'proxyEnabled': false, 'proxy': {
        'mode': 'none',
      },
    });
    Logger.info(`Profile created successfully with id: ${profile_id}`);
    await GL.setProfileId(profile_id);

    if (!profile_id) {
      throw new Error('Failed to create GoLogin profile. Please make sure you have less than 3 profiles in your account');
    }

    Logger.info(`Starting GoLogin with profile id: ${profile_id}`);
    const gologin = await GL.start();


    Logger.debug('Connecting to browser');
    browser = await connect({
      browserWSEndpoint: gologin.wsUrl.toString(), ignoreHTTPSErrors: true,
    });

    Logger.info('Browser connected, starting scraper');
    return await startScraper(GL, browser, validatedData);
  } catch (error) {
    Logger.error('An error occurred while managing the browser session', error);
    throw error;
  } finally {
    try {
      if (browser) {
        Logger.debug('Closing browser');
        await browser.close();
        Logger.info('Browser closed successfully');
      }

      if (GL) {
        Logger.debug('Stopping GoLogin');
        await GL.stop();
        Logger.info('GoLogin stopped successfully');

        if (profile_id) {
          Logger.info(`Attempting to delete profile with id: ${profile_id}`);
          await GL.delete(profile_id);
          Logger.info(`Profile with id ${profile_id} deleted successfully`);
        }
      }
    } catch (cleanupError) {
      Logger.error('Error during cleanup', cleanupError);
    }
  }
}

module.exports = {
  startBrowserWithProfile,
};
