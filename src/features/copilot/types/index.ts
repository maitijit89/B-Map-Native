export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionPayload?: {
    actionType: 'navigate' | 'search_poi' | 'avoid_hazard' | 'call_contact';
    target: string;
    params?: Record<string, unknown>;
  };
}

export type CopilotListeningState = 'idle' | 'listening' | 'processing' | 'speaking';
