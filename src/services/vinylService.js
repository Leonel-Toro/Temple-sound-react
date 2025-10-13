import { api } from "../lib/api";

export const vinylService = {
  list: () => api.get("/vinyl"),
  get: (id) => api.get(`/vinyl/${id}`),
  create: (payload) => api.post("/vinyl", payload),
  update: (id, payload) => api.patch(`/vinyl/${id}`, payload),
  remove: (id) => api.del(`/vinyl/${id}`),
};
