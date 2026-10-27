import { TENRAI_API_URL } from "@/constants/api.js";
import { createProxyMiddleware, Options } from "http-proxy-middleware";

export const tenraiProxy = (pathRewrite: Options["pathRewrite"] = {}, options?: Options) =>
  createProxyMiddleware({
    target: TENRAI_API_URL,
    changeOrigin: true,
    pathRewrite,
    ...options,
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.removeHeader("authorization");
        proxyReq.removeHeader("cookie");
        proxyReq.setHeader("Accept", "application/json");
      },
      proxyRes: (proxyRes) => {
        for (const header of Object.keys(proxyRes.headers)) {
          if (header.startsWith("access-control-")) delete proxyRes.headers[header];
        }
        if (proxyRes.statusCode === 200) {
          proxyRes.headers["cache-control"] = "public, max-age=300";
        }
      },
      ...options?.on,
    },
  });
