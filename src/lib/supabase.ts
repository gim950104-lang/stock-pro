import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nkybpewfzeoviobphduu.supabase.co";

const supabaseAnonKey =
  "sb_publishable_Yno_-I-0hVob6_lMPNmV1w_jTbEwItk";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);