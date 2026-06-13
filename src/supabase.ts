import { createClient } from '@supabase/supabase-js'

// Public anon key — read-only on items, entries, users (RLS-gated).
// Sensitive admin RPCs are passphrase-gated server-side.
const SB_URL = 'https://pefsxeskrlfmhardceer.supabase.co'
const SB_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZnN4ZXNrcmxmbWhhcmRjZWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDI2MjEsImV4cCI6MjA5NjU3ODYyMX0.ewGBPS1oOKSNnMMazogCu2EtmzTKKVtjIcNNcJIRuCk'

export const sb = createClient(SB_URL, SB_ANON, {
  realtime: { params: { eventsPerSecond: 5 } },
})
