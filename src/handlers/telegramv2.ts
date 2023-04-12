import { Context, Telegraf } from "telegraf";
import DB from "../utils/db";
import { message } from "telegraf/filters";
import State from "../models/state";

const bot = new Telegraf("6193187867:AAETdeqrmaRHRMAQJKkf-9Glay9JmkfNZ_k");

bot.command('start', (ctx: Context) => {
    if(checkDbForContact(ctx)){
        
        bot.telegram.sendMessage(ctx.chat!.id.toString(), "Welcome to Namma Yatri!\n\nTo continue, please select the options below.",{
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

bot.inlineQuery("book_auto", (ctx: Context) => {
    
});

bot.inlineQuery("list_nearby_autos", (ctx: Context) => {

});

bot.on("contact", (ctx: Context) => {
    
});

function checkDbForContact(ctx: Context) {
    if(ctx.message?.from.id){
        DB.instance().collection('telegramContacts').findOne({id: ctx.message?.from.id}).then((result) => {
            if(result){
                return true;
            } else {
                return false;
            }
        });
    }
    return false;
}

// bot.launch();

export default bot;

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));