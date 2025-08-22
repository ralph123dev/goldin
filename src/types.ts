export interface Message {
  id: string;
  content: string;
  userName: string;
  country: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'video' | 'audio';
  fileURL?: string;
}
