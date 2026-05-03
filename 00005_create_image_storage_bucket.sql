-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-9uvxfs77japt_bcs_images',
  'app-9uvxfs77japt_bcs_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'application/pdf']
);

-- Storage policies
CREATE POLICY "Anyone can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-9uvxfs77japt_bcs_images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'app-9uvxfs77japt_bcs_images');

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'app-9uvxfs77japt_bcs_images');

CREATE POLICY "Admins can delete images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'app-9uvxfs77japt_bcs_images' AND is_admin(auth.uid())
  );