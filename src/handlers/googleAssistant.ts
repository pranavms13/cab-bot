import {Request, Response, NextFunction} from "express"
import State, { Platform } from "../models/state";
import { conversation } from "@assistant/conversation";

import { verify } from "../utils/google";

const gapp = conversation();

gapp.handle("checkUserRegistered", async (conv) => {
    console.log("checkUserRegistered");
    console.log(conv.headers);
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