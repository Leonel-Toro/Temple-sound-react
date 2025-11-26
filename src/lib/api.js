const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USER_URL = import.meta.env.VITE_API_USER_URL || BASE_URL;
const AUTH_URL = import.meta.env.VITE_API_AUTH_URL || USER_URL;

function isFormData(body) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

async function request(base, path, { method = "GET", headers = {}, body } = {}) {
  const init = { method, headers: { ...headers } };

  if (body !== undefined) {
    if (isFormData(body)) {
      init.body = body;
    } else {
      init.headers["Content-Type"] = init.headers["Content-Type"] || "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${base}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const code = data?.code ?? `HTTP_${res.status}`;
    const msg = data?.description || res.statusText || "Error inesperado";
    throw new Error(`${code}: ${msg}`);
  }
  return data;
}

function createClient(base) {
  return {
    get: (p) => request(base, p),
    post: (p, b) => request(base, p, { method: "POST", body: b }),
    patch: (p, b) => request(base, p, { method: "PATCH", body: b }),
    put: (p, b) => request(base, p, { method: "PUT", body: b }),
    del: (p) => request(base, p, { method: "DELETE" }),
  };
}

export const api = createClient(BASE_URL);      // productos / carrito / órdenes
export const apiUsers = createClient(USER_URL); // usuarios
export const apiAuth = createClient(AUTH_URL);  // autenticación
