const fs = require('fs').promises;
const path = require('path');
const Logger = require("../utils/Logger");

class CouponsDataManager {
  static _instance = null;

  constructor() {
    if (CouponsDataManager._instance) {
      return CouponsDataManager._instance;
    }
    CouponsDataManager._instance = this;
    this.filename = path.join(__dirname, '..', 'data', 'coupons.json');
    this.data = null;
    this.init();
  }

  async init() {
    Logger.info("Initializing CouponsDataManager");
    try {
      const fileContent = await fs.readFile(this.filename, 'utf8');
      this.data = JSON.parse(fileContent);
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      Logger.debug('CouponsDataManager initialized with data:', this.data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        Logger.warn(`Database file ${this.filename} not found. Initializing with empty array.`);
        this.data = [];
      } else if (error instanceof SyntaxError || error.message === 'Data is not an array') {
        Logger.error('Error parsing JSON in CouponsDataManager:', error);
        throw error;
      } else {
        Logger.error('Error initializing CouponsDataManager:', error);
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

  async addCoupon(coupon) {
    Logger.info(`Adding coupon: ${coupon}`);

    if (this.data.includes(coupon)) {
      Logger.warn(`Coupon ${coupon} already exists`);
      throw new Error(`Coupon ${coupon} already exists`);
    }

    this.data.push(coupon);
    await this.save();
  }

  async removeCoupon(coupon) {
    Logger.info(`Removing coupon: ${coupon}`);
    const index = this.data.indexOf(coupon);
    if (index > -1) {
      this.data.splice(index, 1);
      await this.save();
    } else {
      Logger.warn(`Coupon ${coupon} not found`);
      throw new Error(`Coupon ${coupon} not found`);
    }
  }

  getCoupons() {
    return this.data;
  }
}

module.exports = CouponsDataManager;