import { supabase } from '@/integrations/supabase/client';
import { AvaVoiceCallInsert, AvaVoiceMessageInsert } from '@/types/ava-voice';
import { toast } from 'sonner';

export const useAvaVoiceStorage = () => {
  // Create a new call record
  const createCall = async (callData: AvaVoiceCallInsert) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_calls')
        .insert(callData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Call created in Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating call:', error);
      toast.error('Failed to save call data');
      return null;
    }
  };

  // Update an existing call
  const updateCall = async (callId: string, updates: Partial<AvaVoiceCallInsert>) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_calls')
        .update(updates)
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Call updated in Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating call:', error);
      return null;
    }
  };

  // Update call by Vapi call ID
  const updateCallByVapiId = async (vapiCallId: string, updates: Partial<AvaVoiceCallInsert>) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_calls')
        .update(updates)
        .eq('vapi_call_id', vapiCallId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Call updated by Vapi ID:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating call by Vapi ID:', error);
      return null;
    }
  };

  // Add a message to a call
  const addMessage = async (messageData: AvaVoiceMessageInsert) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Message added to Supabase:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding message:', error);
      return null;
    }
  };

  // Get all messages for a call
  const getCallMessages = async (callId: string) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_messages')
        .select('*')
        .eq('call_id', callId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  };

  // Get recent calls
  const getRecentCalls = async (limit = 10) => {
    try {
      const { data, error } = await supabase
        .from('ava_voice_calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching recent calls:', error);
      return [];
    }
  };

  // Get qualified leads
  const getQualifiedLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('ava_qualified_voice_leads')
        .select('*');

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching qualified leads:', error);
      return [];
    }
  };

  // Mark lead as qualified
  const markAsQualifiedLead = async (callId: string, leadScore: number, services: string[]) => {
    return updateCall(callId, {
      is_qualified_lead: true,
      lead_score: leadScore,
      interested_in_services: services,
    });
  };

  // Add follow-up notes
  const addFollowUpNotes = async (callId: string, notes: string, scheduledAt?: string) => {
    return updateCall(callId, {
      needs_follow_up: true,
      follow_up_notes: notes,
      follow_up_scheduled_at: scheduledAt,
    });
  };

  return {
    createCall,
    updateCall,
    updateCallByVapiId,
    addMessage,
    getCallMessages,
    getRecentCalls,
    getQualifiedLeads,
    markAsQualifiedLead,
    addFollowUpNotes,
  };
};



