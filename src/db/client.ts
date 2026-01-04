import { env } from "@/lib/services"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "@/db/schema"

// You can specify any property from the postgres-js connection options
const db = drizzle({
    connection: {
        url: env.getDatabaseUrl(),
        ssl: true,
    },
    schema: {
        ...schema,
    },
})

export default db
