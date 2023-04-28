require("dotenv").config();

import { Context, Telegraf } from "telegraf";
import DB from "../utils/db";
import State from "../models/state";
import { Platform } from "../models/state";
import { getCost } from "../utils/cost";
import { getDistanceBetweenTwoPoints } from "../utils/geo";
import { faker } from "@faker-js/faker";


const bot = new Telegraf(process.env.telegramBotToken!);

bot.command('start', async (ctx: Context) => {
    let result = await DB.instance().collection('telegramContacts').findOne({id: ctx.chat?.id})
    if(result && (result as any).phone_number && (result as any).phone_number.length > 0){
        let state = new State(Platform.Telegram, ctx.chat!.id.toString(), 0, 1, {
            pickupLocation: null,
            dropLocation: null,
            contactNumber: (result as any).phone_number,
            isOnlyList: false
        });
        state.saveState();
        bot.telegram.sendMessage(ctx.chat!.id.toString(), `Hi ${result.first_name}!\nWelcome to Namma Yatri!\n\nTo continue, please select the options below.`,{
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Book an auto",
                            callback_data: "book_auto"
                        },
                        {
                            text: "List nearby autos",
                            callback_data: "list_nearby_autos"
                        },
                    ],
                    [
                        {
                            text: "About us",
                            callback_data: "about_us"
                        }
                    ]
                ]
            }
        })
    }else{
        let state = new State(Platform.Telegram, ctx.chat!.id.toString(), -1, 0, {
            pickupLocation: null,
            dropLocation: null,
            contactNumber: null,
            isOnlyList: false
        });
        state.saveState();
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Welcome to Namma Yatri!\n\nTo continue, please share your contact number.",{
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Share contact",
                            request_contact: true
                        }
                    ]
                ],
            }
        });
    }
});

bot.on("callback_query", (ctx: Context) => {
    switch(JSON.parse(JSON.stringify(ctx.callbackQuery))['data']){
        case "about_us":
            aboutUs(ctx);
            break;
        case "book_auto":
            bookAuto(ctx);
            break;
        case "list_nearby_autos":
            listNearbyAutos(ctx);
            break;
        case "confirm_booking":
            confirmBooking(ctx);
            break;
        default:
            break;
    }
});

bot.on("contact", async (ctx: Context) => {
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    if(state?.nextStep == 0){
        let contact = JSON.parse(JSON.stringify(ctx.message))['contact'];
        DB.instance().collection('telegramContacts').insertOne({
            id: contact['user_id'],
            phone_number: contact['phone_number'],
            first_name: contact['first_name'],
            last_name: contact['last_name'],
            username: contact['username']
        }).then((result) => {
            if(result){
                state!.nextStep = 1;
                state!.previousStep = 0;
                state!.metaData.contactNumber = contact['phone_number'];
                state?.saveState();
                bot.telegram.sendMessage(ctx.chat!.id.toString(), `Thank you ${contact['first_name']} for sharing your contact number.\n\nPlease select the options below.`,{
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "Book an auto",
                                    callback_data: "book_auto"
                                },
                                {
                                    text: "List nearby autos",
                                    callback_data: "list_nearby_autos"
                                },
                            ],
                            [
                                {
                                    text: "About us",
                                    callback_data: "about_us"
                                }
                            ]
                        ]
                    }
                })
            }
        });
    }else{
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please send '/start' to begin.");
    }
});

bot.on("location", async (ctx: Context) => {
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    if(state?.nextStep == 2){
        let location = JSON.parse(JSON.stringify(ctx.message))['location'];
        state!.nextStep = 3;
        state!.previousStep = 2;
        state!.metaData.pickupLocation = location;
        state?.saveState();
        await ctx.reply("Thank you for sharing your pickup location.");
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please share your drop location.");
    }else if(state?.nextStep == 3){
        let location = JSON.parse(JSON.stringify(ctx.message))['location'];
        state!.nextStep = 4;
        state!.previousStep = 3;
        state!.metaData.dropLocation = location;
        state?.saveState();
        await ctx.reply("Thank you for sharing your drop location.");
        completeBookingAuto(ctx);
    }else{
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please send '/start' to begin.");
    }
});

async function aboutUs(ctx: Context){
    ctx.reply("I am a bot that can help you book an auto. Please send '/start' to begin.\n\n\nTo know more about us, click on the link below:\nhttps://nammayatri.in/about/");
    return;
}

async function bookAuto(ctx: Context){
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    if(state?.nextStep == 1){
        state!.nextStep = 2;
        state!.previousStep = 1;
        state?.saveState();
        ctx.reply("Thanks for choosing to use our services for booking an Auto!\n\nTo continue, please share the pickup location where the passenger needs to be picked up.");
    }else{
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please send '/start' to begin.");
    }
}

async function completeBookingAuto(ctx: Context){
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    if(state?.nextStep == 4){
        state!.nextStep = 5;
        state!.previousStep = 4;
        state?.saveState(); 
        if(state!.metaData.pickupLocation && state!.metaData.dropLocation){
            let cost = getCost(state!.metaData.pickupLocation, state!.metaData.dropLocation);
            let distance = getDistanceBetweenTwoPoints(state!.metaData.pickupLocation, state!.metaData.dropLocation);
            bot.telegram.sendMessage(ctx.chat!.id.toString(), `The estimate for the trip is as below:\n\nTotal Distance: ${distance} km\nEstimated Cost: Rs. ${Math.ceil(cost)} - ${Math.ceil(cost + (cost * 0.1))}\n\nPlease confirm the booking by clicking on the button below.`,{
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Confirm",
                                callback_data: "confirm_booking"
                            },
                            {
                                text: "Cancel",
                                callback_data: "cancel_booking"
                            }
                        ]
                    ]
                }
            });
        }
    }
}

async function confirmBooking(ctx: Context){
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    if(state?.nextStep == 5){
        state!.clearCache();
        await ctx.reply("Booking in Progress");
        bot.telegram.sendMessage(ctx.chat!.id.toString(), `Wohoo!🎉\n\nBooking confirmed! Our auto is on the way to pick you up!\n\nTrip Details:\nVehicle Number: KA ${faker.random.numeric(2, { allowLeadingZeros: true })} ${faker.random.alpha({ count: 2, casing: "upper" })} ${faker.random.numeric(4, { allowLeadingZeros: true })}\nDriver's Name: ${faker.name.fullName()}\nDriver's Phone: ${faker.phone.number("+91-##########")}\nOTP: ${faker.random.numeric(4, { allowLeadingZeros: true })}\n\nPlease share the OTP with the driver to start the ride.`);        
    }else{
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please send '/start' to begin.");
    }
}

async function listNearbyAutos(ctx: Context){
    let state = await State.fetchFromCache(ctx.chat!.id.toString());
    let rawMessage = "List of Autos nearby:\n";
    if(state?.nextStep == 1){
        for(let i = 0; i < 5; i++) {
            const driverName = faker.name.fullName()
            const distance = `${faker.random.numeric(1, {
              allowLeadingZeros: false,
              bannedDigits: ["2", "3", "4", "5", "6", "7", "8", "9"],
            })}.${faker.random.numeric(2, {
              allowLeadingZeros: true,
            })}`;
            const phone = faker.phone.number("+91 ##########")
            rawMessage += `${i+1}. ${driverName} - ${distance} km away - ${phone}\n`
        }
        ctx.reply(rawMessage);
    }else{
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Please send '/start' to begin.");
    }
}

export default bot;