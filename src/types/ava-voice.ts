// Types for Ava Voice Call system

export interface AvaVoiceCall {
  id: string;
  vapi_call_id?: string;
  assistant_id?: string;
  
  // Caller information
  caller_phone?: string;
  caller_email?: string;
  caller_name?: string;
  
  // Call details
  call_status: 'initiated' | 'active' | 'completed' | 'failed';
  call_duration_seconds: number;
  started_at: string;
  ended_at?: string;
  
  // Conversation data
  transcript?: any; // JSONB
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  
  // Lead qualification
  is_qualified_lead: boolean;
  lead_score: number; // 0-100
  interested_in_services?: string[];
  
  // Business information
  business_name?: string;
  business_website?: string;
  business_phone?: string;
  
  // Follow-up
  needs_follow_up: boolean;
  follow_up_notes?: string;
  follow_up_scheduled_at?: string;
  
  // Metadata
  call_recording_url?: string;
  metadata?: any; // JSONB
  
  created_at: string;
  updated_at: string;
}

export interface AvaVoiceMessage {
  id: string;
  call_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  duration_seconds?: number;
  confidence_score?: number;
  created_at: string;
}

export interface AvaVoiceCallInsert {
  vapi_call_id?: string;
  assistant_id?: string;
  caller_phone?: string;
  caller_email?: string;
  caller_name?: string;
  call_status?: 'initiated' | 'active' | 'completed' | 'failed';
  call_duration_seconds?: number;
  started_at?: string;
  ended_at?: string;
  transcript?: any;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  is_qualified_lead?: boolean;
  lead_score?: number;
  interested_in_services?: string[];
  business_name?: string;
  business_website?: string;
  business_phone?: string;
  needs_follow_up?: boolean;
  follow_up_notes?: string;
  follow_up_scheduled_at?: string;
  call_recording_url?: string;
  metadata?: any;
}

export interface AvaVoiceMessageInsert {
  call_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  duration_seconds?: number;
  confidence_score?: number;
}





