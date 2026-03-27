
DELETE FROM public.user_steps WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM public.user_documents WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM public.chat_messages WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM public.user_profiles WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM auth.sessions WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM auth.identities WHERE user_id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
DELETE FROM auth.users WHERE id IN ('0f9c6ed3-8a28-4fa6-99e4-d110be6161d2', '6417c50e-47b2-46cf-af89-7ed5f2d0a9b7');
