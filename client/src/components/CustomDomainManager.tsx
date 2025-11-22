
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function CustomDomainManager() {
  const { toast } = useToast();
  const [domain, setDomain] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = () => {
    // This would connect to a domain verification API
    toast({
      title: "Domain verification",
      description: "Add these DNS records to verify your domain",
    });
  };

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card">
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Custom Domain</h2>
        <Badge className="bg-gradient-to-r from-primary/20 to-cyan-500/20">PRO</Badge>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="custom-domain">Your Domain</Label>
          <div className="flex gap-2">
            <Input
              id="custom-domain"
              placeholder="links.yourdomain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button onClick={handleVerify} disabled={!domain}>
              Verify
            </Button>
          </div>
        </div>

        {domain && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-semibold">DNS Configuration:</p>
            <div className="font-mono text-xs space-y-1">
              <p>Type: A</p>
              <p>Name: {domain.includes('.') ? domain.split('.').slice(0, -2).join('.') || '@' : '@'}</p>
              <p>Value: [Your Replit deployment IP will be shown here after linking]</p>
            </div>
            <div className="font-mono text-xs space-y-1 mt-3">
              <p>Type: TXT</p>
              <p>Name: {domain.includes('.') ? domain.split('.').slice(0, -2).join('.') || '@' : '@'}</p>
              <p>Value: [Verification code will be shown here after linking]</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
