import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShoppingBag, Lock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

export default function Shop() {
  const { toast } = useToast();

  const { data: items = [] } = useQuery<any[]>({
    queryKey: ["/api/shop/items"],
  });

  const { data: pointsData } = useQuery<any>({
    queryKey: ["/api/points"],
  });

  const purchaseMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return await apiRequest("POST", "/api/shop/purchase", { itemId });
    },
    onSuccess: async (data: any) => {
      toast({ title: `Unlocked: ${data.itemName}` });
      await queryClient.refetchQueries({ queryKey: ["/api/points"] });
      await queryClient.refetchQueries({ queryKey: ["/api/shop/items"] });
    },
    onError: (error: any) => {
      toast({ title: "Not enough points" });
    },
  });

  return (
    <>
      <Helmet>
        <title>Shop - Neropage</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <ShoppingBag className="w-8 h-8 text-cyan-400" />
              <h1 className="text-4xl font-black">Points Shop</h1>
            </div>
            <p className="text-gray-400 mb-6">
              Spend your daily streak points on premium templates and features
            </p>

            {/* Points Display */}
            <Card className="max-w-sm mx-auto p-4 bg-gradient-to-r from-yellow-500/10 to-cyan-500/10 border-2 border-yellow-500/30">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Your Points</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {pointsData?.totalPoints || 0}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any, idx: number) => {
              const canAfford = (pointsData?.totalPoints || 0) >= item.pointCost;
              const isPurchased = item.isPurchased;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-6 h-full flex flex-col border-2 border-gray-800 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/20">
                    {/* Type Badge */}
                    <Badge className="w-fit mb-3 bg-primary/20 text-primary">
                      {item.type === "template" && "Premium Template"}
                      {item.type === "theme" && "Theme"}
                      {item.type === "feature" && "Feature"}
                    </Badge>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 flex-1">
                      {item.description}
                    </p>

                    {/* Purchase Status */}
                    {isPurchased && (
                      <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-sm text-green-400 font-semibold">✓ Already Owned</p>
                      </div>
                    )}

                    {/* Price & Button */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl font-bold text-yellow-400">
                          {item.pointCost}
                        </span>
                      </div>
                      <Button
                        onClick={() => purchaseMutation.mutate(item.id)}
                        disabled={!canAfford || isPurchased || purchaseMutation.isPending}
                        className={`flex-1 ${
                          !canAfford
                            ? "bg-gray-700 cursor-not-allowed"
                            : isPurchased
                            ? "bg-green-700 cursor-default"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        }`}
                      >
                        {!canAfford && <Lock className="w-4 h-4 mr-2" />}
                        {isPurchased ? "Owned" : canAfford ? "Buy" : "Not Enough"}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">Shop Coming Soon</h3>
              <p className="text-gray-500">More items will be available soon!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
