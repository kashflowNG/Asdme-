import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (error || !authData) {
        navigate("/login");
      } else {
        setIsChecking(false);
      }
    }
  }, [isLoading, error, authData, navigate]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !authData) {
    return null;
  }

  return <>{children}</>;
}
