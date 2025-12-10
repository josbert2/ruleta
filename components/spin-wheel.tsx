"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
// @ts-ignore
import confetti from "canvas-confetti"

interface SpinWheelProps {
  onResult: (result: string) => void
  onSpinStart?: () => void
}

const segments = [
  { label: "GANASTE", color: "#ff0153", textColor: "#fff" }, // Red
  { label: "INTÉNTALO DE NUEVO", color: "#5c81ff", textColor: "#fff" }, // Blue
  { label: "GANASTE", color: "#ff8201", textColor: "#fff" }, // Orange
  { label: "GANASTE", color: "#ff0153", textColor: "#fff" }, // Red
  { label: "INTÉNTALO DE NUEVO", color: "#5c81ff", textColor: "#fff" }, // Blue
  { label: "GANASTE", color: "#ff8201", textColor: "#fff" }, // Orange
  { label: "GANASTE", color: "#ff0153", textColor: "#fff" }, // Red
  { label: "INTÉNTALO DE NUEVO", color: "#5c81ff", textColor: "#fff" }, // Blue
]

export function SpinWheel({ onResult, onSpinStart }: SpinWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)
  
  // Physics state
  const velocityRef = useRef(0)
  const rotationRef = useRef(0)
  const reqIdRef = useRef<number>()
  const lastSegmentIndexRef = useRef(0)
  
  const [hasPlayed, setHasPlayed] = useState(false)

  // Cookie helpers
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    const expires = "expires=" + date.toUTCString()
    document.cookie = name + "=" + value + ";" + expires + ";path=/"
  }

  const getCookie = (name: string) => {
    if (typeof document === "undefined") return null
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Check participation on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const lastSpinDate = getCookie("funpark_last_spin")
    if (lastSpinDate === today) {
      setHasPlayed(true)
    }
  }, [])

  const animate = useCallback(() => {
    if (velocityRef.current < 0.05) {
      setIsSpinning(false)
      const normalizedRotation = rotationRef.current % 360
      const segmentAngle = 360 / segments.length
      const effectiveAngle = (360 - rotationRef.current % 360 + 90) % 360
      const winningIndex = Math.floor(effectiveAngle / segmentAngle)
      const safeIndex = winningIndex >= 0 ? winningIndex % segments.length : 0
      const resultLabel = segments[safeIndex].label
      
      onResult(resultLabel)
      
      if (resultLabel === "GANASTE") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0153", "#5c81ff", "#ff8201"]
        })
      }
      return
    }

    rotationRef.current += velocityRef.current
    setRotation(rotationRef.current)
    velocityRef.current *= 0.985
    reqIdRef.current = requestAnimationFrame(animate)
  }, [onResult])

  const spin = () => {
    if (isSpinning || hasPlayed) return
    
    setIsSpinning(true)
    onSpinStart?.()
    
    // Set Cookie for today
    const today = new Date().toISOString().split('T')[0]
    setCookie("funpark_last_spin", today, 1)
    setHasPlayed(true)

    // 95% Win Probability Logic
    const winIndices = [0, 2, 3, 5, 6]
    const loseIndices = [1, 4, 7] // "INTÉNTALO DE NUEVO"
    
    let targetIndex = 0
    if (Math.random() < 0.95) {
      targetIndex = winIndices[Math.floor(Math.random() * winIndices.length)]
    } else {
      targetIndex = loseIndices[Math.floor(Math.random() * loseIndices.length)]
    }

    // Calculate physics values to land on targetIndex
    // Target Angle is the center of the segment
    const segmentAngle = 360 / segments.length
    // Center of segment N is at: index * angle + angle/2
    const targetSegmentAngle = targetIndex * segmentAngle + segmentAngle / 2
    
    // Position of pointer is 90deg.
    // We need final Rotation R such that:
    // (360 - R % 360 + 90) % 360 = targetSegmentAngle
    // => 450 - R = targetSegmentAngle (roughly)
    // => R = 450 - targetSegmentAngle
    
    const offset = 90
    // We want the wheel to spin at least 5 times (5 * 360)
    const minSpins = 5
    const currentRotation = rotationRef.current
    
    // Calculate the base target angle (0-360)
    // Formula derived from effectiveAngle calculation:
    // effective = (450 - rot) % 360
    // rot = 450 - effective
    let targetRotation = 450 - targetSegmentAngle
    
    // Adjust targetRotation to be ahead of currentRotation
    while (targetRotation < currentRotation) {
      targetRotation += 360
    }
    // Add extra spins
    targetRotation += minSpins * 360
    
    // Add some random noise within the segment (+/- 15 degrees)
    // Segment is 45 deg, so +/- 22.5 is border. 15 is safe.
    const noise = (Math.random() - 0.5) * 30
    const finalTargetRotation = targetRotation + noise
    const distance = finalTargetRotation - currentRotation
    
    // Calculate initial velocity based on friction 0.985
    // Distance = v0 / (1 - friction)
    // v0 = Distance * (1 - friction)
    velocityRef.current = distance * 0.015

    cancelAnimationFrame(reqIdRef.current!)
    reqIdRef.current = requestAnimationFrame(animate)
  }

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(reqIdRef.current!)
  }, [])

  return (
    <div className="relative">
      {/* Pointer - ahora apuntando desde la derecha */}
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20">
        <div className="w-0 h-0 border-t-[25px] border-b-[25px] border-r-[40px] border-t-transparent border-b-transparent border-r-primary drop-shadow-lg" />
      </div>

      {/* Wheel container - tamaño gigante */}
      <div className="relative w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px]">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl animate-pulse" />

        {/* Wheel border con estrellas decorativas */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff0153] via-[#5c81ff] to-[#ff8201] p-3 md:p-4">
          {/* Wheel */}
          <div
            ref={wheelRef}
            className="relative w-full h-full rounded-full overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
               // No CSS transition, we use JS animation
            }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((segment, index) => {
                const angle = 360 / segments.length
                const startAngle = index * angle - 90
                const endAngle = startAngle + angle
                const startRad = (startAngle * Math.PI) / 180
                const endRad = (endAngle * Math.PI) / 180
                const x1 = 50 + 50 * Math.cos(startRad)
                const y1 = 50 + 50 * Math.sin(startRad)
                const x2 = 50 + 50 * Math.cos(endRad)
                const y2 = 50 + 50 * Math.sin(endRad)
                const largeArc = angle > 180 ? 1 : 0

                const textAngle = startAngle + angle / 2
                const textRad = (textAngle * Math.PI) / 180
                const textX = 50 + 32 * Math.cos(textRad)
                const textY = 50 + 32 * Math.sin(textRad)

                return (
                  <g key={index}>
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={segment.textColor}
                      fontSize={segment.label.length > 8 ? "3.2" : "4.5"}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                      style={{ 
                        fontFamily: "var(--font-rubik)",
                        paintOrder: "stroke",
                        stroke: "#4c1d95", // Darker purple stroke
                        strokeWidth: "0.3px",
                        strokeLinecap: "round",
                        strokeLinejoin: "round"
                      }}
                    >
                      {segment.label === "INTÉNTALO DE NUEVO" ? (
                        <>
                          <tspan x={textX} dy="-0.6em">INTÉNTALO</tspan>
                          <tspan x={textX} dy="1.2em">DE NUEVO</tspan>
                        </>
                      ) : (
                        segment.label
                      )}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Center button container */}
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{
            left: isSpinning ? "0%" : "0%",
            top: isSpinning ? "0%" : "0%",
          }}
        >
          <button
            onClick={spin}
            disabled={isSpinning || hasPlayed}
            className={cn(
              "w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full",
              "bg-gradient-to-br from-[#f97316] to-[#ffbd00]",
              "text-white font-black text-sm sm:text-lg md:text-2xl lg:text-3xl",
              "shadow-2xl border-4 sm:border-6 border-white",
              "transition-all duration-200",
              "hover:scale-105 hover:shadow-xl",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100",
              "flex items-center justify-center uppercase tracking-wider whitespace-pre-line text-center leading-tight",
              "pointer-events-auto", // Re-enable clicks
              !isSpinning && !hasPlayed && "animate-pulse-scale",
            )}
            style={{ 
              fontFamily: "var(--font-titan)",
            }}
          >
            {isSpinning ? "..." : hasPlayed ? "VUELVE\nMAÑANA" : "GIRAR"}
          </button>
        </div>
      </div>

      {/* Luces decorativas alrededor */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 md:w-5 md:h-5 rounded-full bg-yellow-300 animate-pulse shadow-lg shadow-yellow-300/50"
            style={{
              top: `${50 + 47 * Math.sin((i * 22.5 * Math.PI) / 180)}%`,
              left: `${50 + 47 * Math.cos((i * 22.5 * Math.PI) / 180)}%`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
