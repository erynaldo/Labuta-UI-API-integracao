import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const servers = ["Labuta-api", "Labuta-ui"].map((project) => {
  const command = process.platform === "win32" ? "cmd.exe" : "npm";
  const args = process.platform === "win32" ? ["/d", "/s", "/c", "npm run dev"] : ["run", "dev"];
  return spawn(command, args, { cwd: path.join(root, project), stdio: "inherit" });
});

let stopping = false;
const stop = (code = 0) => {
  if (stopping) return;
  stopping = true;
  for (const server of servers) if (server.exitCode === null) server.kill();
  process.exitCode = code;
};

for (const server of servers) {
  server.on("error", (error) => {
    console.error("Não foi possível iniciar um dos servidores:", error.message);
    stop(1);
  });
  server.on("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());