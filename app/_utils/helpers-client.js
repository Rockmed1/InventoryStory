import entityClientConfig from "../_lib/client/entityClientConfig.js";

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
export async function useClientData(entity, id /* , options = {} */) {
  let url;

  if (id) {
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

/*  */
export function parseIdAndName(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((_) => `${_.id} - ${_.name}`);
}

export function removeLocDesc(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((_) => ({
    id: _.id,
    name: _.name,
  }));
}

// Helper function to get field mappings from appConfig (CLIENT-SAFE)
export function getFieldMappings(entity) {
  const config = entityClientConfig(entity);
  if (!config || !config.fieldMappings) {
    throw new Error(`Field mappings for '${entity}' not found in appConfig.`);
  }
  return {
    idField: config.fieldMappings.idField,
    nameField: config.fieldMappings.nameField,
    displayName: config.displayName,
  };
}
