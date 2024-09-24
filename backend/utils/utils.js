const Logger = require("./Logger");
const {z} = require("zod");
exports.tryCatch = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
}

exports.error_handler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    Logger.critical('Validation Error Occurred', err);
    res.status(400).json({
      message: 'Validation error', error: err.errors[0],
    });
  } else {
    res.status(500).json({
      message: 'Internal server error', error: err.message ?? 'An unexpected error occurred',
    });
  }
}

exports.sleepRandomly = async (baseSleep, randomness = 1, message = null) => {
  let delay = baseSleep + (Math.random() * 2 * randomness - randomness);
  delay = Math.max(delay, 0);
  if (message === null) {
    Logger.debug(`Sleeping for ${delay.toFixed(2)} seconds`);
  } else {
    Logger.debug(`Sleeping for ${delay.toFixed(2)} seconds - ${message}`);
  }
  await new Promise(resolve => setTimeout(resolve, delay * 1000));
}

exports.changeViewport = async (GL, page) => {
  const viewPort = GL.getViewPort();
  await page.setViewport({width: Math.round(viewPort.width * 0.994), height: Math.round(viewPort.height * 0.92)});
  const session = await page.target().createCDPSession();
  const {windowId} = await session.send('Browser.getWindowForTarget');
  await session.send('Browser.setWindowBounds', {windowId, bounds: viewPort});
  await session.detach();
}