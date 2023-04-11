import {Request, Response, NextFunction} from "express"
import DB from "../utils/db";
import { whatsappAxiosInstance } from "../utils/whatsapp";

export async function verifyWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).send(req.query["hub.challenge"]);
  } catch (error) {
    next(error);
  }
}

export async function onMessageReceivedHandler(req: Request, res: Response, next: NextFunction) {
  try {
    DB.instance().collection("whatsapp").insertOne({
      ...req.body,
      timestamp: new Date(),
    });
    const response = await whatsappAxiosInstance.post("/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: req.body.entry[0].messaging[0].sender.id,
      type: "template",
      template: {
        name: "welcome_message",
        language: {
          code: "en",
        },
      },
    });
    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}