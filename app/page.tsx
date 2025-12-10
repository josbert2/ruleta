"use client"

import { useState } from "react"
import { SpinWheel } from "@/components/spin-wheel"
import { ResultModal } from "@/components/result-modal"
import { Star, ChevronLeft } from "lucide-react"

export default function Home() {
  const [result, setResult] = useState<string | null>(null)
  const [isWheelSpinning, setIsWheelSpinning] = useState(false)

  const handleResult = (resultText: string) => {
    setResult(resultText)
    // Keep it tucked away? Or return? 
    // Usually a game resets. Let's keep it tucked until the modal is closed?
    // User requirement: "cuando se de en girar se meta en la posicion que estaba"
    // implies it moves away. It doesn't explicitly say when to come back.
    // I'll make it come back when the user closes the modal or resets.
  }

  const handleSpinStart = () => {
    setIsWheelSpinning(true)
  }

  const closeModal = () => {
    setResult(null)
    setIsWheelSpinning(false) // Reset position when round ends
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative" style={{ 
      backgroundImage: "url('https://www.funpark.cl/wp-content/uploads/2024/04/Grupo-11268.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      {/* Fixed Yellow Cloud Header */}
      <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-16 md:h-24 fill-[#facc15] drop-shadow-md"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L1440,0 L1440,100 
            Q1380,180 1320,120 T1200,120 
            Q1140,180 1080,120 T960,120 
            Q900,200 820,120 T680,120 
            Q620,180 560,120 T440,120 
            Q380,200 300,100 T160,100 
            Q100,160 40,80 L0,80 Z"
          />
        </svg>
      </div>

      {/* Overlay para mejorar legibilidad si es necesario */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(25)].map((_, i) => (
          <Star
            key={i}
            className="absolute text-yellow-500 fill-yellow-500 star-animate"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${15 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* Layout principal - pantalla dividida */}
      <div className="h-full w-full flex flex-col-reverse md:flex-row">
        {/* Lado izquierdo - Ruleta */}
        <div className="relative h-[55%] md:h-full w-full md:w-1/2 flex items-start md:items-center justify-center md:justify-start overflow-visible z-10">
          <div 
            className={`absolute transition-all duration-1000 ease-in-out transform
              ${isWheelSpinning 
                ? "left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-[350px] lg:-left-[450px]" 
                : "left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-[150px] lg:-left-[200px]"
              } top-[0%] md:top-auto`
            }
          >
            <SpinWheel onResult={handleResult} onSpinStart={handleSpinStart} />
          </div>
          
         
        </div>

        {/* Lado derecho - Contenido */}
        <div className="h-[45%] md:h-full w-full md:w-1/2 flex flex-col items-center justify-end md:justify-center px-6 relative z-10 pb-8 md:pb-0">
          <div className="max-w-md space-y-6 text-center pt-24 md:pt-20">
            {/* FunPark Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="https://www.funpark.cl/wp-content/uploads/2024/04/logo-funpark-1-600x173.png" 
                alt="FunPark Logo" 
                className="h-24 md:h-32 object-contain drop-shadow-xl"
              />
            </div>

            {/* New Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-none mb-2 drop-shadow-md" style={{ fontFamily: "var(--font-paytone)" }}>
              <span className="text-white inline-block" style={{ textShadow: "2px 2px 0px #7c3aed" }}>¡PREMIOS</span>{" "}
              <span className="text-[#facc15] inline-block" style={{ textShadow: "2px 2px 0px #7c3aed" }}>INCREÍBLES!</span>
            </h1>

            <p className="text-white/90 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
              ¡Prueba tu suerte! Gira la ruleta y podrás ganar premios exclusivos para tu próxima visita a FunPark.
            </p>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <ResultModal result={result} onClose={closeModal} />
    </main>
  )
}
