/**
 * Calculate the time difference between two countries based on their UTC offsets.
 * @param {string} utcOffset1 - UTC offset of the first country (e.g., '-08:00').
 * @param {string} utcOffset2 - UTC offset of the second country (e.g., '+09:00').
 * @returns {number} - Time difference in hours.
 */
export function calculateTimeDifference(utcOffset1, utcOffset2) {
  // Convert UTC offsets to hours
  const offset1 = parseOffset(utcOffset1);
  const offset2 = parseOffset(utcOffset2);

  return offset1 - offset2; // Difference in hours
}

/**
 * Parse UTC offset string and convert it to hours.
 * @param {string} offset - UTC offset string (e.g., '-08:00').
 * @returns {number} - Offset in hours.
 */
function parseOffset(offset) {
  const parts = offset.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours + minutes / 60; // Convert minutes to decimal
}
