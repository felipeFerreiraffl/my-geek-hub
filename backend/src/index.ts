import app from "./app.js";
import { PORT } from "./constants/dotenv.js";

app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
