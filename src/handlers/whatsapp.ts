import {Request, Response, NextFunction, raw} from "express"
import DB from "../utils/db";
import { whatsappAxiosInstance } from "../utils/whatsapp";
import State, { Platform } from "../models/state";
import { AxiosError } from "axios";
import logger from "../utils/logger";
import { faker } from "@faker-js/faker"

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
      const selectedButtonMessageContent = update.entry[0].changes[0].value.messages[0].button?.text;
      
      // Metadata for further processing
      let templateId : string | null = null;
      let rawMessage : string | null = null;
      let components : any[] = [];

      // Check for previous states
      let currentState = await State.fetchFromCache(waId);

      // If state not found, create a new state
      if (!currentState) {
        currentState = new State(Platform.Whatsapp, waId, 0, 1, {
          pickupLocation: null,
          dropLocation: null,
          contactNumber: null,
          isOnlyList: false,
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
              currentState.nextStep = 2 ;
              currentState.previousStep = 1;
              rawMessage = null;
              if(selectedButtonMessageContent.split(".")[0] == "2") {
                currentState.metaData.isOnlyList = true;
              } else if (selectedButtonMessageContent.split(".")[0] == "3") {
                rawMessage =
                  "I am a bot that can help you book an auto. Please type 'Hi' to begin.\n\n\nTo know more about us, click on the link below:\nhttps://nammayatri.in/about/";
                templateId = null;
                  currentState.nextStep = 0;
                currentState.previousStep = 0;
              }
            }
            break;

          case 1:
            if (messageType !== "location") {
              rawMessage = "Oh no! That's a wrong response. Please try again!";
            }
            else {
              currentState.metaData.pickupLocation = update.entry[0].changes[0].value.messages[0].location;
              if(currentState.metaData.isOnlyList) {
                templateId = null;
                rawMessage = "List of Autos nearby:\n"
                for(let i = 0; i < 5; i++) {
                  const driverName = faker.name.fullName()
                  const distance = `${faker.random.numeric(1, {
                    allowLeadingZeros: false,
                    bannedDigits: ["2", "3", "4", "5", "6", "7", "8", "9"],
                  })}.${faker.random.numeric(2, {
                    allowLeadingZeros: true,
                  })}`;
                  const phone = faker.phone.number("+91 ##########")
                  rawMessage += `${i+1}. ${driverName} - ${distance} km away - ${phone}\n`
                }
                currentState.nextStep = 0;
                currentState.previousStep = 0;
              } else {
                templateId = "request_drop_location";
                rawMessage = null;
                currentState.nextStep = 3;
                currentState.previousStep = 2;
              }
            }
            break;

          case 2:
            if (messageType !== "location") {
              rawMessage = "Oh no! That's a wrong response. Please try again!";
            } else {
              currentState.metaData.dropLocation = update.entry[0].changes[0].value.messages[0].location;
              // rawMessage = "We are working on booking an auto for you! Please wait for a while.";
              // templateId = null;
              currentState.nextStep = 4;
              currentState.previousStep = 3;
              templateId = "estimate_reply";
              components = [
                {
                  type: "body",
                  parameters: [
                    {
                      type: "text",
                      text: "34"
                    },
                    {
                      type: "text",
                      text: "100"
                    }
                  ]
                }
              ]
            }
            rawMessage = null;
            break;

            case 3:
              if (messageType !== "button") {
                rawMessage = "Oh no! That's a wrong response. Please try again!";
              } else {
                templateId = "trip_confirmation";
                currentState.nextStep = 5;
                currentState.previousStep = 4;
                rawMessage = null;
                components = [
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: `KA ${faker.random.numeric(2, {
                          allowLeadingZeros: true,
                        })} ${faker.random.alpha({
                          count: 2,
                          casing: "upper",
                        })} ${faker.random.numeric(4, {
                          allowLeadingZeros: true,
                        })}`,
                      },
                      {
                        type: "text",
                        text: faker.name.fullName(),
                      },
                      {
                        type: "text",
                        text: faker.phone.number("+91 ##########"),
                      },
                      {
                        type: "text",
                        text: Math.floor(
                          1000 + Math.random() * 9000
                        ).toString(),
                      },
                    ],
                  },
                ];
              }
              break;

          default:
            logger.error("Unhandled switch case")
            rawMessage = "Unhandled switch case encountered!"
        }
      }

      if(currentState.nextStep === 0 && currentState.previousStep === 0) {
        currentState.clearCache()
      } else if(currentState.nextStep === 5) {
        // Temporary Only
        currentState.clearCache()
      } else {
        currentState.saveState();
      }
      await sendWhatsappMessage(waId, templateId, rawMessage, components);
    }

    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}

// Private Methods

async function sendWhatsappMessage(waId: string, templateId: string | null, rawMessage: string | null, components: any[]) : Promise<void> {
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
        name: templateId,
        language: {
          code: "en",
        },
      },
    };
    if(components.length > 0) {
      outgoingMessage.template["components"] = components;
    }
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