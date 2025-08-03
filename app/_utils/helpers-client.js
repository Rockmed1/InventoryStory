/**
 * A generic, client-side data fetching function.
 * It constructs a URL to the optimized API routes and fetches data.
 *
 * @param {string} entity - The name of the entity to fetch (e.g., "itemTrx", "item").
 * @param {string | number} [id] - An optional ID to fetch a specific record.
 * @param {object} [options] - Additional options like type, limit, etc.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 * @throws {Error} If the network response is not ok.
 */
export async function useData(entity, id = "all" /* , options = {} */) {
  let url;

  if (id !== "all") {
    // Use path parameter style for specific IDs
    url = `/api/v1/entities/${entity}/${id}`;

    // Add query parameters if needed
    // const params = new URLSearchParams()
    // if (options.type) params.set('type', options.type)

    // if (params.toString()) {
    //   url += `?${params}`
    // }
  } else {
    // Use query parameter style for collections
    // const params = new URLSearchParams()
    // if (options.limit) params.set('limit', options.limit)
    // if (options.type) params.set('type', options.type)

    url = `/api/v1/entities/${entity}`;
    // if (params.toString()) {
    //   url += `?${params}`
    // }
  }

  const res = await fetch(url);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    const errorPayload = await res.json();
    const errorMessage =
      errorPayload.error || errorPayload.message || "Failed to fetch data";
    throw new Error(errorMessage);
  }

  return res.json();
}

export function destructuredFormData(state, formData) {
  const formDataObject = Object.fromEntries(formData.entries());

  // 3. Combine and return the two arrays
  return { ...state, ...formDataObject };
}

export function createFormData(data) {
  //Convert RHF data to FormData for server action compatibility
  const formData = new FormData();
  Object.entries(data).forEach(([Key, value]) => {
    formData.append(Key, value);
  });
  return formData;
}
