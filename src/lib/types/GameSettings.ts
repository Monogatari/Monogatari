export interface GameSettings {
  Name: string;
  Version: string;
  Label: string;
  Slots: number;
  MultiLanguage: boolean;
  LanguageSelectionScreen: boolean;
  MainScreenMusic: string;
  SaveLabel: string;
  AutoSaveLabel: string;
  ShowMainScreen: boolean;
  Preload: boolean;
  AutoSave: number;
  ServiceWorkers: boolean;
  AspectRatio: string;
  ForceAspectRatio: string;
  TypeAnimation: boolean;
  NVLTypeAnimation: boolean;
  NarratorTypeAnimation: boolean;
  CenteredTypeAnimation: boolean;
  InstantText: boolean;
  Orientation: string;
  Skip: number;
  AssetsPath: {
    root: string;
    characters: string;
    icons: string;
    images: string;
    music: string;
    scenes: string;
    sounds: string;
    ui: string;
    videos: string;
    voices: string;
    gallery: string;
  };
  SplashScreenLabel: string;
  Storage: {
    Adapter: string;
    Store: string;
    Endpoint: string;
  };
  AllowRollback: boolean;
  ExperimentalFeatures: boolean;
  Screenshots: boolean;
  [key: string]: string | number | boolean | Record<string, unknown>;
}