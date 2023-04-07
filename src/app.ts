require("dotenv").config();

import Express, { NextFunction, Request, Response } from "express";
import DB from "./utils/db";
import logger from "./utils/logger";
import Cache from "./utils/cache";

async function main() {
  try {
    await new DB().initialize();
    await new Cache().initialize();

    const app = Express();

    app.use(Express.json());

    app.get("/api/whatsapp/v1/webhook", async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log(req.params);
        res.status(200).send(req.params.hub_challenge);
      } catch (error) {
        next(error);
      }
    })

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`Server started on port ${process.env.PORT || 3000}`);
    })
  } catch (error) {
    logger.error(error);
  }
}

main();