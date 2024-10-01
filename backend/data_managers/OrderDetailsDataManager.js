const fs = require('fs').promises;
const path = require('path');
const Logger = require("../utils/Logger");

class OrderDetailsDataManager {
  static _instance = null;

  constructor() {
    if (OrderDetailsDataManager._instance) {
      return OrderDetailsDataManager._instance;
    }
    OrderDetailsDataManager._instance = this;
    this.filename = path.join(__dirname, '..', 'data', 'order_details.json');
    this.data = null;
    this.init();
  }

  async init() {
    Logger.info("Initializing OrderDetailsDataManager");
    try {
      const fileContent = await fs.readFile(this.filename, 'utf8');
      this.data = JSON.parse(fileContent);
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      Logger.debug('OrderDetailsDataManager initialized with data:', this.data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        Logger.warn(`Database file ${this.filename} not found. Initializing with empty array.`);
        this.data = [];
      } else if (error instanceof SyntaxError || error.message === 'Data is not an array') {
        Logger.error('Error parsing JSON in OrderDetailsDataManager:', error);
        throw error;
      } else {
        Logger.error('Error initializing OrderDetailsDataManager:', error);
        throw error;
      }
    }
  }

  async save() {
    Logger.info("Saving order data to file");
    try {
      await fs.writeFile(this.filename, JSON.stringify(this.data, null, 2));
    } catch (error) {
      Logger.error('Error saving order data:', error);
      throw error;
    }
  }

  async addOrderDetails(orderDetails) {
    const currentTimestamp = new Date().toISOString();
    const orderWithTimestamp = {...orderDetails, timestamp: currentTimestamp};

    Logger.info(`Adding new order details: ${JSON.stringify(orderWithTimestamp)}`);

    this.data.push(orderWithTimestamp);
    await this.save();
  }

  getOrderDetails() {
    return this.data;
  }
}

module.exports = OrderDetailsDataManager;
