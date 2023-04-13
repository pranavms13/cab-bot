import {Request, Response, NextFunction} from "express"
import State, { Platform } from "../models/state";

export async function handleGoogleAssistant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log(req.body);
      res.status(200).json({
        status: "ok",
      });
    } catch (error) {
      next(error);
    }
}