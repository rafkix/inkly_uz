/**
 * The current backend OpenAPI has no /users/me/theme endpoints.
 * Theme types are therefore client-side presentation state only; this module
 * deliberately contains no HTTP calls to a nonexistent backend route.
 */
export const themeApi = {
  getMe: async () => null,
  updateMe: async <T>(data: T) => data,
}
