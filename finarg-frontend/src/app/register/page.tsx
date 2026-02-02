"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/useStore";
import type { AuthResponse } from "@/types";
import { GoogleLogin } from "@react-oauth/google";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, Lock, Mail, TrendingUp, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await authApi.register(formData.email, formData.password, formData.nombre);
      return response.data as AuthResponse;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (error: Error & { response?: { data?: { message?: string }; status?: number } }) => {
      const msg = error.response?.data?.message;
      const isEmailTaken =
        error.response?.status === 409 ||
        msg?.toLowerCase().includes("already registered") ||
        msg?.toLowerCase().includes("ya está registrado");
      setError(
        isEmailTaken
          ? "Este email ya está registrado. Si tenés cuenta, iniciá sesión."
          : msg || "Error al registrarse. Intentá nuevamente.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    registerMutation.mutate();
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
      setError(err.response?.data?.message || "Error al registrarse con Google.");
    },
  });

  const handleGoogleSuccess = (credential: string | undefined) => {
    if (!credential) {
      return;
    }
    setError(null);
    googleLoginMutation.mutate(credential);
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/[0-9]/.test(password)) {
      strength++;
    }
    if (/[^A-Za-z0-9]/.test(password)) {
      strength++;
    }
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) {
      return "bg-red-500";
    }
    if (strength === 2) {
      return "bg-yellow-500";
    }
    if (strength === 3) {
      return "bg-blue-500";
    }
    return "bg-green-500";
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength <= 1) {
      return "Débil";
    }
    if (strength === 2) {
      return "Regular";
    }
    if (strength === 3) {
      return "Buena";
    }
    return "Fuerte";
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-white">FinArg</span>
          </div>
          <p className="text-gray-400">Creá tu cuenta gratuita</p>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl text-center">Registrarse</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                  {error.includes("ya está registrado") && (
                    <Link href="/login" className="text-sm text-primary hover:underline">
                      Ir a Iniciar sesión
                    </Link>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </label>
              </div>

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
                      minLength={8}
                    />
                  </div>
                </label>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getStrengthColor()}`}
                          style={{ width: `${(passwordStrength() / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{getStrengthText()}</span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      <li
                        className={`text-xs flex items-center gap-1 ${formData.password.length >= 8 ? "text-green-500" : "text-gray-500"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Mínimo 8 caracteres
                      </li>
                      <li
                        className={`text-xs flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-500"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Una mayúscula
                      </li>
                      <li
                        className={`text-xs flex items-center gap-1 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-500"}`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Un número
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirmar Contraseña
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </label>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  registerMutation.isPending ||
                  !formData.nombre ||
                  !formData.email ||
                  !formData.password ||
                  formData.password !== formData.confirmPassword
                }
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  "Crear Cuenta"
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
                    onError={() => setError("Error al registrarse con Google.")}
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
                ¿Ya tenés cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Al registrarte, aceptás nuestros{" "}
              <Link href="/terms" className="text-gray-400 hover:underline">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="text-gray-400 hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
