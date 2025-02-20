/**
 * @name AnimatedOutlet
 * @description 路由动画
 * @author darcrand
 */

import { AnimatePresence, motion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router'

export default function AnimatedOutlet() {
  const location = useLocation()
  const element = useOutlet()

  return (
    <AnimatePresence mode='wait' initial={true}>
      <motion.div
        key={location.pathname}
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        exit={{ opacity: 0 }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  )
}
