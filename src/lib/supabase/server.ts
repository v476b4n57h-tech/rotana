import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/env";

/**
 * Supabase-verbinding op de server, namens de ingelogde gebruiker (via cookies).
 * RLS geldt hier gewoon: de gebruiker ziet alleen wat hij mag zien.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Aangeroepen vanuit een Server Component: cookies kunnen daar niet worden gezet.
          // De middleware (fase 4) ververst de sessie.
        }
      },
    },
  });
}
