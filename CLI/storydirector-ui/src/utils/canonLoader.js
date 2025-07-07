// src/utils/canonLoader.js (localStorage version)

/**
 * Load a universe's canon from localStorage.
 * @param {string} universeId - e.g., "echoborn"
 * @returns {object|null} Canon JSON or null if not found or invalid
 */
export function getUniverseCanon(universeId) {
  const key = `canon_${universeId}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("[canonLoader] Invalid JSON for", universeId, err);
    return null;
  }
}

/**
 * Save a universe canon to localStorage.
 * @param {string} universeId
 * @param {object} data - canon index.json object
 */
export function saveUniverseCanon(universeId, data) {
  const key = `canon_${universeId}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * List all stored universe IDs from localStorage.
 * @returns {string[]} array of universe IDs
 */
export function listUniverses() {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("canon_"))
    .map((k) => k.replace("canon_", ""));
}

/**
 * Get the timeline entries from a specific universe
 * @param {string} universeId
 * @returns {object[]} timelines array or []
 */
export function getTimelines(universeId) {
  const canon = getUniverseCanon(universeId);
  return canon?.timelines || [];
}
