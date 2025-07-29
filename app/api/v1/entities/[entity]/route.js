"server-only";

import { getData } from "@/app/_utils/helpers-server";

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
  const { entity } = await params;
  try {
    const { searchParams } = new URL(request.url);

    // Validate entity
    if (!ALLOWED_ENTITIES.includes(entity)) {
      return Response.json({ error: "Invalid entity" }, { status: 400 });
    }

    // Extract query parameters
    const id = searchParams.get("id");
    // const type = searchParams.get('type')
    // const limit = searchParams.get('limit')

    // Build parameters array for getData function
    const queryParams = [];
    if (id) queryParams.push(Number(id));
    // if (type) queryParams.push(type === 'simple' ? true : type)
    // if (limit) queryParams.push(Number(limit))

    const data = await getData(entity, ...queryParams);

    return Response.json(data, {
      headers: {
        "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(`API Error for entity ${params.entity}:`, error);
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
