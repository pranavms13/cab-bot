require("dotenv").config();

import Express, { NextFunction, Request, Response } from "express";
import DB from "./utils/db";
import logger from "./utils/logger";
import Cache from "./utils/cache";

import { v1router as whatsappv1Routes } from "./routes/whatsapp";

async function main() {
  try {
    await new DB().initialize();
    await new Cache().initialize();

    const app = Express();

    app.use(Express.json());

    app.use("/api/whatsapp", whatsappv1Routes)

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`Server started on port ${process.env.PORT || 3000}`);
    })
  } catch (error) {
    logger.error(error);
  }
}

main();