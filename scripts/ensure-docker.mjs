import { existsSync } from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

export async function ensureDocker({
  platform = process.platform,
  env = process.env,
  exists = existsSync,
  run = spawnSync,
  start = spawn,
  sleep = delay,
  now = Date.now,
  timeoutMs = 180000,
} = {}) {
  const ready = () => run("docker", ["info"], {
    stdio: "ignore",
    windowsHide: true,
    timeout: 5000,
  }).status === 0;

  if (ready()) return;
  if (platform !== "win32") {
    throw new Error("Docker is unavailable. Start the Docker engine and try again.");
  }

  const candidates = [
    env.ProgramW6432 && path.join(env.ProgramW6432, "Docker", "Docker", "Docker Desktop.exe"),
    path.join(env.ProgramFiles || "C:\\Program Files", "Docker", "Docker", "Docker Desktop.exe"),
    env.LOCALAPPDATA && path.join(env.LOCALAPPDATA, "Programs", "DockerDesktop", "Docker Desktop.exe"),
  ].filter(Boolean);
  const executable = candidates.find(exists);
  if (!executable) {
    throw new Error("Docker Desktop was not found. Install Docker Desktop or start your Docker engine manually.");
  }

  console.log("Starting Docker Desktop and waiting for the Docker engine...");
  await new Promise((resolve, reject) => {
    const child = start(executable, [], {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });

  const deadline = now() + timeoutMs;
  while (now() < deadline) {
    if (ready()) return;
    await sleep(2000);
  }
  throw new Error("Timed out waiting for Docker Desktop. Check Docker Desktop for startup errors and try again.");
}
