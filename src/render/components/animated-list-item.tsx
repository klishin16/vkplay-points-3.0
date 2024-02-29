import { motion } from 'framer-motion'
import React from 'react'

interface IAnimatedListProps {
  children: React.ReactNode
}

function AnimatedListItem({ children }: IAnimatedListProps) {
  return (
    <motion.li
      className="list-none relative"
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: 'auto',
        opacity: 1,
        transition: {
          type: 'spring',
          bounce: 0.3,
        },
      }}
    >
      {children}
    </motion.li>
  )
}

export default AnimatedListItem
