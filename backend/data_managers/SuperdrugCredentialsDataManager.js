const fs = require('fs').promises;
const path = require('path');
const Logger = require("../utils/Logger");

class SuperdrugCredentialsDataManager {
  static _instance = null;

  constructor() {
    if (SuperdrugCredentialsDataManager._instance) {
      return SuperdrugCredentialsDataManager._instance;
    }
    SuperdrugCredentialsDataManager._instance = this;
    this.filename = path.join(__dirname, '..', 'data', 'superdrug_credentials.json');
    this.data = null;
    this.init();
  }

  async init() {
    Logger.info("Initializing SuperdrugCredentialsDataManager");
    try {
      const fileContent = await fs.readFile(this.filename, 'utf8');
      this.data = JSON.parse(fileContent);
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      Logger.debug('SuperdrugCredentialsDataManager initialized with data:', this.data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        Logger.warn(`Database file ${this.filename} not found. Initializing with empty array.`);
        this.data = [];
      } else if (error instanceof SyntaxError || error.message === 'Data is not an array') {
        Logger.error('Error parsing JSON in SuperdrugCredentialsDataManager:', error);
        throw error;
      } else {
        Logger.error('Error initializing SuperdrugCredentialsDataManager:', error);
        throw error;
      }
    }
  }

  async save() {
    Logger.info("Saving data to file");
    try {
      await fs.writeFile(this.filename, JSON.stringify(this.data, null, 2));
    } catch (error) {
      Logger.error('Error saving data:', error);
      throw error;
    }
  }

  async addCredential(credential) {
    Logger.info(`Adding credential: ${JSON.stringify(credential)}`);
    this.data.push(credential);
    await this.save();
  }

  async removeCredential(email) {
    Logger.info(`Removing credential for email: ${email}`);
    this.data = this.data.filter(cred => cred.email !== email);
    await this.save();
  }

  getCredentials() {
    return this.data;
  }

  static getInstance() {
    if (!SuperdrugCredentialsDataManager._instance) {
      new SuperdrugCredentialsDataManager();
    }
    return SuperdrugCredentialsDataManager._instance;
  }
}

module.exports = SuperdrugCredentialsDataManager.getInstance();