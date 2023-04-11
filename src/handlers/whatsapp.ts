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
    // Insert All Updates to DB
    DB.instance().collection("whatsapp").insertOne({
      ...req.body,
      timestamp: new Date(),
    });

    // Check for previous states

    // If state not found, create a new state

    let update = req.body;
    if(update) {}
    const response = await whatsappAxiosInstance.post("/messages", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: req.body.entry[0].changes[0].value.contacts[0].wa_id,
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