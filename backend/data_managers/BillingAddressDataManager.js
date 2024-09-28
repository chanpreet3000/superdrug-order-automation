const fs = require('fs').promises;
const path = require('path');
const Logger = require("../utils/Logger");

class BillingAddressDataManager {
  static _instance = null;

  constructor() {
    if (BillingAddressDataManager._instance) {
      return BillingAddressDataManager._instance;
    }
    BillingAddressDataManager._instance = this;
    this.filename = path.join(__dirname, '..', 'data', 'billing_addresses.json');
    this.data = null;
    this.init();
  }

  async init() {
    Logger.info("Initializing BillingAddressDataManager");
    try {
      const fileContent = await fs.readFile(this.filename, 'utf8');
      this.data = JSON.parse(fileContent);
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      Logger.debug('BillingAddressDataManager initialized with data:', this.data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        Logger.warn(`Database file ${this.filename} not found. Initializing with empty array.`);
        this.data = [];
      } else if (error instanceof SyntaxError || error.message === 'Data is not an array') {
        Logger.error('Error parsing JSON in BillingAddressDataManager:', error);
        throw error;
      } else {
        Logger.error('Error initializing BillingAddressDataManager:', error);
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

  async addAddress(address) {
    Logger.info(`Adding Billing address: ${JSON.stringify(address)}`);
    this.data.push(address);
    await this.save();
  }

  async removeAddress(id) {
    Logger.info(`Removing Billing address with id: ${id}`);
    const initialLength = this.data.length;
    this.data = this.data.filter(address => address.id !== id);
    if (this.data.length === initialLength) {
      Logger.warn(`Billing Address with id ${id} not found`);
      throw new Error(`Billing Address with id ${id} not found`);
    }
    await this.save();
  }

  getAddresses() {
    return this.data;
  }
}

module.exports = BillingAddressDataManager;