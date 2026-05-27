import { Prisma } from "@prisma/client";

/** Prisma codes for unreachable DB, timeouts, pool exhaustion (common on Neon). */
const CONNECTION_ERROR_CODES = new Set([
  "P1000",
  "P1001",
  "P1002",
  "P1008",
  "P1011",
  "P1017",
  "P2024",
]);

export function isPrismaConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return CONNECTION_ERROR_CODES.has(error.code);
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("can't reach database") ||
      msg.includes("connection") ||
      msg.includes("timeout") ||
      msg.includes("econnrefused") ||
      msg.includes("neon")
    );
  }
  return false;
}

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database temporarily unavailable") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}
