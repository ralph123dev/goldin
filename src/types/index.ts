export interface User {
  id: string;
  name: string;
  country: string;
  flag: string;
  joinedAt: Date;
}

export interface Message {
  id: string;
  userName: string;
  content?: string;
  timestamp: Date;
  country: string;
  type?: string;      // Ajouté pour supporter les types de message (text, image, video, audio)
  fileURL?: string;   // Ajouté pour les fichiers (image, video, audio)
}

export interface VerifyData {
  name: string;
  country: string;
  phoneNumber: string;
  id: string;
}

export interface CountryInfo {
  country: string;
  country_code: string;
  flag: string;
}