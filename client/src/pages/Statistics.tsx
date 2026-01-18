import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Ruler, Weight } from "lucide-react";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Янв', weight: 80 },
    { name: 'Фев', weight: 79 },
    { name: 'Мар', weight: 78 },
    { name: 'Апр', weight: 76 },
    { name: 'Май', weight: 75 },
];

export default function Statistics() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-screen bg-black text-white p-4 pb-20">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-white">
                    <ArrowLeft size={24} />
                </Button>
                <h1 className="text-2xl font-bold">Статистика</h1>
            </div>

            <div className="space-y-6">
                {/* Weight Chart */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Weight className="text-blue-500" />
                            Вес (кг)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888" />
                                    <YAxis stroke="#888" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Measurements */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="text-green-500" />
                            Замеры
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-gray-400">Грудь</span>
                                <span className="text-white font-mono">105 см <span className="text-green-500 text-xs">+2%</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-gray-400">Талия</span>
                                <span className="text-white font-mono">85 см <span className="text-red-500 text-xs">-1%</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                                <span className="text-gray-400">Бицепс</span>
                                <span className="text-white font-mono">40 см <span className="text-green-500 text-xs">+1.5%</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                    Добавить замер
                </Button>
            </div>
        </div>
    );
}
