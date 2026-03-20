import app from "./app.js";
import { PORT } from "./constants/constants.js";

app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
});
