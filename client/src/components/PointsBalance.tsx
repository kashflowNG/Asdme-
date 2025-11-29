import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export function PointsBalance() {
  const { data: pointsData } = useQuery<any>({
    queryKey: ["/api/points"],
  });

  const totalPoints = pointsData?.totalPoints || 0;
  const earnedPoints = pointsData?.earnedPoints || 0;
  const spentPoints = pointsData?.spentPoints || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-2 border-yellow-500/30 neon-glow">
        <div className="space-y-4">
          {/* Main Balance */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Points Balance</p>
                <h2 className="text-4xl font-black text-yellow-400">
                  {totalPoints}
                </h2>
              </div>
            </div>
          </div>

          {/* Earned & Spent */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-700">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <p className="text-xs text-gray-400">Earned</p>
              </div>
              <p className="text-lg font-bold text-green-400">+{earnedPoints}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <p className="text-xs text-gray-400">Spent</p>
              </div>
              <p className="text-lg font-bold text-red-400">-{spentPoints}</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
