import net from "node:net";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, openSync, closeSync } from "node:fs";
import { ensureDocker } from "./ensure-docker.mjs";

const PROJECT_NAME = "UX Focus V2";
const SERVICE_SLUG = "ux-focus-v2";
const START_PORT = 5173;
const CONTAINER_PORT = 80;
const MAX_ATTEMPTS = 20;
const require = createRequire(import.meta.url);
const PROJECT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function canBindPort(port) {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port, "0.0.0.0");
  });
}

async function findAvailablePort(startPort) {
  for (let offset = 0; offset < MAX_ATTEMPTS; offset += 1) {
    const port = startPort + offset;
    if (await canBindPort(port)) return port;
  }

  throw new Error(`No available port found from ${startPort} to ${startPort + MAX_ATTEMPTS - 1}.`);
}

function printStartupMessage(port) {
  console.log("");
  console.log(PROJECT_NAME);
  console.log(`Host Port: ${port}`);
  console.log(`Container Port: ${CONTAINER_PORT}`);
  console.log(`Direct URL: http://localhost:${port}`);
  console.log(`Gateway URL: http://localhost/${SERVICE_SLUG}`);
  console.log("");
}

function getRunningPort() {
  const result = spawnSync("docker", ["compose", "port", "ux-focus", String(CONTAINER_PORT)], {
    cwd: PROJECT_DIR,
    encoding: "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) return null;
  const match = result.stdout.trim().match(/:(\d+)$/);
  return match ? Number(match[1]) : null;
}

function isPortRaceFailure(output) {
  const normalized = output.toLowerCase();
  return (
    normalized.includes("address already in use") ||
    normalized.includes("port is already allocated") ||
    normalized.includes("bind for 0.0.0.0") ||
    normalized.includes("bind for [::]")
  );
}

function runCompose(port) {
  return new Promise(resolve => {
    const isWindows = process.platform === "win32";
    const child = spawn(
      isWindows ? "docker compose up --build -d" : "docker",
      isWindows ? [] : ["compose", "up", "--build", "-d"],
      {
        env: { ...process.env, UX_FOCUS_PORT: String(port) },
        shell: isWindows,
      },
    );

    let recentOutput = "";
    const remember = chunk => {
      const text = chunk.toString();
      recentOutput = `${recentOutput}${text}`.slice(-12000);
      return text;
    };

    child.stdout.on("data", chunk => process.stdout.write(remember(chunk)));
    child.stderr.on("data", chunk => process.stderr.write(remember(chunk)));
    child.on("error", error => {
      recentOutput = `${recentOutput}${error.message}`.slice(-12000);
    });

    const forwardSignal = signal => {
      if (!child.killed) child.kill(signal);
    };

    process.once("SIGINT", forwardSignal);
    process.once("SIGTERM", forwardSignal);

    child.on("close", code => {
      process.removeListener("SIGINT", forwardSignal);
      process.removeListener("SIGTERM", forwardSignal);
      resolve({ code, output: recentOutput });
    });
  });
}

function waitForHttp(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryRequest = () => {
      const request = http.get(url, response => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
          resolve();
          return;
        }

        retry();
      });

      request.once("error", retry);
      request.setTimeout(2000, () => {
        request.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}.`));
        return;
      }

      setTimeout(tryRequest, 500);
    };

    tryRequest();
  });
}

function launchWidget(url) {
  const electronPath = require("electron");
  const env = { ...process.env, UX_FOCUS_WIDGET_URL: url };
  env.UX_FOCUS_USER_DATA_DIR = path.join(PROJECT_DIR, ".cache", "electron-user-data");
  delete env.ELECTRON_RUN_AS_NODE;
  const logDir = path.join(PROJECT_DIR, ".cache");
  mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, "electron-startup.log");
  const log = openSync(logPath, "a");

  const child = spawn(
    electronPath,
    ["."],
    {
      cwd: PROJECT_DIR,
      detached: true,
      env,
      stdio: ["ignore", log, log],
      // Electron is the visible app, not a hidden background helper.
      windowsHide: false,
    },
  );

  closeSync(log);
  child.once("error", error => {
    console.error(`Unable to launch ${PROJECT_NAME}: ${error.message}. Log: ${logPath}`);
    process.exitCode = 1;
  });
  child.unref();
}

async function main() {
  await ensureDocker();
  const runningPort = getRunningPort();
  if (runningPort) {
    const result = await runCompose(runningPort);
    if (result.code !== 0) {
      process.exitCode = result.code ?? 1;
      return;
    }
    const directUrl = `http://localhost:${runningPort}`;
    await waitForHttp(directUrl);
    printStartupMessage(runningPort);
    launchWidget(directUrl);
    console.log(`${PROJECT_NAME} container updated; widget launched.`);
    return;
  }

  let nextPort = START_PORT;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const port = await findAvailablePort(nextPort);
    printStartupMessage(port);

    const result = await runCompose(port);
    if (result.code === 0) {
      const directUrl = `http://localhost:${port}`;
      await waitForHttp(directUrl);
      launchWidget(directUrl);
      console.log(`${PROJECT_NAME} widget launched.`);
      return;
    }

    if (!isPortRaceFailure(result.output)) {
      process.exit(result.code ?? 1);
    }

    console.warn(`Port ${port} became unavailable while Docker was starting. Retrying...`);
    nextPort = port + 1;
  }

  console.error(`Unable to start ${PROJECT_NAME}: exhausted ${MAX_ATTEMPTS} port attempts.`);
  process.exit(1);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
