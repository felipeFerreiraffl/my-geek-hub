import { RAWG_API_URL, TENRAI_API_URL } from "@/constants/api.js";
import { NODE_ENV, RAWG_API_KEY } from "@/constants/dotenv.js";

type Probe = {
  name: string;
  target: string;
  routes: string;
  path: string;
  limits: string;
  sample: (body: any) => string;
};

const probes: Probe[] = [
  {
    name: "Tenrai ‧ Animes",
    target: TENRAI_API_URL,
    routes: "/api/animes/*",
    path: "/anime/1",
    limits: "3 req/s ‧ 115 req/min (global)",
    sample: (body) => `${body.data.title} (mal_id ${body.data.mal_id})`,
  },
  {
    name: "Tenrai ‧ Mangas",
    target: TENRAI_API_URL,
    routes: "/api/mangas/*",
    path: "/manga/1",
    limits: "3 req/s ‧ 115 req/min (global)",
    sample: (body) => `${body.data.title} (mal_id ${body.data.mal_id})`,
  },
  {
    name: "RAWG ‧ Games",
    target: RAWG_API_URL,
    routes: "/api/games/*",
    path: `/games/3498?key=${RAWG_API_KEY}`,
    limits: "4 req/s ‧ 640 req/day (global)",
    sample: (body) => `${body.name} (id ${body.id})`,
  },
];

const PROBE_TIMEOUT_MS = 5000;

const runProbe = async (probe: Probe) => {
  const start = Date.now();

  const res = await fetch(probe.target + probe.path, {
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  });
  const latency = Date.now() - start;

  if (!res.ok) {
    await res.body?.cancel();
    return { status: res.status, ok: false, latency, sample: null };
  }

  return { status: res.status, ok: true, latency, sample: probe.sample(await res.json()) };
};

const errorReason = (err: unknown): string => {
  if (!(err instanceof Error)) return String(err);
  return err.cause instanceof Error ? err.cause.message : err.message;
};

export const checkProxy = async (): Promise<void> => {
  if (NODE_ENV !== "dev") return;

  const results = await Promise.allSettled(probes.map(runProbe));

  console.group("\n [PROXY INFOS]");
  results.forEach((result, i) => {
    const probe = probes[i];
    const probePath = new URL(probe.target + probe.path).pathname;

    if (i > 0) console.log();

    if (result.status === "rejected") {
      console.warn(`✕ ${probe.name} unreachable  →  ${errorReason(result.reason)}`);
      console.log(`• Target      →  ${probe.target}`);
      return;
    }

    const { status, ok, latency, sample } = result.value;

    console.log(`${ok ? "✓" : "✕"} ${probe.name} ${status} (${latency}ms)`);
    console.log(`• Target      →  ${probe.target}`);
    console.log(`• Routes      →  ${probe.routes}`);
    console.log(`• Probe       →  GET ${probePath}`);
    if (sample) console.log(`• Sample      →  ${sample}`);
    console.log(`• Rate limit  →  ${probe.limits}`);
  });
  console.groupEnd();
};
