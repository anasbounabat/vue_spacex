export interface Launch {
    id: string;
    name: string;
    date_utc: string;
    date_unix: number;
    success: boolean;
    details: string | null;
    links: {
      patch: {
        small: string | null;
        large: string | null;
      };
      article: string | null;
      webcast: string | null;
    };
    launchpad: string;
    payloads: string[];
  }
  
  export interface LaunchpadDetails {
    id: string;
    name: string;
    locality: string;
  }
  
  export interface PayloadDetails {
    id: string;
    name: string;
    customers: string[];
  }
  
  export type LaunchFilter = 'all' | 'success' | 'failure';
  