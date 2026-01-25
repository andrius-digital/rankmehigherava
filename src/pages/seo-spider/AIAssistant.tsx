import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = [
    'Write a blog post about local SEO tips',
    'Suggest ways to improve my Google rankings',
    'Create a content calendar for next month',
    'Help me respond to a negative review',
  ];

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (resp.status === 429) {
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait a moment and try again.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast({
          title: 'Credits required',
          description: 'Please add credits to continue using AI features.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to get response');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                  );
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Assistant | AVA SEO</title>
        <meta name="description" content="Get AI-powered help with your SEO and marketing tasks." />
      </Helmet>
      <DashboardLayout>
        <div className="flex flex-col h-[calc(100vh-3.5rem)] lg:h-screen">
          <PageHeader
            title="AI Marketing Assistant"
            description="Powered by advanced AI"
            icon={Bot}
          />

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden p-4">
            <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-red-600 flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold mb-3">How can I help you today?</h2>
                    <p className="text-muted-foreground mb-8 max-w-md">
                      I can help you with SEO strategy, content creation, review responses, and more.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          className="justify-start text-left h-auto py-4 px-4 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                          onClick={() => handleSend(suggestion)}
                        >
                          <Zap className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          <span className="line-clamp-2 text-sm">{suggestion}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                            <Bot className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl p-4 ${
                            msg.role === 'user'
                              ? 'bg-card/30 backdrop-blur-md border border-cyan-500/30'
                              : 'bg-secondary/50 border border-border/50'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                      <div className="flex gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-red-600 flex items-center justify-center shadow-lg shadow-primary/20">
                          <Bot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="bg-secondary/50 border border-border/50 rounded-xl p-4">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border/50 bg-card/30">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about SEO, marketing, or content..."
                    className="min-h-[44px] max-h-32 resize-none bg-secondary/30 border-border/50 focus:border-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button 
                    onClick={() => handleSend()} 
                    disabled={isLoading || !input.trim()}
                    className="bg-card/30 backdrop-blur-md border border-cyan-500/30 text-foreground hover:bg-card/50 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AIAssistant;
