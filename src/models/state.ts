import Cache from "../utils/cache";

export enum Platform {
  Whatsapp = 'whatsapp',
  Telegram = 'telegram',
  GoogleAssistant = 'google_assistant',
}

export default class State {
  platform: Platform;
  userId: string;
  previousStep: number;
  nextStep: number;
  metaData: {
    pickupLocation: {
      latitude: number;
      longitude: number;
    } | null;
    dropLocation: {
      latitude: number;
      longitude: number;
    } | null;
    contactNumber: string | null;
    isOnlyList: boolean;
    estimatedPrice: number | null;
  };

  constructor(
    platform: Platform,
    userId: string,
    previousStep: number,
    nextStep: number,
    metaData: any
  ) {
    this.platform = platform;
    this.userId = userId;
    this.previousStep = previousStep;
    this.nextStep = nextStep;
    this.metaData = metaData;
  }

  async saveState(): Promise<void> {
    await Cache.getCache().hset(this.userId, {
      ...this,
      metaData: JSON.stringify(this.metaData),
    });
    await Cache.getCache().expire(this.userId, parseInt(process.env.TTL!) * 60);
  }

  static async fetchFromCache(key: string): Promise<State | null> {
    let data = await Cache.getCache().hgetall(key);
    if (Object.keys(data).length > 0) {
      return new State(
        data.platform == "whatsapp" ? Platform.Whatsapp : Platform.Telegram,
        data.userId,
        parseInt(data.previousStep),
        parseInt(data.nextStep),
        data.metaData ? JSON.parse(data.metaData) : {}
      );
    }
    return null;
  }

  static async clearAllCache(): Promise<void> {
    await Cache.getCache().flushall();
  }

  async clearCache(): Promise<void> {
    await Cache.getCache().del(this.userId);
  }
}