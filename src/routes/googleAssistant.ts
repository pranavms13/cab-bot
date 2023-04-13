import { Router } from "express";
import { handleGoogleAssistant } from "../handlers/googleAssistant";

export const v1router = Router();

v1router.post("/v1/handler", handleGoogleAssistant)