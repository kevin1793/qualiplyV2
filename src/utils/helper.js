// helpers.js (or at the top of your ApplicationsAdmin.js)
export function niceName(field) {
  if (!field) return "";
  // Split camelCase or snake_case
  const result = field
    .replace(/([A-Z])/g, " $1")       // Add space before capital letters
    .replace(/_/g, " ")               // Replace underscores with spaces
    .toLowerCase()                    // lowercase everything first
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letter of each word
  return result;
}