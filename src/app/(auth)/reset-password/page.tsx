"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordSchema } from "@/lib/validations";
import { toast } from "@/components/ui/toast";
import { z } from "zod";

type FormData = z.infer<typeof ResetPasswordSchema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const token = searchParams.get("token");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) { toast("Invalid reset link", "error"); return; }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    setLoading(false);
    if (res.ok) {
      toast("Password reset successfully", "success");
      router.push("/login");
    } else {
      const err = await res.json();
      toast(err.error || "Reset failed", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register("password")} type="password" placeholder="New password"
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
      </div>
      <div>
        <Input {...register("confirmPassword")} type="password" placeholder="Confirm new password"
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600" loading={loading}>
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white text-center">Set new password</CardTitle>
        <CardDescription className="text-center text-gray-400">Choose a strong password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={<div className="h-20 animate-pulse rounded bg-white/10" />}>
          <ResetForm />
        </Suspense>
        <p className="text-center text-sm text-gray-400">
          <Link href="/login" className="text-indigo-400 hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
