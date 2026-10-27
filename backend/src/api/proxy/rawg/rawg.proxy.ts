import { IncomingHttpHeaders } from "node:http";
import { RAWG_API_URL } from "@/constants/api.js";
import { RAWG_API_KEY } from "@/constants/dotenv.js";
import { createProxyMiddleware, Options, responseInterceptor } from "http-proxy-middleware";

const withApiKey = (path: string) => {
  const url = new URL(path, RAWG_API_URL);
  url.searchParams.set("key", RAWG_API_KEY);
  return url.pathname + url.search;
};

const withoutCorsHeaders = (headers: IncomingHttpHeaders) => {
  for (const header of Object.keys(headers)) {
    if (header.startsWith("access-control-")) delete headers[header];
  }
};

const withoutApiKey = (body: string) =>
  body
    .replaceAll(`?key=${RAWG_API_KEY}&`, "?")
    .replaceAll(`&key=${RAWG_API_KEY}`, "")
    .replaceAll(`?key=${RAWG_API_KEY}`, "");

const interceptRes = responseInterceptor(async (buffer, proxyRes, _req, res) => {
  if (proxyRes.statusCode === 200) {
    res.setHeader("cache-control", "public, max-age=300");
  }
  return withoutApiKey(buffer.toString("utf8"));
});

export const rawgProxy = (pathRewrite: (path: string) => string, options?: Options) =>
  createProxyMiddleware({
    target: RAWG_API_URL,
    changeOrigin: true,
    selfHandleResponse: true,
    pathRewrite: (path) => withApiKey(pathRewrite(path)),
    ...options,
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.removeHeader("authorization");
        proxyReq.removeHeader("cookie");
        proxyReq.setHeader("Accept", "application/json");
      },
      proxyRes: (proxyRes, req, res) => {
        withoutCorsHeaders(proxyRes.headers);
        return interceptRes(proxyRes, req, res);
      },
      ...options?.on,
    },
  });
