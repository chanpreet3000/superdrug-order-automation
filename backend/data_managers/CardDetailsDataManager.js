const fs = require('fs').promises;
const path = require('path');
const Logger = require("../utils/Logger");

class CardDetailsDataManager {
  static _instance = null;

  constructor() {
    if (CardDetailsDataManager._instance) {
      return CardDetailsDataManager._instance;
    }
    CardDetailsDataManager._instance = this;
    this.filename = path.join(__dirname, '..', 'data', 'card_details.json');
    this.data = null;
    this.init();
  }

  async init() {
    Logger.info("Initializing CardDetailsDataManager");
    try {
      const fileContent = await fs.readFile(this.filename, 'utf8');
      this.data = JSON.parse(fileContent);
      if (!Array.isArray(this.data)) {
        throw new Error('Data is not an array');
      }
      Logger.debug('CardDetailsDataManager initialized with data:', this.data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        Logger.warn(`Database file ${this.filename} not found. Initializing with empty array.`);
        this.data = [];
      } else if (error instanceof SyntaxError || error.message === 'Data is not an array') {
        Logger.error('Error parsing JSON in CardDetailsDataManager:', error);
        throw error;
      } else {
        Logger.error('Error initializing CardDetailsDataManager:', error);
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

  async addCardDetails(cardDetails) {
    cardDetails['used'] = 0;
    Logger.info(`Adding card details: ${JSON.stringify(cardDetails)}`);

    const existingCard = this.data.find(card => card.number === cardDetails.number);
    if (existingCard) {
      Logger.warn(`Card with number ${cardDetails.number} already exists`);
      throw new Error(`Card with number ${cardDetails.number} already exists`);
    }

    this.data.push(cardDetails);
    await this.save();
  }

  async removeCardDetails(cardNumber) {
    Logger.info(`Removing card details with number: ${cardNumber}`);
    const initialLength = this.data.length;
    this.data = this.data.filter(card => card.number !== cardNumber);
    if (this.data.length === initialLength) {
      Logger.warn(`Card with number ${cardNumber} not found`);
      throw new Error(`Card with number ${cardNumber} not found`);
    }
    await this.save();
  }

  async incrementCardUsage(cardNumber) {
    Logger.info(`Incrementing usage for card with number: ${cardNumber}`);

    const card = this.data.find(card => card.number === cardNumber);
    if (!card) {
      Logger.warn(`Card with number ${cardNumber} not found`);
      throw new Error(`Card with number ${cardNumber} not found`);
    }

    card.used += 1;
    Logger.info(`Card ${cardNumber} usage incremented to: ${card.used}`);

    await this.save();
  }

  getCardDetails() {
    return this.data;
  }
}

module.exports = CardDetailsDataManager;