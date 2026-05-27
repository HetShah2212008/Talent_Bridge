import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { parseClerkProfile } from "@/lib/auth/clerk-profile";
import { ensureCandidateProfile } from "@/lib/auth/candidate-profile";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] CLERK_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("[Webhook] Verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return new Response("No email on user", { status: 400 });
    }

    try {
      const profile = parseClerkProfile({ first_name, last_name });

      const existing = await prisma.user.findUnique({ where: { clerkId: id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            clerkId: id,
            email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: Role.CANDIDATE,
            onboardingCompleted: true,
          },
        });

        const user = await prisma.user.findUnique({ where: { clerkId: id } });
        if (user) {
          await ensureCandidateProfile(user.id);
        }

        console.log(
          `[Webhook] Created candidate ${profile.firstName} ${profile.lastName} (${email})`
        );
      }
    } catch (error) {
      console.error("[Webhook] user.created failed:", error);
      const message =
        error instanceof Error ? error.message : "Invalid user profile";
      return new Response(message, { status: 400 });
    }
  }

  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    try {
      const profile = parseClerkProfile({ first_name, last_name });

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          firstName: profile.firstName,
          lastName: profile.lastName,
        },
      });
    } catch (error) {
      console.error("[Webhook] user.updated failed:", error);
      return new Response(
        error instanceof Error ? error.message : "Invalid profile",
        { status: 400 }
      );
    }
  }

  if (evt.type === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await prisma.user.delete({ where: { clerkId: id } });
      } catch {
        // already removed
      }
    }
  }

  return new Response("", { status: 200 });
}
