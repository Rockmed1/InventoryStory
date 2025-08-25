"server-only";

import { allowedEntities } from "@/app/_lib/config/server/entityServerOnlyConfig";
import { getServerData } from "@/app/_utils/helpers-server";

// const ALLOWED_ENTITIES = [
//   "item",
//   "bin",
//   "market",
//   "trxType",
//   "itemClass",
//   "location",
//   "marketType",
//   "itemTrx",
//   "itemTrxDetails",
// ];

export async function GET(request, { params }) {
  const { entity } = await params;
  const ALLOWED_ENTITIES = allowedEntities();

  // console.log("api entity: ", entity);

  try {
    const { searchParams } = new URL(request.url);

    // Validate entity
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json(
        { error: `Invalid entity: ${entity}` },
        { status: 400 },
      );
    }

    const allParams = Object.fromEntries(searchParams);

    // console.log("route[entity]- getServerData parameters: ", {
    //   entity,
    //   ...allParams,
    // });

    //TODO: 🚨 Add zod validation and sanitization here

    const data = await getServerData({ entity, ...allParams });

    return Response.json(data, {
      headers: {
        "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API Error for entity ${entity}:`, error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
