const GoLogin = require("gologin-commonjs");
const {connect} = require("puppeteer");
const dotenv = require('dotenv');
const {startScraper} = require("./scraper");
const Logger = require('./utils/Logger');

dotenv.config();

const GO_LOGIN_TOKEN = process.env.GO_LOGIN_TOKEN;

exports.createProfile = async () => {
  const GL = new GoLogin({token: GO_LOGIN_TOKEN});

  try {
    Logger.info('Creating new GoLogin profile');
    const profile_id = await GL.create({
      name: 'uk-london-automation',
      os: 'win',
      navigator: {
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        userAgent: 'random',
        resolution: '1024x768',
        platform: 'win32',
      },
      timezone: {
        id: 'Europe/London',
      },
      geolocation: {
        mode: 'prompt',
        latitude: 51.5074,
        longitude: -0.1278,
        accuracy: 100,
      },
      proxyEnabled: false,
      proxy: {
        mode: 'none',
      }
    });

    Logger.info(`Profile created successfully with id: ${profile_id}`);
    return profile_id;
  } catch (error) {
    Logger.error('Failed to create GoLogin profile', error);
    throw error;
  }
}

exports.startBrowserWithProfile = async (profile_id, validatedData) => {
  const GL = new GoLogin({
    token: GO_LOGIN_TOKEN,
    profile_id: profile_id,
  });

  try {
    Logger.info(`Starting GoLogin with profile id: ${profile_id}`);
    const gologin = await GL.start();

    Logger.debug('Connecting to browser');
    const browser = await connect({
      browserWSEndpoint: gologin.wsUrl.toString(),
      ignoreHTTPSErrors: true,
    });

    Logger.info('Browser connected, starting scraper');
    await startScraper(browser, validatedData);

    Logger.debug('Scraper finished, closing browser');
    await browser.close();
    Logger.info('Browser closed successfully');
  } catch (error) {
    Logger.error('An error occurred while managing the browser session', error);
    throw error;
  } finally {
    try {
      Logger.debug('Stopping GoLogin');
      await GL.stop();
      Logger.info('GoLogin stopped successfully');
    } catch (stopError) {
      Logger.warn('Failed to stop GoLogin', stopError);
    }
  }
}

exports.deleteProfile = async (profile_id) => {
  const GL = new GoLogin({token: GO_LOGIN_TOKEN});
  try {
    Logger.info(`Attempting to delete profile with id: ${profile_id}`);
    await GL.delete(profile_id);
    Logger.info(`Profile with id ${profile_id} deleted successfully`);
  } catch (error) {
    Logger.error(`Failed to delete profile with id: ${profile_id}`, error);
    throw error;
  }
}