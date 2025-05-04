import React from 'react';
import { motion } from 'framer-motion';

/**
 * Crée un composant motion personnalisé à partir d'un composant MUI
 * Cette approche évite les problèmes de conversion d'objets en primitives
 * 
 * @param {React.ComponentType} Component - Le composant MUI à animer
 * @returns {React.ComponentType} - Le composant avec les capacités d'animation de framer-motion
 */
export const createMotionComponent = (Component) => {
  // Utilisez forwardRef pour garantir que la référence est correctement passée
  const WrappedComponent = React.forwardRef((props, ref) => <Component {...props} ref={ref} />);
  // Définir le displayName pour des messages d'erreur plus clairs
  WrappedComponent.displayName = `Motion${Component.displayName || Component.name || 'Component'}`;
  
  // Convertir en composant motion
  return motion(WrappedComponent);
};

/**
 * Variants d'animation couramment utilisés
 */
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const slideInVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } },
};

export const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
};

/**
 * Transitions prédéfinies
 */
export const transitions = {
  default: { duration: 0.4 },
  spring: { type: 'spring', stiffness: 300, damping: 25 },
  bounce: { type: 'spring', stiffness: 300, damping: 15 },
  smooth: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] },
}; 