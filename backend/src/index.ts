import app from "./app.js";
import { connectDb } from "./config/db.js";
import { checkProxy } from "./config/proxy.js";
import { HOST, NODE_ENV, PORT } from "./constants/dotenv.js";

const bootstrap = async (): Promise<void> => {
  await connectDb();
  await checkProxy();

  if (NODE_ENV !== "prod") {
    app.listen(PORT, () => {
      console.group(`\n [MY GEEK HUB]`);
      console.log(`• Environment →   ${NODE_ENV}`);
      console.log(`• Port        →   ${PORT}`);
      console.log(`• PID         →   ${process.pid}`);
      console.groupEnd();
      console.log(`\n Available on http://${HOST}:${PORT}`);
    });
  }
};

bootstrap().catch((err) => {
  console.error("[FATAL] Initialization error:", err);
  process.exit(1);
});
