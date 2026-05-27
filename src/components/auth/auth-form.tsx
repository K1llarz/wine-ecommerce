"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, signupAction, type AuthResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full">
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function AuthForm({
  mode,
  redirectTo,
  forbidden,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
  forbidden?: boolean;
}) {
  const isLogin = mode === "login";
  const action = isLogin ? loginAction : signupAction;
  const [state, formAction] = useActionState<AuthResult, FormData>(action, null);

  return (
    <Card className="py-6">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {isLogin ? "Welcome back" : "Create your account"}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? "Sign in to access your cellar, orders and wishlist."
            : "Join the Maison to track orders and save favourites."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {forbidden ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            You need an administrator account to view that page. Sign in with an
            authorized account.
          </p>
        ) : null}

        <form action={formAction} className="flex flex-col gap-4">
          {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}

          {!isLogin ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" required maxLength={80} />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin ? (
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? undefined : 8}
              placeholder={isLogin ? "••••••••" : "At least 8 characters"}
            />
          </div>

          {state && !state.ok ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}

          <SubmitButton
            label={isLogin ? "Sign in" : "Create account"}
            pendingLabel={isLogin ? "Signing in…" : "Creating account…"}
          />
        </form>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          OR
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          title="Social sign-in is coming soon"
          className="w-full"
        >
          Continue with Google
          <span className="ml-1 text-xs text-muted-foreground">(soon)</span>
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              New to the Maison?{" "}
              <Link href="/signup" className="font-medium text-burgundy hover:underline">
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-burgundy hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
