import {Request, Response, NextFunction} from "express"
import { UnauthorizedError } from "../utils/errors";

export interface TelegramAuthenticatedRequest extends Request {
  "x-telegram-bot-api-secret-token"?: string
}

export async function telegramAuthHandler(
  req: TelegramAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (req.headers["x-telegram-bot-api-secret-token"] !== process.env.TELEGRAM_BOT_API_SECRET_TOKEN) {
      throw new UnauthorizedError("Unauthorized Request")
    }
    next()
  } catch (error) {
    next(error);
  }
}