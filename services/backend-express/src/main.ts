import express from "express";
import cors from "cors";
import { Logger } from "@workspace/logger";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import routes from "./routes/index";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const log = new Logger({ name: "backend-express" });

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

app.use(errorHandler);

app.listen(PORT, HOST, () => {
  log.info(`Server listening on http://${HOST}:${PORT}`);
});
