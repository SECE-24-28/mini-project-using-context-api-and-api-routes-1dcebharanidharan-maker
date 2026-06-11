"use client";
import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceSchema, type WorkspaceInput } from "@/lib/validations";
import { toast } from "@/components/ui/toast";
import { Plus, X } from "lucide-react";

export function CreateWorkspaceDialog({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceInput>({
    resolver: zodResolver(WorkspaceSchema),
  });

  const onSubmit = async (data: WorkspaceInput) => {
    setLoading(true);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (res.ok) {
      const ws = await res.json();
      toast("Workspace created!", "success");
      reset();
      setOpen(false);
      router.push(`/workspace/${ws.id}/dashboard`);
      router.refresh();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to create workspace", "error");
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Workspace
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create Workspace</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input {...register("name")} placeholder="Workspace name" />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <Input {...register("description")} placeholder="Description (optional)" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" loading={loading}>Create</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
