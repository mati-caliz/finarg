"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useStore";
import type { AuthResponse } from "@/types";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Loader2, Lock, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await authApi.login(formData.email, formData.password);
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      setError(
        error.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate();
  };

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authApi.loginWithGoogle(idToken);
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setError(err.response?.data?.message || "Error al iniciar sesión con Google.");
    },
  });

  const handleGoogleSuccess = (credential: string | undefined) => {
    if (!credential) {
      return;
    }
    setError(null);
    googleLoginMutation.mutate(credential);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-white">FinArg</span>
          </div>
          <p className="text-gray-400">Tu app financiera argentina</p>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                      autoComplete="email"
                    />
                  </div>
                </label>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || !formData.email || !formData.password}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">o</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleSuccess(res?.credential)}
                    onError={() => setError("Error al iniciar sesión con Google.")}
                    useOneTap={false}
                    theme="filled_black"
                    size="large"
                    text="continue_with"
                  />
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full max-w-[240px]"
                      disabled
                    >
                      Continuar con Google
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Para habilitar: agregá NEXT_PUBLIC_GOOGLE_CLIENT_ID en .env.local (ver README)
                    </p>
                  </>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                ¿No tenés cuenta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Registrate
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-400">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <p className="text-2xl font-bold text-primary">7+</p>
            <p className="text-xs text-gray-500">Tipos de dólar</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-green-500">24/7</p>
            <p className="text-xs text-gray-500">Actualización</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-yellow-500">5+</p>
            <p className="text-xs text-gray-500">Calculadoras</p>
          </div>
        </div>
      </div>
    </div>
  );
}
