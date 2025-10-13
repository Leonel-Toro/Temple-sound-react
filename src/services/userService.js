// src/services/userService.js
import { apiUsers } from "../lib/api";
export const userService = {
  list: () => apiUsers.get("/user"),
  get:  (id) => apiUsers.get(`/user/${id}`),
  create: (p) => apiUsers.post("/user", p),
  update: (id, p) => apiUsers.patch(`/user/${id}`, p), // usa PUT si tu endpoint lo requiere
  remove: (id) => apiUsers.del(`/user/${id}`),
};
