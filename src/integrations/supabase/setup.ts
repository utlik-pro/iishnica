
// This file is meant to be run once to set up the initial Supabase data
import { supabase } from './client';

export const setupInitialData = async () => {
  // Check if admin user exists
  const { data: existingAdmin } = await supabase
    .from('admins')
    .select('*')
    .eq('username', 'admin')
    .single();

  // Add default admin if not exists
  if (!existingAdmin) {
    await supabase
      .from('admins')
      .insert([
        { username: 'admin', password: 'admin' }
      ]);
    console.log('Default admin created');
  }
};

// Run this function once when your app initializes
