import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NeropageLogo } from "@/components/NeropageLogo";
import { Helmet } from "react-helmet";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Log In - Neropage</title>
        <meta name="description" content="Log in to your Neropage account to manage your links" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-4">
            <NeropageLogo size={48} />
            <div className="text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Log in to your account</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Log In</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    data-testid="input-username"
                    placeholder="Enter your username"
                    {...form.register("username")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-destructive" data-testid="text-error-username">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    data-testid="input-password"
                    placeholder="Enter your password"
                    {...form.register("password")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive" data-testid="text-error-password">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/signup")}
                  data-testid="link-signup"
                >
                  Sign up
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ad Placement */}
          <div className="flex justify-center py-6">
            <div className="w-full max-w-sm mx-auto">
              <div id="container-d3086215aaf6d1aac4a8cf2c4eda801b" className="rounded-lg overflow-hidden"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
