import {Request, Response, NextFunction} from "express"
import { TelegramAuthenticatedRequest } from "../middlewares/auth";
import State, { Platform } from "../models/state";

export async function handleTelegramWebhookHandler(
  req: TelegramAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    handleTelegramWebhook(req.body as TelegramUpdate);
    res.status(200).json({
      status: "ok",
    });
  } catch (error) {
    next(error);
  }
}

// Private Functions
async function handleTelegramWebhook(data: TelegramUpdate) {
  // console.log(JSON.stringify(data, null, 2));
  if(!data.message?.from.id){
    return;
  }
  let currentState = await State.fetchFromCache(data.message?.from.id.toString());
  if (!currentState) {
    currentState = new State(Platform.Telegram, data.message?.from.id.toString(), 0, 1, {
      pickupLocation: null,
      dropLocation: null,
      pickupDate: null,
    });
    
  }
}

// Types
interface TelegramUpdate {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  channel_post?: Message;
  edited_channel_post?: Message;
}

interface Message {
  message_id: number;
  message_thread_id: number;
  from: User;
  sender_chat?: Chat;
  date: number;
  chat: Chat;
  forward_from?: User;
  forward_from_chat?: Chat;
  forward_from_message_id?: number;
  forward_signature?: string;
  forward_sender_name?: string;
  forward_date?: number;
  reply_to_message?: Message;
  is_topic_message?: boolean;
  is_automatic_forward?: boolean;
  via_bot?: User;
  edit_date?: number;
  has_protected_content?: boolean;
  media_group_id?: string;
  author_signature?: string;
  text?: string;
  entities?: MessageEntity[];
  contact?: Contact;
  location?: TelegramLocation;
}

interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  can_join_groups?: boolean;
  can_read_all_group_messages?: boolean;
  supports_inline_queries: boolean;
}

interface Chat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

interface MessageEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  user?: User;
  language?: string;
  custom_emoji_id?: string;
}

interface Contact {
  phone_number: string;
  first_name: string;
  last_name?: string;
  user_id?: number;
  vcard?: string;
}

interface TelegramLocation {
  longitude: number;
  latitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}