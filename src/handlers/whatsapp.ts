import {Request, Response, NextFunction} from "express"
import DB from "../utils/db";

export async function verifyWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(200).send(req.query["hub.challenge"]);
  } catch (error) {
    next(error);
  }
}

export async function onMessageReceivedHandler(req: Request, res: Response, next: NextFunction) {
  try {
    DB.instance().collection("whatsapp").insertOne(req.body);
    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}