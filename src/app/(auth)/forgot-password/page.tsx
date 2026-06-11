"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordSchema } from "@/lib/validations";
import { toast } from "@/components/ui/toast";
import { z } from "zod";

type Input = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: Input) => {
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    setSent(true);
    toast("Reset link sent if email exists", "success");
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white text-center">Reset password</CardTitle>
        <CardDescription className="text-center text-gray-400">
          Enter your email and we'll send a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sent ? (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-center text-sm text-green-400">
            Check your email for the reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input {...register("email")} type="email" placeholder="Email address"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500" />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}
        <p className="text-center text-sm text-gray-400">
          <Link href="/login" className="text-indigo-400 hover:underline">Back to sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
