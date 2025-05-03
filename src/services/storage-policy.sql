CREATE POLICY \
Allow
all
user
uploads\ ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'dashboard-cv');
