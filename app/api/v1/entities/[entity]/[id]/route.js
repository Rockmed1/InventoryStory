import { allowedEntities } from "@/app/_lib/config/server/entityServerOnlyConfig";
import { getServerData } from "@/app/_utils/helpers-server";
import "server-only";

export async function GET(request, { params }) {
  const { entity, id } = await params;

  const ALLOWED_ENTITIES = allowedEntities();

  // console.log("api params: ", `entity: ${entity}`, `id: ${id}`);

  try {
    const { searchParams } = new URL(request.url);

    // Validate entity
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: "Invalid entity" }, { status: 400 });
    }

    // Validate ID
    if (!id || isNaN(Number(id))) {
      return Response.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Extract additional query parameters
    // const type = searchParams.get("type");

    const allParams = Object.fromEntries(searchParams);

    console.log("route[id] - allParams: ", allParams);
    //TODO: 🚨 Add zod validation and sanitization here

    // if (id) queryParams.push(Number(id));

    // if (type) queryParams.push(type === 'simple' ? true : type)
    // if (limit) queryParams.push(Number(limit))

    const data = await getServerData({ entity, id, ...allParams });

    return Response.json(data, {
      headers: {
        "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API Error for entity ${entity}/${id}:`, error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
