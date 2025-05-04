import React from 'react';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { fadeInVariants, slideInVariants, createMotionComponent } from 'src/utils/motion-utils';

// Créer des composants MUI adaptés pour framer-motion
const MotionCard = createMotionComponent(Card);
const MotionBox = createMotionComponent(Box);
const MotionTypography = createMotionComponent(Typography);

/**
 * Exemple d'utilisation de framer-motion avec MUI 7.0.1
 * Cette approche évite les erreurs "Cannot convert object to primitive value"
 */
export default function MotionExample() {
  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Exemples d&apos;animations avec Framer Motion
      </Typography>
      
      {/* Exemple 1: Animation simple avec MotionCard */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ p: 3 }}
      >
        <Typography variant="h6">Animation simple</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Cette carte s&apos;anime en entrée avec une transition fluide.
        </Typography>
      </MotionCard>
      
      {/* Exemple 2: Utilisation de variants */}
      <MotionBox
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        sx={{ 
          p: 3, 
          borderRadius: 2,
          bgcolor: 'primary.lighter',
        }}
      >
        <MotionTypography 
          variant="h6"
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          Animation avec variants
        </MotionTypography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Ce composant utilise des variants prédéfinis pour animer son entrée.
        </Typography>
      </MotionBox>
      
      {/* Exemple 3: Animation au survol */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="contained">Animation au survol</Button>
        </motion.div>
        
        <motion.div whileHover={{ rotate: 5 }} whileTap={{ scale: 0.9 }}>
          <Button variant="outlined">Animation à l&apos;interaction</Button>
        </motion.div>
      </Box>
      
      {/* Exemple 4: Animation d'éléments dans une liste */}
      <Stack spacing={1}>
        <Typography variant="subtitle1">Animation d&apos;une liste</Typography>
        {['Premier élément', 'Deuxième élément', 'Troisième élément'].map((item, index) => (
          <MotionBox
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            sx={{ 
              p: 2, 
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            {item}
          </MotionBox>
        ))}
      </Stack>
    </Stack>
  );
} 