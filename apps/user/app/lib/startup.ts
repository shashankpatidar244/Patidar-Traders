import { startCronJobs } from "@repo/database";

let started = false;

export function initApp() {
  if (started) return;

  started = true;

  startCronJobs();

  console.log("🚀 App initialized");
}