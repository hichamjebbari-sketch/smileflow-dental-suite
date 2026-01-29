import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Sparkles, Calendar, UserPlus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: 'حجز موعد جديد', icon: Calendar, prompt: 'أريد حجز موعد جديد' },
  { label: 'إضافة مريض', icon: UserPlus, prompt: 'أريد تسجيل مريض جديد' },
  { label: 'استعلام عن مواعيد اليوم', icon: Info, prompt: 'ما هي مواعيد اليوم؟' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'مرحباً بك! أنا المساعد الذكي لعيادة الأسنان. كيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في:\n\n• حجز المواعيد\n• تسجيل المرضى الجدد\n• الاستعلام عن المواعيد\n• عرض معلومات الخدمات والأسعار',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will be replaced with actual AI integration)
    setTimeout(() => {
      let response = '';
      
      if (message.includes('موعد')) {
        response = 'بالطبع! يمكنني مساعدتك في حجز موعد. ما هو اسم المريض والخدمة المطلوبة والوقت المفضل؟';
      } else if (message.includes('مريض')) {
        response = 'ممتاز! لتسجيل مريض جديد، أحتاج إلى:\n• الاسم الكامل\n• رقم الهاتف\n• الجنس\n• تاريخ الميلاد (اختياري)';
      } else if (message.includes('مواعيد اليوم')) {
        response = 'مواعيد اليوم:\n\n🕘 09:00 - أحمد محمد العلي (فحص وتنظيف)\n🕙 10:00 - فاطمة عبدالله السعيد (حشو أسنان)\n🕦 11:30 - خالد سعود المطيري (تبييض أسنان)\n\nإجمالي 3 مواعيد';
      } else {
        response = 'شكراً لتواصلك! كيف يمكنني مساعدتك؟ يمكنك طلب حجز موعد، تسجيل مريض جديد، أو الاستعلام عن أي معلومة.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <MainLayout title="المساعد الذكي" subtitle="تفاعل مع وكيل الذكاء الاصطناعي">
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-gradient-to-l from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">المساعد الذكي</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                متصل ونشط
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-up',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  )}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      message.role === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-slide-up">
                <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap gap-1.5 shrink-0"
                  onClick={() => handleSend(action.prompt)}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
