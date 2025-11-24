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

      // Wait a moment for session to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify session before redirecting
      await apiRequest("GET", "/api/auth/me");

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
        <script type="text/javascript">
          {`
            atOptions = {
              'key' : '9effa3562d5aac5edcf587ad7df01754',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          `}
        </script>
        <script type="text/javascript" src="//www.highperformanceformat.com/9effa3562d5aac5edcf587ad7df01754/invoke.js"></script>
        <script type="text/javascript" src="//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js"></script>
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

          {/* Banner Ad Placement */}
          <div className="flex justify-center py-4 mt-4" data-testid="ad-banner-container">
            <div className="w-full max-w-sm mx-auto"></div>
          </div>
        </div>
      </div>
    </>
  );
}
