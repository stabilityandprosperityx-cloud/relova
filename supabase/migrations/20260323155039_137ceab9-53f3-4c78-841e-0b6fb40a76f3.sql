CREATE POLICY "Authenticated users can insert relocation_steps"
ON public.relocation_steps
FOR INSERT
TO authenticated
WITH CHECK (true);