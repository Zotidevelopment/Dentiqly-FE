import React from "react"
import { motion } from "framer-motion"

interface RevealProps {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}

/** Entrada suave al hacer scroll. Un solo easing para toda la landing. */
export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, y = 24, className, once = true }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: "-60px" }}
    transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)
