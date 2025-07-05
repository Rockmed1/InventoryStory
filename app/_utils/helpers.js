export function destructuredFormData(state, formData) {
  const formDataObject = Object.fromEntries(formData.entries());

  // 3. Combine and return the two arrays
  return { ...state, ...formDataObject };
}

/*  */
export function parseIdAndName(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => `${item.id} - ${item.name}`);
}

export function removeLocDesc(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}
