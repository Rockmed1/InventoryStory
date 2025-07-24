import { getData } from "@/app/_utils/helpers-server";
import "server-only";

const ALLOWED_ENTITIES = [
  "item",
  "bin",
  "market",
  "trxType",
  "itemClass",
  "location",
  "marketType",
  "itemTrx",
  "itemTrxDetails",
];

export async function GET(request, { params }) {
  try {
    const { entity, id } = await params;
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

    // Build parameters array for getData function
    const queryParams = [Number(id)];
    // if (type) queryParams.push(type === 'simple' ? true : type)

    const data = await getData(entity, ...queryParams);

    return Response.json(data, {
      headers: {
        "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API Error for entity ${params.entity}/${params.id}:`, error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
