import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { useState } from "react";

export default function AIAssistant() {
    const [, navigate] = useLocation();
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Привет! Я твой AI-помощник. Чем могу помочь с тренировками или питанием?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
        // Add user message
        setMessages(prev => [...prev, { role: "user", content }]);
        setIsLoading(true);

        // Simulate response for now (to be connected to backend)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Извини, пока я работаю в демо-режиме. Скоро меня подключат к настоящему мозгу! 🧠"
            }]);
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white">
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-2xl font-bold">AI Ассистент</h1>
            </div>

            <Card className="h-[calc(100vh-150px)] bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
                <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    height="100%"
                    className="border-0"
                />
            </Card>
        </div>
    );
}
