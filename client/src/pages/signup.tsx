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

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        password: data.password,
      });

      // Wait a moment for session to propagate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify session before redirecting
      await apiRequest("GET", "/api/auth/me");

      toast({
        title: "Account created!",
        description: "Welcome to Neropage. Let's set up your profile.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - Neropage</title>
        <meta name="description" content="Create your Neropage account and start sharing your links" />
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
        <script type='text/javascript' src='//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js'></script>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center gap-4">
            <NeropageLogo size={48} />
            <div className="text-center">
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground">Start building your link hub</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Create a free account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    data-testid="input-username"
                    placeholder="Choose a unique username"
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
                    placeholder="At least 8 characters"
                    {...form.register("password")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive" data-testid="text-error-password">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    data-testid="input-confirm-password"
                    placeholder="Re-enter your password"
                    {...form.register("confirmPassword")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive" data-testid="text-error-confirm-password">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-signup"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate("/login")}
                  data-testid="link-login"
                >
                  Log in
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
