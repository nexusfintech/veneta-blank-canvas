import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Handshake, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: include credentials for session cookies
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          // Safe error extraction without assuming JSON
          let message = `Errore ${response.status}`;
          const ct = response.headers.get("content-type") || "";
          try {
            if (ct.includes("application/json")) {
              const err = await response.json();
              message = err.message || message;
            } else {
              const text = await response.text();
              message = text || message;
            }
          } catch {
            // ignore parse errors
          }
          throw new Error(message);
        }
        
        const ct = response.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          return response.json();
        }
        return { message: "Login effettuato" };
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error("Errore di connessione. Controlla la tua connessione internet.");
        }
        throw (error instanceof Error) ? error : new Error("Errore imprevisto");
      }
    },
    onSuccess: () => {
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel sistema gestionale",
      });
      // Invalidate and refetch user data to trigger redirect
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Errore di accesso",
        description: error.message || "Email o password non corretti",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Handshake className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Accesso al Sistema</CardTitle>
          <CardDescription>
            Inserisci le tue credenziali per accedere al gestionale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="inserisci la tua email"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="inserisci la tua password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Accesso in corso..." : "Accedi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}