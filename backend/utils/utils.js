const Logger = require("./Logger");
const {z} = require("zod");
exports.tryCatch = (controller) => async (req, res, next) => {
  try {
    await controller(req, res, next);
  } catch (error) {
    next(error);
  }
}

exports.error_handler = (err, req, res, next) => {  // Added 'next' parameter here

  if (err instanceof z.ZodError) {
    Logger.critical('Validation Error Occurred', err);
    res.status(400).json({
      message: 'Validation error',
      error: err.errors[0],
    });
  } else {
    res.status(500).json({
      message: 'Internal server error',
      error: err.message ?? 'An unexpected error occurred',
    });
  }
}