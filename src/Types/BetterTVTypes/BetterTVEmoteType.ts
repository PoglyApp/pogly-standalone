export default interface BetterTVEmoteType {
    id: string;
    code: string;
    imageType: string;
    animated: boolean;
    userId?: string;
    user?: {
        id: string;
        name: string;
        displayName: string;
        providerId: string;
    }
  }
  