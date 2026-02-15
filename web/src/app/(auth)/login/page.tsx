"use client";

import { GoogleOAuthWrapper } from "@/components/GoogleOAuthWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useStore";
import type { AuthResponse } from "@/types";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await authApi.loginWithGoogle(idToken);
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.subscription);
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
            <span className="text-3xl font-bold text-foreground">FinArg</span>
          </div>
          <p className="text-muted-foreground">Tu app financiera argentina</p>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-center">Acceder a FinArg</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Continuá con tu cuenta de Google</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <GoogleOAuthWrapper>
                    <GoogleLogin
                      onSuccess={(res) => handleGoogleSuccess(res?.credential)}
                      onError={() => setError("Error al iniciar sesión con Google.")}
                      useOneTap={false}
                      theme="filled_black"
                      size="large"
                      text="continue_with"
                    />
                  </GoogleOAuthWrapper>
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
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3">
            <p className="text-2xl font-bold text-primary">7+</p>
            <p className="text-xs text-muted-foreground">Tipos de dólar</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-green-500">24/7</p>
            <p className="text-xs text-muted-foreground">Actualización</p>
          </div>
          <div className="p-3">
            <p className="text-2xl font-bold text-yellow-500">5+</p>
            <p className="text-xs text-muted-foreground">Calculadoras</p>
          </div>
        </div>
      </div>
    </div>
  );
}
