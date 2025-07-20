
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://yplcuvdaunxggoolmsvp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbGN1dmRhdW54Z2dvb2xtc3ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTgzNjMzMiwiZXhwIjoyMDQ3NDEyMzMyfQ.hhPx0Lc-TDKbQkkBBh8kErokMiut6XG50RnEFe2kNc8'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase