export const supabaseConfig = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
  serviceRoleKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY',
};

export const rateLimitConfig = {
  windowMs: 60 * 1000,
  maxRequests: 60,
};
