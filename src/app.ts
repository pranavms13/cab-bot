require("dotenv").config();

import Express from "express";
import DB from "./utils/db";
import logger from "./utils/logger";
import Cache from "./utils/cache";

async function main() {
  try {
    await new DB().initialize();
    await new Cache().initialize();

    const app = Express();

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`Server started on port ${process.env.PORT || 3000}`);
    })
  } catch (error) {
    logger.error(error);
  }
}

main();