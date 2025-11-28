import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Zap, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion } from "framer-motion";

export function StreakWidget() {
  const { toast } = useToast();

  const { data: streakData } = useQuery({
    queryKey: ["/api/streaks/status"],
  });

  const { data: pointsData } = useQuery({
    queryKey: ["/api/points"],
  });

  const claimStreakMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/streaks/claim", {});
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Streak Claimed!",
        description: `+${data.pointsEarned} points! Streak: ${data.streakCount} days 🔥`,
      });
      await queryClient.refetchQueries({ queryKey: ["/api/streaks/status"] });
      await queryClient.refetchQueries({ queryKey: ["/api/points"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Already claimed today!",
        variant: "destructive",
      });
    },
  });

  const canClaim = streakData?.canClaim ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 neon-glow">
        <div className="space-y-4">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Flame className="w-8 h-8 text-orange-400" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Streak</p>
                <h3 className="text-3xl font-black text-orange-400">
                  {streakData?.streakCount || 0}
                </h3>
                <p className="text-xs text-gray-500">days in a row</p>
              </div>
            </div>

            {/* Points Display */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {pointsData?.totalPoints || 0}
                </span>
              </div>
              <p className="text-xs text-gray-500">Points</p>
            </div>
          </div>

          {/* Claim Button */}
          <Button
            onClick={() => claimStreakMutation.mutate()}
            disabled={!canClaim || claimStreakMutation.isPending}
            className={`w-full h-10 font-semibold ${
              canClaim
                ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                : "bg-gray-700 cursor-not-allowed"
            }`}
          >
            {canClaim ? "Claim Daily Streak 🔥" : "Already Claimed Today"}
          </Button>

          {/* Info */}
          <div className="p-3 rounded-lg bg-black/30 border border-gray-700">
            <div className="flex gap-2 text-sm">
              <Award className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300">
                <span className="font-semibold">Earn Points</span> by claiming your daily streak. Use points to unlock premium templates and features!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
