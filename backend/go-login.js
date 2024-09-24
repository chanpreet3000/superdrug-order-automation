const GoLogin = require("gologin-commonjs");
const {connect} = require("puppeteer");
const dotenv = require('dotenv');
const {startScraper} = require("./scraper");
const Logger = require('./utils/Logger');

dotenv.config();

const GO_LOGIN_TOKEN = process.env.GO_LOGIN_TOKEN;

const startBrowserWithProfile = async (validatedData) => {
  const GL = new GoLogin({
    token: GO_LOGIN_TOKEN, timezone: {
      timezone: 'Europe/London',
      accuracy: 100,
      ll: ['51.5074', '-0.1278'],
      country: 'GB',
      city: 'London',
      stateProv: 'England',
    },
  });

  try {
    Logger.info('Creating new GoLogin profile');
    const profile_id = await GL.create({
      name: 'uk-london-automation', os: 'win', navigator: {
        userAgent: 'random',
        resolution: '1280x720',
        language: 'en-GB,en-US;q=0.9,en;q=0.8',
        platform: 'win32',
        hardwareConcurrency: 8,
        deviceMemory: 8,
        maxTouchPoints: 5,
      }, 'proxyEnabled': true, 'proxy': {
        'mode': 'gologin', 'autoProxyRegion': 'uk',
      },
    });
    Logger.info(`Profile created successfully with id: ${profile_id}`);
    await GL.setProfileId(profile_id);

    if (!profile_id) {
      throw new Error('Failed to create GoLogin profile');
    }

    Logger.info(`Starting GoLogin with profile id: ${profile_id}`);
    const gologin = await GL.start();


    Logger.debug('Connecting to browser');
    const browser = await connect({
      browserWSEndpoint: gologin.wsUrl.toString(), ignoreHTTPSErrors: true,
    });

    Logger.info('Browser connected, starting scraper');
    await startScraper(GL, browser, validatedData);

    Logger.debug('Scraper finished, closing browser');
    await browser.close();
    Logger.info('Browser closed successfully')


    Logger.debug('Stopping GoLogin');
    await GL.stop();
    Logger.info('GoLogin stopped successfully');

    Logger.info(`Attempting to delete profile with id: ${profile_id}`);
    await GL.delete(profile_id);
    Logger.info(`Profile with id ${profile_id} deleted successfully`);

  } catch (error) {
    Logger.error('An error occurred while managing the browser session', error);
    throw error;
  }
}

module.exports = {
  startBrowserWithProfile,
};