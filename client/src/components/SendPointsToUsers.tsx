import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
}

export function SendPointsToUsers() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [pointsAmount, setPointsAmount] = useState<string>("");

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("GET", "/api/admin/users"),
  });

  const sendPointsMutation = useMutation({
    mutationFn: (data: { userId: string; points: number }) =>
      apiRequest("POST", "/api/admin/send-points", data),
    onSuccess: () => {
      setSelectedUserId("");
      setPointsAmount("");
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Points sent to user",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send points",
        variant: "destructive",
      });
    },
  });

  const handleSendPoints = () => {
    if (!selectedUserId || !pointsAmount) {
      toast({
        title: "Error",
        description: "Please select a user and enter points amount",
        variant: "destructive",
      });
      return;
    }

    const points = parseInt(pointsAmount, 10);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "Error",
        description: "Points must be a positive number",
        variant: "destructive",
      });
      return;
    }

    sendPointsMutation.mutate({ userId: selectedUserId, points });
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold">Send Points to User</h3>
        </div>

        <div className="space-y-4">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Select User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Points Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Points Amount</label>
            <Input
              type="number"
              min="1"
              placeholder="Enter points to send..."
              value={pointsAmount}
              onChange={(e) => setPointsAmount(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendPoints}
            disabled={!selectedUserId || !pointsAmount || sendPointsMutation.isPending}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          >
            {sendPointsMutation.isPending ? "Sending..." : "Send Points"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
