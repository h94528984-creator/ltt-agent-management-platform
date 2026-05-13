import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Wifi } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(4, { message: "كلمة المرور قصيرة جداً" }),
});

export function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setToken } = useAuth();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setToken(data.token);
          toast({ title: "مرحباً بك", description: "تم تسجيل الدخول بنجاح" });
          setLocation("/");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "فشل تسجيل الدخول",
            description: "تحقق من البريد الإلكتروني وكلمة المرور",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar to-sidebar/80 relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-64 h-64 rounded-full border-4 border-white" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full border-4 border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-2 border-white" />
      </div>

      <div className="w-full max-w-md p-8 bg-card shadow-2xl rounded-2xl relative z-10 border border-border mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">منصة مبيعات الأفراد</h1>
          <p className="text-base font-semibold text-primary mt-1">Libya Telecom & Technology</p>
          <p className="text-sm text-muted-foreground mt-1">المنطقة الغربية — قسم المبيعات</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                  <FormControl>
                    <Input
                      placeholder="name@ltt.ly"
                      dir="ltr"
                      className="h-11 text-left"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-sm font-medium">كلمة المرور</Label>
                  <FormControl>
                    <Input
                      type="password"
                      dir="ltr"
                      className="h-11"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold mt-2"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
              ) : null}
              {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          كلمة المرور الافتراضية: <span dir="ltr" className="font-mono font-medium">LTT@2024</span>
        </p>
      </div>
    </div>
  );
}
