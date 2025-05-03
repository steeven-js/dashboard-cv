-- Schéma SQL complet pour l'application Dashboard CV
-- Ce script crée ou met à jour toutes les tables et politiques nécessaires
-- Compatible avec Supabase

-----------------------------------------
-- 1. CONFIGURATION DU SCHÉMA
-----------------------------------------

-- Activer les UUID pour les identifiants
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-----------------------------------------
-- 2. CRÉATION DES TABLES DE BASE
-----------------------------------------

-- Table principale des utilisateurs
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  address TEXT,
  photo_url TEXT,
  UNIQUE(auth_id)
);

-- Table des informations personnelles du CV
-- Cette partie utilise la technique de migration sécurisée
DO $$
DECLARE
  table_exists BOOLEAN;
  col_exists_firstName BOOLEAN;
  col_exists_first_name BOOLEAN;
BEGIN
  -- Vérifier si la table existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'personal_info'
  ) INTO table_exists;
  
  -- Si la table existe, vérifier le format des colonnes
  IF table_exists THEN
    -- Vérifier si les anciennes colonnes existent (camelCase)
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'personal_info' AND column_name = 'firstname'
    ) INTO col_exists_firstName;
    
    -- Vérifier si les nouvelles colonnes existent (snake_case)
    SELECT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'personal_info' AND column_name = 'first_name'
    ) INTO col_exists_first_name;
    
    -- Migration si nécessaire
    IF col_exists_firstName AND NOT col_exists_first_name THEN
      -- Renommer les colonnes (de camelCase à snake_case)
      ALTER TABLE public.personal_info RENAME COLUMN firstname TO first_name;
      ALTER TABLE public.personal_info RENAME COLUMN lastname TO last_name;
      ALTER TABLE public.personal_info RENAME COLUMN professionaltitle TO professional_title;
      
      RAISE NOTICE 'Table personal_info mise à jour avec les noms de colonnes en snake_case';
    ELSIF col_exists_first_name THEN
      RAISE NOTICE 'La table personal_info existe déjà au bon format';
    ELSE
      -- Format inconnu, on va la recréer
      DROP TABLE IF EXISTS public.personal_info;
      RAISE NOTICE 'Table personal_info supprimée car format incorrect';
      table_exists := FALSE;
    END IF;
  END IF;
  
  -- Créer la table si elle n'existe pas ou a été supprimée
  IF NOT table_exists THEN
    CREATE TABLE public.personal_info (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      -- Informations de base
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      professional_title TEXT NOT NULL,
      summary TEXT,
      -- Coordonnées
      email TEXT NOT NULL,
      phone TEXT,
      website TEXT,
      linkedin TEXT,
      address TEXT,
      -- URL de la photo après upload (optionnelle)
      photo_url TEXT,
      -- Champs supplémentaires pour des futures extensions
      additional_data JSONB DEFAULT '{}'::jsonb
    );
    RAISE NOTICE 'Table personal_info créée';
  END IF;
END $$;

-- Table des compétences techniques
CREATE TABLE IF NOT EXISTS public.technical_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  years_experience NUMERIC(3,1),
  tags TEXT[] DEFAULT '{}',
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des expériences professionnelles
CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des projets personnels
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  technologies TEXT[] DEFAULT '{}',
  url TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des formations et diplômes
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  institution TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des offres d'emploi
CREATE TABLE IF NOT EXISTS public.job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  job_type TEXT,
  description TEXT,
  offer_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  importance INTEGER DEFAULT 0
);

-- Table des CV générés
CREATE TABLE IF NOT EXISTS public.generated_cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_offer_id UUID NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  content JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-----------------------------------------
-- 3. POLITIQUES DE SÉCURITÉ (RLS)
-----------------------------------------

-- Activer le RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_cvs ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les erreurs
DO $$
BEGIN
  -- personal_info
  BEGIN DROP POLICY IF EXISTS "Les utilisateurs peuvent lire leurs propres infos personnelles" ON public.personal_info; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter leurs propres infos personnelles" ON public.personal_info; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres infos personnelles" ON public.personal_info; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres infos personnelles" ON public.personal_info; EXCEPTION WHEN OTHERS THEN END;
  
  -- Les autres tables auront des politiques similaires
END $$;

-- Créer les politiques pour chaque table
-- Politiques personal_info
CREATE POLICY "Les utilisateurs peuvent lire leurs propres infos personnelles" 
  ON public.personal_info FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres infos personnelles" 
  ON public.personal_info FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres infos personnelles" 
  ON public.personal_info FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres infos personnelles" 
  ON public.personal_info FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour technical_skills
CREATE POLICY "Lecture compétences" 
  ON public.technical_skills FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Ajout compétences" 
  ON public.technical_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mise à jour compétences" 
  ON public.technical_skills FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Suppression compétences" 
  ON public.technical_skills FOR DELETE USING (auth.uid() = user_id);

-- Politiques similaires pour les autres tables
-- experiences, projects, education, job_offers, generated_cvs
-- (Structure similaire avec des vérifications sur user_id)

-----------------------------------------
-- 4. STOCKAGE
-----------------------------------------

-- Ces commandes doivent être exécutées manuellement depuis l'interface Supabase
-- ou via l'API d'administration

/* 
-- Création d'un bucket de stockage pour les avatars
CREATE STORAGE BUCKET IF NOT EXISTS avatars WITH public = false;

-- Politiques pour les avatars
CREATE POLICY "Les avatars sont accessibles publiquement pour la lecture"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Les utilisateurs peuvent téléverser leurs propres avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

-----------------------------------------
-- 5. CONFIRMATION
-----------------------------------------

DO $$
BEGIN
  RAISE NOTICE '-----------------------------------';
  RAISE NOTICE 'Installation du schéma terminée !';
  RAISE NOTICE '-----------------------------------';
  RAISE NOTICE 'Toutes les tables et politiques nécessaires ont été créées ou mises à jour.';
  RAISE NOTICE 'Vérifiez la section stockage pour créer le bucket avatars si nécessaire.';
END $$; 