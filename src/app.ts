require("dotenv").config();

import Express, { NextFunction, Request, Response } from "express";
import DB from "./utils/db";
import logger from "./utils/logger";
import Cache from "./utils/cache";

import { v1router as whatsappv1Routes } from "./routes/whatsapp";
import {v1router as telegramv1Routes} from "./routes/telegram"
import {v1router as bookV1Routes} from "./routes/book"
import State from "./models/state";
import PaymentGateway from "./utils/razorpay";

async function main() {
  try {
    await new DB().initialize();
    await new Cache().initialize();

    new PaymentGateway().initialize();

    const app = Express();

    app.use(Express.json());

    app.get("/api/flushAllCache", async (req: Request, res: Response, next: NextFunction) => {
      await State.clearAllCache();
      res.status(200).json({
        status: "ok",
      });
    })

    app.use("/api/whatsapp", whatsappv1Routes)
    app.use("/api/telegram", telegramv1Routes)
    app.use("/api/book", bookV1Routes)

    app.listen(process.env.PORT || 3000, () => {
      logger.info(`Server started on port ${process.env.PORT || 3000}`);
    })
  } catch (error) {
    logger.error(error);
  }
}

main();