"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface ResultModalProps {
  result: string | null
  onClose: () => void
}

export function ResultModal({ result, onClose }: ResultModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const isWinner = result?.includes("GANASTE")

  useEffect(() => {
    if (isWinner && result) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [result, isWinner])

  if (!result) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />

      {/* Confetti estrellas */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <Star
              key={i}
              className="absolute text-yellow-400 fill-yellow-400 animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-50px`,
                width: `${25 + Math.random() * 30}px`,
                animationDuration: `${1.5 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal estilo Funpark */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md p-10 rounded-3xl shadow-2xl",
          "text-center transform transition-all duration-300",
          "border-4",
          isWinner
            ? "bg-gradient-to-br from-primary to-orange-600 border-yellow-300"
            : "bg-gradient-to-br from-secondary to-emerald-700 border-white/30",
        )}
      >
        {/* Estrellas decorativas */}
        <Star className="absolute top-4 left-4 w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
        <Star
          className="absolute top-4 right-4 w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse"
          style={{ animationDelay: "0.3s" }}
        />
        <Star
          className="absolute bottom-4 left-4 w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse"
          style={{ animationDelay: "0.6s" }}
        />
        <Star
          className="absolute bottom-4 right-4 w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse"
          style={{ animationDelay: "0.9s" }}
        />

        <h2 className="text-4xl md:text-5xl font-black mb-4 text-white drop-shadow-lg">
          {isWinner ? "¡GANASTE!" : "¡PERDISTE!"}
        </h2>
        <p className="text-xl mb-8 text-white/90 font-medium">
          {isWinner ? "Felicidades, has ganado un premio increible" : "La proxima sera, sigue intentando"}
        </p>
        <button
          onClick={onClose}
          className={cn(
            "px-10 py-4 rounded-full font-black text-xl uppercase tracking-wider",
            "transition-all duration-200 hover:scale-105 shadow-lg",
            "bg-white text-background hover:bg-white/90",
          )}
        >
          {isWinner ? "Reclamar" : "Reintentar"}
        </button>
      </div>
    </div>
  )
}
