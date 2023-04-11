import axios from "axios";

export const whatsappAxiosInstance = axios.create({
  baseURL: `https://graph.facebook.com/v16.0/${process.env.whatsappPhoneId}`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.whatsappToken}`,
  },
});