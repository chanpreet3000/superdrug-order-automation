const path = require('path');
// use npm install chalk@4.1.2
const chalk = require('chalk');
const util = require('util');
const fs = require('fs');

class Logger {
  static #colors = {
    debug: chalk.cyan, info: chalk.green, warn: chalk.yellow, error: chalk.redBright, critical: chalk.bgRed.whiteBright
  };

  static #findProjectRoot(dir) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      return null;
    }
    return this.#findProjectRoot(parentDir);
  }

  static #getCallerInfo() {
    const err = new Error();
    const stack = err.stack.split('\n');
    const callerLine = stack[4]; // Index 2 for the immediate caller
    const match = callerLine.match(/\((.+):(\d+):(\d+)\)$/);
    if (match) {
      const [, filePath, lineNo] = match;
      const projectRoot = this.#findProjectRoot(__dirname) || path.parse(filePath).root;
      const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/')
      return `./${relativePath}:${lineNo}`;
    }
    return 'unknown';
  }

  static #formatData(data) {
    return data.map(item => typeof item === 'object' ? util.inspect(item, {colors: true, depth: null}) : item);
  }

  static #padRight(str, len) {
    return str.padEnd(len);
  }

  static #log(type, message, ...data) {
    const timestamp = new Date().toISOString();
    const callerInfo = this.#getCallerInfo();
    const color = this.#colors[type.toLowerCase()];

    console.log(`${chalk.white(this.#padRight(timestamp, 27))} ` + `${color(this.#padRight(type, 10))} ` + `${chalk.white(this.#padRight(callerInfo, 40))} ` + `${color(message)}`);

    const formattedData = this.#formatData(data);
    formattedData.forEach(item => console.log(chalk.whiteBright(item)));
  }

  static debug(message, ...data) {
    this.#log('DEBUG', message, ...data);
  }

  static info(message, ...data) {
    this.#log('INFO', message, ...data);
  }

  static warn(message, ...data) {
    this.#log('WARN', message, ...data);
  }

  static error(message, ...data) {
    this.#log('ERROR', message, ...data);
  }

  static critical(message, ...data) {
    this.#log('CRITICAL', message, ...data);
  }
}

module.exports = Logger;
