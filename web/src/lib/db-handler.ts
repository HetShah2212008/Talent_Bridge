import { NextResponse } from "next/server";
import {
  DatabaseUnavailableError,
  isPrismaConnectionError,
} from "@/lib/prisma-errors";

export function jsonDatabaseUnavailable(
  message = "Database temporarily unavailable. Please try again shortly."
) {
  return NextResponse.json({ error: message }, { status: 503 });
}

export async function withDatabase<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (
      error instanceof DatabaseUnavailableError ||
      isPrismaConnectionError(error)
    ) {
      throw new DatabaseUnavailableError();
    }
    throw error;
  }
}

export async function runApiWithDb(
  handler: () => Promise<NextResponse | undefined>
): Promise<NextResponse> {
  try {
    const response = await handler();
    if (!response) {
      return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
    return response;
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      console.error("[db]", error.message);
      return jsonDatabaseUnavailable();
    }
    if (isPrismaConnectionError(error)) {
      console.error("[db] connection error:", error);
      return jsonDatabaseUnavailable();
    }
    throw error;
  }
}
