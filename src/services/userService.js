// src/services/userService.js
import { apiUsers } from "../lib/api";
import { CacheService } from "./cacheService";

const userCache = new CacheService();

export const userService = {
  list: async () => {
    return userCache.getOrLoad("users:list", () => apiUsers.get("/user"));
  },

  get: async (id) => {
    return userCache.getOrLoad(`user:${id}`, () => apiUsers.get(`/user/${id}`));
  },

  create: async (p) => {
    const result = await apiUsers.post("/user", p);
    userCache.invalidate("users:list");
    return result;
  },

  update: async (id, p) => {
    const result = await apiUsers.patch(`/user/${id}`, p);
    userCache.invalidate(`user:${id}`);
    userCache.invalidate("users:list");
    return result;
  },

  remove: async (id) => {
    const result = await apiUsers.del(`/user/${id}`);
    userCache.invalidate(`user:${id}`);
    userCache.invalidate("users:list");
    return result;
  },
};
