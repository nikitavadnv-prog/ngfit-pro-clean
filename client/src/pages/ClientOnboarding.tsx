import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Dumbbell } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// Schema uses strings for inputs to match HTML input types
const formSchema = z.object({
    name: z.string().min(2, "Имя должно быть не менее 2 символов"),
    surname: z.string().min(2, "Фамилия должна быть не менее 2 символов"),
    phone: z.string().min(10, "Введите корректный номер"),
    gender: z.enum(["male", "female"]),
    birthDate: z.string().min(1, "Дата рождения обязательна"),
    height: z.string().min(1, "Укажите рост"),
    weight: z.string().min(1, "Укажите вес"),
    goals: z.string().min(1, "Укажите цели"),
    injuries: z.string().optional(),
});

export default function ClientOnboarding() {
    const [, setLocation] = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createClient = trpc.clients.create.useMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            surname: "",
            phone: "",
            gender: "male",
            birthDate: "",
            height: "",
            weight: "",
            goals: "",
            injuries: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const tg = (window as any).Telegram?.WebApp;
            const tgId = tg?.initDataUnsafe?.user?.id?.toString();

            await createClient.mutateAsync({
                name: `${values.name} ${values.surname}`,
                phone: values.phone,
                birthDate: values.birthDate,
                height: parseInt(values.height, 10),
                weight: parseInt(values.weight, 10),
                gender: values.gender,
                goals: values.goals,
                injuries: values.injuries,
                telegramId: tgId,
            });

            // Show success message via Telegram popup if available
            if (tg) {
                tg.showPopup({
                    title: "Заявка отправлена! ✅",
                    message: "Тренер скоро свяжется с вами и составит программу.",
                    buttons: [{ type: "ok" }]
                });
            }

            alert("Анкета успешно отправлена!");
        } catch (error) {
            console.error(error);
            alert("Ошибка при отправке анкеты. Попробуйте еще раз.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-black/90 text-white p-4 overflow-y-auto">
            <Card className="max-w-md mx-auto bg-zinc-900 border-zinc-800 shadow-xl mb-10">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-green-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Анкета Клиента
                    </CardTitle>
                    <p className="text-zinc-400 text-sm mt-2">
                        Заполните данные, чтобы мы могли составить для вас идеальную программу тренировок.
                    </p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Имя</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Иван" className="bg-zinc-800 border-zinc-700" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="surname"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Фамилия</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Иванов" className="bg-zinc-800 border-zinc-700" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Телефон</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+7 (999) 000-00-00" type="tel" className="bg-zinc-800 border-zinc-700" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="birthDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Дата рождения</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="bg-zinc-800 border-zinc-700" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Пол</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                                        <SelectValue placeholder="Выберите" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                                    <SelectItem value="male">Мужской</SelectItem>
                                                    <SelectItem value="female">Женский</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Рост (см)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="180" className="bg-zinc-800 border-zinc-700" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Вес (кг)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="75" className="bg-zinc-800 border-zinc-700" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="goals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Цели тренировок</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Например: похудеть на 5 кг, укрепить спину..."
                                                className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="injuries"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Травмы / Ограничения (необязательно)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Болит колено, искривление позвоночника..."
                                                className="bg-zinc-800 border-zinc-700 min-h-[60px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold shadow-lg shadow-green-900/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Отправка..." : "Отправить Анкету"}
                                {!isSubmitting && <Dumbbell className="ml-2 w-5 h-5" />}
                            </Button>

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
