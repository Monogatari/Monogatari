export interface PlayerPreferences {
  Language: string;
  Volume: {
    Music: number;
    Voice: number;
    Sound: number;
    Video: number;
  };
  Resolution: string;
  TextSpeed: number;
  AutoPlaySpeed: number;
  [key: string]: string | number | boolean | Record<string, unknown>;
}