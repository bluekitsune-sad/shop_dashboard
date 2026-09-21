/**
 * Database client singleton.
 *
 * Local development uses a file-based libSQL database (file:./data/shop.db).
 * Production uses a hosted Turso database via DATABASE_URL + DATABASE_AUTH_TOKEN.
 * The same Drizzle schema is used for both — only the connection differs.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/lib/db/schema";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/shop.db";

const isRemote = !databaseUrl.startsWith("file:");

const client = createClient(
  isRemote
    ? {
        url: databaseUrl,
        authToken: process.env.DATABASE_AUTH_TOKEN,
      }
    : { url: databaseUrl },
);

export const db = drizzle(client, { schema });

export type Db = typeof db;

export { schema };