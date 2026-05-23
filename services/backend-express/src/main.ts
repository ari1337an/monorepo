import { Logger } from "@workspace/logger";
import { app } from "./app";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const log = new Logger({ name: "backend-express" });

app.listen(PORT, HOST, () => {
  log.info(`Server listening on http://${HOST}:${PORT}`);
});
