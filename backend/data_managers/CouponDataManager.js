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

  async addCoupons(coupons) {
    Logger.info(`Adding coupons: ${coupons}`);

    const uniqueCoupons = [...new Set(coupons)];
    const newCoupons = uniqueCoupons.filter(coupon => !this.data.includes(coupon));

    if (newCoupons.length > 0) {
      this.data.push(...newCoupons);
      await this.save();
      Logger.info(`Successfully added ${newCoupons.length} new coupons`);
      return {success: true, message: `Successfully added ${newCoupons.length} new coupons`};
    } else {
      Logger.warn('No new coupons to add');
      return {success: false, message: 'No new coupons to add'};
    }
  }

  async removeCoupon(coupon) {
    Logger.info(`Removing coupon: ${coupon}`);
    const index = this.data.indexOf(coupon);
    if (index > -1) {
      this.data.splice(index, 1);
      await this.save();
      return true;
    } else {
      Logger.warn(`Coupon ${coupon} not found`);
      return false;
    }
  }

  getCoupons() {
    return this.data;
  }
}

module.exports = CouponsDataManager;