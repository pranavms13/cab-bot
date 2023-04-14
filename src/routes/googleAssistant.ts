import { Router } from "express";
import gapp, {handleGoogleAssistantWebhookHandler} from "../handlers/googleAssistant";

export const v1router = Router();

v1router.post("/v1/handler", handleGoogleAssistantWebhookHandler, gapp);