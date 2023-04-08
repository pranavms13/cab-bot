import { Router } from "express";
import {handleTelegramWebhookHandler} from "../handlers/telegram"

export const v1router = Router();

v1router.post("/v1/handler", handleTelegramWebhookHandler)