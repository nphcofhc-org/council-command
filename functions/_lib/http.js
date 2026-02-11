export function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

export function methodNotAllowed(allowed) {
  return json(
    { error: `Method not allowed. Use: ${allowed.join(", ")}` },
    {
      status: 405,
      headers: {
        allow: allowed.join(", "),
      },
    },
  );
}
