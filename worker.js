import { MLCEngineWorkerHandler, MLCengine } from "https://esm.run/@mlc-ai/web-llm"

const engine = new MLCengine();
const handler = new MLCEngineWorkerHandler(engine);

onmessage = msg => {
  handler.onmessage(msg);
}