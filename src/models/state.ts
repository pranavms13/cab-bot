import Cache from "../utils/cache";

export enum Platform {
  Whatsapp = 'whatsapp',
  Telegram = 'telegram',
}

export default class State {
  platform: Platform;
  userId: string;
  previousStep: number;
  nextStep: number;
  metaData: {
    pickupLocation: string;
    dropLocation: string;
    contactNumber: string;
  };

  constructor(platform: Platform, userId: string, previousStep: number, nextStep: number, metaData: any) {
    this.platform = platform;
    this.userId = userId;
    this.previousStep = previousStep;
    this.nextStep = nextStep;
    this.metaData = metaData;
  }

  async saveState() : Promise<void> {
    await Cache.getCache().hset(
      this.userId,
      this.platform,
      this.userId,
      this.previousStep,
      this.nextStep,
      JSON.stringify(this.metaData)
    );
    await Cache.getCache().expire(this.userId, parseInt(process.env.TTL!) * 60);
  }

  static async fetchFromCache(key: string) : Promise<State | null> {
    let data = await Cache.getCache().hgetall(key);
    if (data) {
      return new State(
        data.platform == "whatsapp" ? Platform.Whatsapp : Platform.Telegram,
        data.userId,
        parseInt(data.previousStep),
        parseInt(data.nextStep),
        JSON.parse(data.metaData)
      );
    }
    return null
  }
}