import React from 'react';

import { Box, Grid, Chip, Paper, Typography } from '@mui/material';

const OriginalCV = () => (
    <Paper sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
      {/* En-tête avec Nom et Coordonnées */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          JEAN DUPONT
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Développeur Full Stack
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography>Email: jean.dupont@email.com</Typography>
            <Typography>Téléphone: +33 6 12 34 56 78</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography>github.com/jdupont</Typography>
            <Typography>linkedin.com/in/jeandupont</Typography>
          </Grid>
        </Grid>
        <Typography>Paris, France</Typography>
      </Box>

      {/* À propos */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          À propos
        </Typography>
        <Typography>
          Développeur Full Stack avec 5 ans d'expérience dans la création d'applications web
          performantes et évolutives. Expertise en JavaScript, React, Node.js et bases de données
          SQL/NoSQL. Passionné par l'architecture logicielle, les bonnes pratiques de développement
          et l'amélioration continue.
        </Typography>
      </Box>

      {/* Compétences Techniques */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          Compétences Techniques
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Langages de programmation
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="JavaScript" size="small" />
              <Chip label="TypeScript" size="small" />
              <Chip label="Python" size="small" />
              <Chip label="PHP" size="small" />
              <Chip label="SQL" size="small" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Front-end
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="React" size="small" />
              <Chip label="Vue.js" size="small" />
              <Chip label="HTML5/CSS3" size="small" />
              <Chip label="Tailwind" size="small" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Back-end
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="Node.js" size="small" />
              <Chip label="Express" size="small" />
              <Chip label="Django" size="small" />
              <Chip label="Laravel" size="small" />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Bases de données
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip label="MongoDB" size="small" />
              <Chip label="PostgreSQL" size="small" />
              <Chip label="MySQL" size="small" />
              <Chip label="Redis" size="small" />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Expérience Professionnelle */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          Expérience Professionnelle
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Grid container>
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Développeur Full Stack Senior
              </Typography>
              <Typography color="text.secondary">TechVision Solutions, Paris</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>
                Janvier 2022 - Présent
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ pl: 2, mt: 1 }}>
            <Typography sx={{ mb: 0.5 }}>
              • Développement et maintenance d'une plateforme SaaS B2B utilisée par plus de 50 000
              utilisateurs
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              • Mise en œuvre d'une architecture microservices avec Node.js et Docker, réduisant les
              temps de déploiement de 70%
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              • Refonte de l'interface utilisateur avec React et Tailwind CSS, améliorant les
              métriques d'engagement de 35%
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              • Mise en place d'une suite de tests automatisés couvrant 85% du code
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Grid container>
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Développeur Front-End
              </Typography>
              <Typography color="text.secondary">Innovate Digital, Lyon</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>
                Février 2020 - Décembre 2021
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ pl: 2, mt: 1 }}>
            <Typography sx={{ mb: 0.5 }}>
              • Développement d'applications web responsive pour divers clients dans les secteurs de
              la finance et du e-commerce
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              • Création de composants réutilisables avec Vue.js et implémentation d'une
              bibliothèque de composants interne
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              • Optimisation des performances front-end, réduisant le temps de chargement des pages
              de 40%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Formation */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          Formation
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Grid container>
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Master en Ingénierie Informatique
              </Typography>
              <Typography color="text.secondary">École Supérieure d'Informatique, Paris</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>
                2016 - 2018
              </Typography>
            </Grid>
          </Grid>
          <Typography sx={{ mt: 1 }}>
            Spécialisation en Développement Web et Mobile. Mention Très Bien.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Grid container>
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Licence en Informatique
              </Typography>
              <Typography color="text.secondary">Université de Paris</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>
                2013 - 2016
              </Typography>
            </Grid>
          </Grid>
          <Typography sx={{ mt: 1 }}>
            Option Programmation et Algorithmique. Mention Bien.
          </Typography>
        </Box>
      </Box>

      {/* Langues et Certifications */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          Langues et Certifications
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Langues
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography sx={{ mb: 0.5 }}>• Français - Langue maternelle</Typography>
              <Typography sx={{ mb: 0.5 }}>• Anglais - Courant (TOEIC 920/990)</Typography>
              <Typography sx={{ mb: 0.5 }}>• Espagnol - Intermédiaire</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Certifications
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography sx={{ mb: 0.5 }}>• AWS Certified Developer - Associate (2023)</Typography>
              <Typography sx={{ mb: 0.5 }}>• MongoDB Certified Developer (2022)</Typography>
              <Typography sx={{ mb: 0.5 }}>• Professional Scrum Master I (2021)</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Centres d'intérêt */}
      <Box sx={{ mb: 0 }}>
        <Typography
          variant="h6"
          sx={{
            textTransform: 'uppercase',
            fontWeight: 'bold',
            mb: 1,
            pb: 1,
            borderBottom: '2px solid black',
          }}
        >
          Centres d'intérêt
        </Typography>
        <Typography>
          Contribution à des projets open-source, organisation de meetups tech locaux, hackathons,
          photographie, randonnée, voyages en Asie et Amérique du Sud.
        </Typography>
      </Box>
    </Paper>
  );

export default OriginalCV;
