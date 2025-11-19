
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Plus, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LinkGroup } from "@shared/schema";

export function LinkGroupManager() {
  const { toast } = useToast();
  const [newGroupName, setNewGroupName] = useState("");

  const { data: groups = [] } = useQuery<LinkGroup[]>({
    queryKey: ["/api/link-groups"],
  });

  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return await apiRequest("POST", "/api/link-groups", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/link-groups"] });
      setNewGroupName("");
      toast({
        title: "Group created",
        description: "Link group created successfully",
      });
    },
  });

  return (
    <Card className="p-6 space-y-6 shadow-lg border-2 neon-glow glass-card">
      <div className="flex items-center gap-3">
        <Folder className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Link Groups</h2>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Group name (e.g., Social, Work, Shop)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <Button
            onClick={() => createGroupMutation.mutate(newGroupName)}
            disabled={!newGroupName}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              className="p-3 bg-muted/50 rounded-lg flex items-center justify-between"
            >
              <span className="font-medium">{group.name}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
