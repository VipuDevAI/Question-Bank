import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginInput } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CoinButton } from "@/components/coin-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function LoginPage() {
  const [location, navigate] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      schoolCode: "",
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (!data || !data.user) {
        toast({
          title: "Login Failed",
          description: "Invalid response from server",
          variant: "destructive",
        });
        return;
      }
      login(data.user, data.token);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.user.name}`,
      });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src={logoImg} 
              alt="Question Bank" 
              className="w-32 h-32 mx-auto mb-4 object-contain"
              data-testid="img-logo"
            />
            <h1 className="text-3xl font-bold text-foreground">Question Bank</h1>
            <p className="text-muted-foreground mt-2">Assessment & Practice Platform</p>
          </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your school code and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="schoolCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter school code"
                          data-testid="input-school-code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          data-testid="input-email"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CoinButton
                  type="submit"
                  color="blue"
                  className="w-full"
                  isLoading={loginMutation.isPending}
                  icon={<LogIn className="w-5 h-5" />}
                  data-testid="button-login"
                >
                  Login
                </CoinButton>
              </form>
            </Form>

            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-accent-foreground font-medium mb-2">Demo Accounts:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>School:</strong> DEMO001</p>
                <p><strong>Teacher:</strong> teacher@demo.com / demo123</p>
                <p><strong>Student:</strong> student@demo.com / demo123</p>
                <p><strong>Parent:</strong> parent@demo.com / demo123</p>
                <p><strong>Admin:</strong> admin@demo.com / demo123</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-card-border bg-card">
        Powered by <strong>SmartGenEduX</strong> 2025
      </footer>
    </div>
  );
}
