import {Request, Response, NextFunction, raw} from "express"
import DB from "../utils/db";
import { whatsappAxiosInstance } from "../utils/whatsapp";
import State, { Platform } from "../models/state";
import { AxiosError } from "axios";
import logger from "../utils/logger";

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

    const update = req.body

    if(update.entry[0].changes[0].value.messages) {
      // Constants from Whatsapp Update
      const waId = update.entry[0].changes[0].value.contacts[0].wa_id;
      const messageType = update.entry[0].changes[0].value.messages[0].type;
      
      // Metadata for further processing
      let templateId : string | null = null;
      let rawMessage : string | null = null;

      // Check for previous states
      let currentState = await State.fetchFromCache(waId);

      // If state not found, create a new state
      if (!currentState) {
        currentState = new State(Platform.Whatsapp, waId, 0, 1, {
          pickupLocation: null,
          dropLocation: null,
          pickupDate: null,
        });
        templateId = "welcome_message";
        rawMessage = null;
      } else {
        switch(currentState.previousStep) {
          case 0:
            if (messageType !== "button") {
              rawMessage = "Oh no! That's a wrong response. Please try again!";
            } else {
              templateId = "request_pickup_location";
              currentState.nextStep = 2;
              currentState.previousStep = 1;
              rawMessage = null;
            }
            break;
        }
      }

      currentState.saveState();
      await sendWhatsappMessage(waId, templateId, rawMessage);
    }

    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}

// Private Methods

async function sendWhatsappMessage(waId: string, templateId: string | null, rawMessage: string | null) : Promise<void> {
  let outgoingMessage : any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: waId,
  };
  if(templateId) {
    outgoingMessage = {
      ...outgoingMessage,
      type: "template",
      template: {
        name: "welcome_message",
        language: {
          code: "en",
        },
      },
    };
  } else if(rawMessage) {
    outgoingMessage = {
      ...outgoingMessage,
      type: "text",
      text: {
        preview_url: false,
        body: rawMessage,
      },
    };
  }
  try {
    const _ = await whatsappAxiosInstance.post("/messages", outgoingMessage);
  } catch (error) {
    if(error instanceof AxiosError) {
      logger.error(JSON.stringify(error.response?.data, null, 2))
    }
  }
}