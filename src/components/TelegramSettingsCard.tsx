import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Loader2,
  Bell,
  BellOff,
  TestTube,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TelegramSettingsCardProps {
  clientId: string;
  clientName: string;
}

const TelegramSettingsCard: React.FC<TelegramSettingsCardProps> = ({
  clientId,
  clientName,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // State
  const [isConfigured, setIsConfigured] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [chatIdMasked, setChatIdMasked] = useState<string>();

  // Form - only Chat ID needed now
  const [chatId, setChatId] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, clientId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_telegram_settings')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (data && !error) {
        if (data.client_chat_id) {
          setIsConfigured(true);
          setIsActive(data.client_notifications_active || false);
          setChatIdMasked(`****${data.client_chat_id.slice(-4)}`);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!chatId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the Chat ID',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body: {
          action: 'save',
          client_id: clientId,
          chat_id: chatId.trim(),
        },
      });

      if (error) throw error;

      setIsConfigured(true);
      setIsActive(true);
      setChatIdMasked(`****${chatId.trim().slice(-4)}`);
      setChatId('');

      toast({
        title: 'Settings Saved',
        description: 'Telegram notifications configured successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!chatId.trim() && !isConfigured) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the Chat ID first',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      const body = chatId.trim()
        ? {
            action: 'test',
            chat_id: chatId.trim(),
          }
        : {
            action: 'test_saved',
            client_id: clientId,
          };

      const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
        body,
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Test Successful',
          description: 'Check your Telegram for the test message!',
        });
      } else {
        toast({
          title: 'Test Failed',
          description: data?.error || 'Failed to send test message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Telegram test error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test connection',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleToggleActive = async (active: boolean) => {
    try {
      if (!active) {
        const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
          body: {
            action: 'disable',
            client_id: clientId,
          },
        });

        console.log('Disable response:', { data, error });
        if (error) throw error;
        toast({ title: 'Notifications Disabled' });
      } else {
        // Re-enable
        const { error } = await supabase
          .from('client_telegram_settings')
          .update({ client_notifications_active: true })
          .eq('client_id', clientId);

        console.log('Enable error:', error);
        if (error) throw error;
        toast({ title: 'Notifications Enabled' });
      }
      setIsActive(active);
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    try {
      const { error } = await supabase
        .from('client_telegram_settings')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;

      setIsConfigured(false);
      setIsActive(false);
      setChatIdMasked(undefined);
      setChatId('');

      toast({ title: 'Settings Reset', description: 'Telegram settings have been cleared' });
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-2",
            isConfigured
              ? "border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50"
              : "border-orange-500/30 text-orange-400 hover:border-orange-500/50"
          )}
        >
          <Send className="w-4 h-4" />
          {isConfigured ? 'Telegram Connected' : 'Setup Telegram'}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-900 border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Send className="w-5 h-5 text-cyan-400" />
            Telegram Notifications
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Send task updates to {clientName}'s Telegram
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Info Banner */}
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-xs text-cyan-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Task completions & project updates will be sent here
              </p>
            </div>

            {/* Status */}
            {isConfigured && (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                isActive ? "bg-emerald-500/10 border-emerald-500/30" : "bg-yellow-500/10 border-yellow-500/30"
              )}>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <BellOff className="w-4 h-4 text-yellow-400" />
                  )}
                  <span className="text-sm text-slate-300">
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                  {chatIdMasked && (
                    <span className="text-xs text-slate-500 font-mono ml-2">
                      Chat: {chatIdMasked}
                    </span>
                  )}
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggleActive}
                />
              </div>
            )}

            {/* Chat ID - Only field needed */}
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">
                Telegram Chat ID {isConfigured && <span className="text-slate-500">(enter to update)</span>}
              </Label>
              <Input
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder={isConfigured ? chatIdMasked || '••••••••' : '-1001234567890'}
                className="bg-slate-800 border-white/10 font-mono text-sm"
              />
              <p className="text-[10px] text-slate-500">
                Get this from @getidsbot in Telegram (group IDs start with -100)
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || (!chatId && !isConfigured)}
                className="flex-1"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <TestTube className="w-4 h-4 mr-1" />}
                Test
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !chatId}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                {isConfigured ? 'Update' : 'Save'}
              </Button>
            </div>

            {/* Help */}
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong className="text-slate-400">How to get Chat ID:</strong><br />
                1. Add @RankMeHigherBot to your Telegram group<br />
                2. Send /start in the group<br />
                3. Use @getidsbot to get the group's Chat ID
              </p>
            </div>

            {/* Reset Button */}
            {isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TelegramSettingsCard;
