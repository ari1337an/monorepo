import { Logger } from "@workspace/logger";
import { setupApp } from "@/main/settings/app";
import { env } from "@/shared/env/index";

const log = new Logger({ name: "backend-express" });

const app = setupApp();

app.listen(env.PORT, env.HOST, () => {
  log.info(`Server listening on http://${env.HOST}:${env.PORT}`);
});

export { app };
