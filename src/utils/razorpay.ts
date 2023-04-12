import Razorpay from "razorpay"
import logger from "./logger"

let instance : Razorpay | null = null

export default class PaymentGateway {
  private keyId: string
  private keySecret: string

  constructor() {

    if(!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay key id or secret not found")
    }

    this.keyId = process.env.RAZORPAY_KEY_ID
    this.keySecret = process.env.RAZORPAY_KEY_SECRET
  }

  initialize() : void {
    instance = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret
    })
    logger.info("Razorpay initialized")
  }

  static getInstance() : Razorpay {
    if(!instance) {
      throw new Error("Razorpay not initialized")
    }
    return instance!
  }
}