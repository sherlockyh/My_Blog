import { request } from './http';

export type AiChatRole = 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

export interface AiChatInput {
  message: string;
  history: AiChatMessage[];
  locale: 'zh' | 'en';
}

export interface AiChatResponse {
  reply: string;
}

export const aiApi = {
  chat: (body: AiChatInput) => request.post<AiChatResponse>('/ai/chat', body),
};
