import express, { type Express } from "express";
import cors from "cors";
import { requestLogger } from "./middleware/request-logger";
import { errorHandler } from "./middleware/error-handler";
import routes from "./routes/index";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api", routes);

app.use(errorHandler);

export { app };
