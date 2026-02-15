"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { feedbackApi } from "@/lib/api";
import { MessageSquare, Send, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "feedback-widget-closed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 30000;

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const lastClosedStr = localStorage.getItem(STORAGE_KEY);
    if (lastClosedStr) {
      const lastClosed = Number.parseInt(lastClosedStr, 10);
      const now = Date.now();
      if (now - lastClosed < SEVEN_DAYS_MS) {
        return;
      }
    }

    setShouldShow(true);
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await feedbackApi.submit({
        rating,
        comment: comment || undefined,
        email: email || undefined,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.href : "",
      });

      setIsSubmitted(true);

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError("Hubo un error al enviar tu feedback. Por favor, intentá de nuevo.");
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!shouldShow) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        aria-label="Enviar feedback"
      >
        <MessageSquare className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-semibold hidden sm:inline">¿Qué te parece?</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-left-4 duration-500">
      <Card className="w-80 sm:w-96 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3 relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            {isSubmitted ? "¡Gracias!" : "Tu opinión nos ayuda"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto mb-3">
                <Send className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Tu feedback fue enviado correctamente</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  ¿Cómo calificarías tu experiencia?
                </legend>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-200 hover:scale-110"
                      aria-label={`${star} estrellas`}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  ¿Qué podemos mejorar? (opcional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contanos qué te gustaría que mejoremos..."
                  className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email (opcional, por si queremos contactarte)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isSubmitting ? "Enviando..." : "Enviar feedback"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Más tarde
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
