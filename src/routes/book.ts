import { Router } from "express";
import {bookAutoUsingAssistantHandler} from "../handlers/book"

export const v1router = Router();

v1router.post("/v1/assistantBooking", bookAutoUsingAssistantHandler)