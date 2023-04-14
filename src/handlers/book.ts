import {Request, Response, NextFunction} from "express"
import { sendWhatsappMessage } from "./whatsapp"
import { faker } from "@faker-js/faker";

export async function bookAutoUsingAssistantHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const {fullName, phone, email} = req.body

    sendWhatsappMessage(
      `${phone.countryCode}${phone.phoneNumber}`,
      "trip_confirmation",
      null,
      [
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
      ]
    );

    res.status(200).json({
      status: "ok"
    })
  } catch (error) {
    next(error)
  }
}
