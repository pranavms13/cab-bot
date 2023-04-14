import {Request, Response, NextFunction} from "express"
import State, { Platform } from "../models/state";
import DB from "../utils/db";
import { conversation } from "@assistant/conversation";

import { verify } from "../utils/google";

const gapp = conversation();

gapp.handle("checkUserRegistered", async (conv) => {
    let payload = await verify(conv.headers['authorization'] as string);
    let result = await DB.instance().collection('googleAssistantContacts').findOne({id: payload!.sub});
    if(result && result.phone && result.phone.length > 0){
        let state = new State(Platform.GoogleAssistant, payload!.sub, 0, 1, {
            pickupLocation: null,
            dropLocation: null,
            contactNumber: (result as any).phone,
            isOnlyList: false
        });
        await state.saveState();
        conv.user.params = {
            ...conv.user.params,
            contactNumber: (result as any).phone,
            id: payload!.sub
        }
    } else if(result && result.phone == null){
        let state = new State(Platform.GoogleAssistant, payload!.sub, -1, 0, {
            pickupLocation: null,
            dropLocation: null,
            contactNumber: null,
            isOnlyList: false
        });
        await state.saveState();
        conv.user.params = {
            ...conv.user.params,
            contactNumber: null,
            id: payload!.sub
        }
        conv.add("Please share your contact number. This is required to book an auto.");
    }else{
        let state = new State(Platform.GoogleAssistant, payload!.sub, -1, 0, {
            pickupLocation: null,
            dropLocation: null,
            contactNumber: null,
            isOnlyList: false
        });
        await state.saveState();
        await DB.instance().collection('googleAssistantContacts').insertOne({
            id: payload!.sub,
            name: payload!.name,
            email: payload!.email,
            picture: payload!.picture,
            phone: null
        });
        conv.add("Please share your contact number. This is required to book an auto.");
    }
});

gapp.handle("shareContact", async (conv) => {
    console.log(conv);
    console.log(conv.intent.params!.phoneNumber);
});

export default gapp;