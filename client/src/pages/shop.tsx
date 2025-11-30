import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ShoppingBag, Lock, ChevronLeft, Eye, X } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useState } from "react";

export default function Shop() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [previewStyle, setPreviewStyle] = useState<any>(null);

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
        <script async data-cfasync="false" src="//pl28091865.effectivegatecpm.com/d3086215aaf6d1aac4a8cf2c4eda801b/invoke.js"></script>
        <script type='text/javascript' src='//pl28091887.effectivegatecpm.com/cf/47/df/cf47df159320ecb4f3636e497a6d0d1f.js'></script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        {/* Back Button */}
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2 mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

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
                      {item.type === "style" && "Style"}
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

                    {/* Preview Button for Styles */}
                    {item.type === "style" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewStyle(item)}
                        className="mb-4 w-full gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview Style
                      </Button>
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

      {/* Style Preview Modal */}
      {previewStyle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-lg border-2 border-primary/50 max-w-2xl w-full"
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{previewStyle.name} Preview</h2>
              <button
                onClick={() => setPreviewStyle(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <p className="text-gray-400 text-center">{previewStyle.description}</p>

              <div className="bg-gray-800/50 rounded-lg p-8 space-y-4">
                <p className="text-sm text-gray-400 mb-4">Sample buttons with this style:</p>
                <style>
                  {`
                    #preview-container .link-button {
                      display: inline-block;
                      margin: 8px;
                      padding: 12px 24px;
                      background: linear-gradient(135deg, #8B5CF6, #3B82F6);
                      color: white;
                      font-weight: 600;
                      border: none;
                      cursor: pointer;
                      font-size: 16px;
                    }
                    ${previewStyle.css || ''}
                  `}
                </style>
                <div id="preview-container" className="flex flex-wrap gap-4 justify-center">
                  <button className="link-button">
                    Link Button
                  </button>
                  <button className="link-button">
                    Another Link
                  </button>
                  <button className="link-button">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewStyle(null)}
                  className="flex-1"
                >
                  Close Preview
                </Button>
                <Button
                  onClick={() => {
                    purchaseMutation.mutate(previewStyle.id);
                    setPreviewStyle(null);
                  }}
                  disabled={(pointsData?.totalPoints || 0) < previewStyle.pointCost || previewStyle.isPurchased || purchaseMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy for {previewStyle.pointCost} points
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
