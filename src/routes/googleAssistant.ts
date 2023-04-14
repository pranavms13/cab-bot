import { Router } from "express";
import gapp from "../handlers/googleAssistant";

export const v1router = Router();

v1router.post("/v1/handler", gapp)