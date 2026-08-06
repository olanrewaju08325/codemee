DO $$ 
DECLARE 
  new_student_id TEXT; 
  v_email TEXT := 'test_diag_email@gmail.com'; 
  v_id UUID;
  v_password TEXT := 'TestPassword123!';
BEGIN 
  -- Try to get existing user ID
  SELECT id INTO v_id FROM auth.users WHERE email = v_email;
  
  IF v_id IS NULL THEN
    -- User doesn't exist, create new
    v_id := gen_random_uuid();
    new_student_id := 'CDM25' || lpad(nextval('public.student_id_seq')::text, 4, '0');
    
    -- Create user in auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      NOW(),
      jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
      jsonb_build_object('full_name', ''),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Insert into profiles with ON CONFLICT
    INSERT INTO public.profiles (id, student_id, full_name, role, email) 
    VALUES (v_id, new_student_id, '', 'student', v_email)
    ON CONFLICT (id) DO UPDATE SET
      student_id = EXCLUDED.student_id,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      email = EXCLUDED.email;
    
    RAISE NOTICE '✅ New user created with ID: %, Student ID: %', v_id, new_student_id;
  ELSE
    -- User exists, get or create profile
    RAISE NOTICE 'User exists with ID: %', v_id;
    
    -- Use INSERT with ON CONFLICT to handle existing profile
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_id) THEN
      new_student_id := 'CDM25' || lpad(nextval('public.student_id_seq')::text, 4, '0');
      INSERT INTO public.profiles (id, student_id, full_name, role, email) 
      VALUES (v_id, new_student_id, '', 'student', v_email)
      ON CONFLICT (id) DO NOTHING;
      RAISE NOTICE '✅ Profile created for existing user ID: %', v_id;
    ELSE
      RAISE NOTICE '⚠️ Profile already exists for user ID: %', v_id;
      -- Update profile if needed
      UPDATE public.profiles 
      SET email = v_email,
          updated_at = NOW()
      WHERE id = v_id AND email IS NULL;
    END IF;
  END IF;
  
  -- Final verification
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_id) THEN
    RAISE NOTICE '✅ Success! User ID: %, Email: %', v_id, v_email;
  ELSE
    RAISE EXCEPTION '❌ Failed to create or find profile for user %', v_email;
  END IF;
END; 
$$;

-- Verify the created user with both tables
SELECT 
  'Profile' as table_name,
  p.id,
  p.student_id,
  p.full_name,
  p.role,
  p.email,
  p.created_at
FROM public.profiles p
WHERE p.email = 'test_diag_email@gmail.com'

UNION ALL

SELECT 
  'Auth User' as table_name,
  u.id,
  NULL as student_id,
  u.raw_user_meta_data->>'full_name' as full_name,
  NULL as role,
  u.email,
  u.created_at
FROM auth.users u
WHERE u.email = 'test_diag_email@gmail.com';