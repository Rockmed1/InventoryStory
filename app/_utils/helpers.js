export function destructureFormAction(state, formData) {
  const formDataObject = Object.fromEntries(formData.entries());

  // 3. Combine and return the two arrays
  return { ...state, ...formDataObject };
}
