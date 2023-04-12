import { Router } from "express";
import * as whatsappHandlers from "../handlers/whatsapp"

export const v1router = Router();

v1router.get("/v1/webhook", whatsappHandlers.verifyWebhook)
v1router.post("/v1/webhook", whatsappHandlers.onMessageReceivedHandler)
v1router.post("/v1/triggerPayment", whatsappHandlers.triggerTripCompletionHandler)