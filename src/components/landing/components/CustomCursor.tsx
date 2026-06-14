import React from "react"
import { useCustomCursor } from "../animations/useCustomCursor"

export const CustomCursor: React.FC = () => {
  const { dotRef, ringRef, isHovering, isHidden } = useCustomCursor()

  if (isHidden) return null

  return (
    <div className="hidden md:block">
      <div
        ref={dotRef}
        className="custom-cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? 10 : 6,
          height: isHovering ? 10 : 6,
          borderRadius: "50%",
          background: "#2563FF",
          boxShadow: "0 2px 8px rgba(37,99,255,0.4)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1), height 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isHovering ? 52 : 36,
          height: isHovering ? 52 : 36,
          borderRadius: "50%",
          border: `1.5px solid ${isHovering ? "#2563FF" : "rgba(37,99,255,0.3)"}`,
          backgroundColor: isHovering ? "rgba(37,99,255,0.05)" : "transparent",
          pointerEvents: "none",
          zIndex: 9998,
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  )
}
