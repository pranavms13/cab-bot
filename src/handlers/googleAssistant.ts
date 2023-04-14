import {Request, Response, NextFunction} from "express"
import State, { Platform } from "../models/state";
import { conversation } from "@assistant/conversation";

const gapp = conversation();

export async function handleGoogleAssistantWebhookHandler(req: Request, res: Response, next: NextFunction) {
    try {
        let authtoken = req.headers.authorization;
        console.log(authtoken);
    } catch (error) {
        next(error);
    }
}

gapp.handle("checkUserRegistered", async (conv) => {
    console.log("checkUserRegistered");
    console.log(conv.user);
    // let state = new State(Platform.GoogleAssistant, conv.user.id, -1, 0, {
    //     pickupLocation: null,
    //     dropLocation: null,
    //     contactNumber: null,
    //     isOnlyList: false
    // });
    // await state.saveState();
    // conv.ask("Please share your contact number.");
});

export default gapp;