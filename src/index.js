import { onRequestPost } from "../functions/api/submit.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/submit") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed." }), {
          status: 405,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Allow": "POST",
            "X-Content-Type-Options": "nosniff"
          }
        });
      }

      return onRequestPost({ request, env });
    }

    return env.ASSETS.fetch(request);
  }
};
