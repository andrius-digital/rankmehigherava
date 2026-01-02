import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAvaVoiceStorage } from '@/hooks/useAvaVoiceStorage';

const VAPI_PUBLIC_KEY = '5fcdd92d-d2a1-4b94-8189-f100ac650474';

export const AvaVoiceChat = () => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [vapiCallId, setVapiCallId] = useState<string | null>(null);
  
  const { 
    createCall, 
    updateCallByVapiId, 
    addMessage 
  } = useAvaVoiceStorage();

  useEffect(() => {
    // Initialize Vapi
    const vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
    setVapi(vapiInstance);

    // Set up event listeners
    vapiInstance.on('call-start', async () => {
      console.log('Call started');
      setIsCallActive(true);
      toast.success('Connected to Ava!');
      
      // Save call to Supabase
      const callRecord = await createCall({
        call_status: 'active',
        started_at: new Date().toISOString(),
      });
      
      if (callRecord) {
        setCurrentCallId(callRecord.id);
      }
    });

    vapiInstance.on('call-end', async () => {
      console.log('Call ended');
      setIsCallActive(false);
      
      // Update call in Supabase
      if (currentCallId) {
        await updateCallByVapiId(currentCallId, {
          call_status: 'completed',
          ended_at: new Date().toISOString(),
        });
        
        toast.info('Call completed. Recording will be available via webhook.');
      }
      
      // Reset state
      setCurrentCallId(null);
      setVapiCallId(null);
    });

    vapiInstance.on('speech-start', () => {
      console.log('User started speaking');
    });

    vapiInstance.on('speech-end', () => {
      console.log('User stopped speaking');
    });

    vapiInstance.on('volume-level', (level: number) => {
      setVolumeLevel(level);
    });

    vapiInstance.on('error', async (error: any) => {
      console.error('Vapi error:', error);
      toast.error('Voice chat error. Please try again.');
      
      // Update call status to failed
      if (currentCallId) {
        await updateCallByVapiId(currentCallId, {
          call_status: 'failed',
          ended_at: new Date().toISOString(),
        });
      }
    });

    vapiInstance.on('message', async (message: any) => {
      console.log('Message from Ava:', message);
      
      // Save message to Supabase
      if (currentCallId && message?.role && message?.content) {
        await addMessage({
          call_id: currentCallId,
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Check if message contains lead information
      if (message?.role === 'user' && currentCallId) {
        // Extract potential business information from user messages
        const content = message.content?.toLowerCase() || '';
        
        // Simple keyword detection for services
        const services = [];
        if (content.includes('website') || content.includes('web')) services.push('Custom Websites');
        if (content.includes('seo') || content.includes('google') || content.includes('rank')) services.push('SEO Services');
        if (content.includes('social') || content.includes('instagram') || content.includes('facebook')) services.push('Social Media');
        if (content.includes('email') || content.includes('sms')) services.push('Marketing Automation');
        
        // Update call with interested services if any detected
        if (services.length > 0) {
          await updateCallByVapiId(currentCallId, {
            interested_in_services: services,
            lead_score: Math.min(services.length * 20, 80), // Base score on interest
          });
        }
      }
    });

    return () => {
      // Cleanup
      vapiInstance.stop();
    };
  }, [createCall, updateCallByVapiId, addMessage, currentCallId, vapiCallId]);

  const startCall = async () => {
    if (!vapi) return;

    try {
      // Start a call with your assistant
      // You'll need to replace 'your-assistant-id' with your actual Vapi assistant ID
      await vapi.start({
        // Option 1: If you have an assistant ID from Vapi dashboard
        // assistantId: 'your-assistant-id-here',
        
        // Option 2: Or define the assistant inline
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-US',
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer', // Female voice
        },
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are Ava, an AI assistant for Rank Me Higher agency. You help businesses with their website needs, SEO, and digital marketing. You are friendly, professional, and knowledgeable. 
              
              Key information:
              - We build custom websites with lead capture
              - We manage websites on our AVA platform
              - Monthly subscription model with 1 upgrade per month
              - Built in 14 days
              - Includes automated SMS & email follow-ups
              - Clients get their own lead dashboard
              - We also offer SEO services to rank businesses on page 1 of Google
              
              Be conversational and help prospects understand our services.`,
            },
          ],
        },
        name: 'Ava - Rank Me Higher Assistant',
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Failed to start call. Please check your microphone permissions.');
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  const toggleMute = () => {
    if (vapi) {
      vapi.setMuted(!isMuted);
      setIsMuted(!isMuted);
      toast.info(isMuted ? 'Microphone on' : 'Microphone muted');
    }
  };

  return (
    <div className="relative">
      {!isCallActive ? (
        <Button
          onClick={startCall}
          className="group relative px-8 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300 font-orbitron overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-3">
            <Phone className="w-6 h-6" />
            <span>Talk to Ava</span>
          </div>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
        </Button>
      ) : (
        <div className="space-y-4">
          {/* Volume Indicator */}
          <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-cyan-500/20 backdrop-blur-xl border-2 border-cyan-500/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white font-orbitron text-sm">Call Active</span>
            </div>
            
            {/* Volume bars */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    volumeLevel > i * 0.2 ? 'bg-cyan-400 h-6' : 'bg-cyan-400/30 h-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={toggleMute}
              variant="outline"
              className="flex-1 px-6 py-4 rounded-xl border-2 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
            >
              {isMuted ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Mute
                </>
              )}
            </Button>

            <Button
              onClick={endCall}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

