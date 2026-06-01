export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";

import { Role } from "@prisma/client";

import {

  jsonForbidden,

  jsonUnauthorized,

} from "@/lib/auth/api-user";

import { setupCandidateUser } from "@/lib/auth/setup-user";

import prisma from "@/lib/prisma";

import { runApiWithDb } from "@/lib/db-handler";



export async function POST(req: Request) {

  return runApiWithDb(async () => {

    const session = await auth();

    if (!session.userId) return jsonUnauthorized();



    let body: { code?: string };

    try {

      body = await req.json();

    } catch {

      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    }



    const code = body.code?.trim().toUpperCase();

    if (!code) {

      return NextResponse.json(

        { error: "Recruiter code is required" },

        { status: 400 }

      );

    }



    let dbUser = await prisma.user.findUnique({

      where: { clerkId: session.userId },

    });



    if (!dbUser) {

      dbUser = await setupCandidateUser(session.userId);

    }



    if (dbUser.role === Role.RECRUITER) {

      return NextResponse.json({

        success: true,

        message: "You already have recruiter access.",

        redirect: "/recruiter/dashboard",

      });

    }



    if (dbUser.role === Role.COMPANY || dbUser.role === Role.ADMIN) {

      return jsonForbidden("This account cannot be activated as a recruiter.");

    }



    if (dbUser.role && dbUser.role !== Role.CANDIDATE) {

      return jsonForbidden("This account cannot be activated as a recruiter.");

    }



    try {

      const result = await prisma.$transaction(async (tx) => {

        const invite = await tx.recruiterInvite.findUnique({

          where: { code },

          include: {

            company: {

              select: { firstName: true, lastName: true, email: true },

            },

          },

        });



        if (!invite) {

          return { error: "Invalid recruiter code", status: 404 as const };

        }

        if (invite.isUsed) {

          return {

            error: "This recruiter code has already been used",

            status: 400 as const,

          };

        }



        const updated = await tx.user.update({

          where: { id: dbUser.id },

          data: {

            role: Role.RECRUITER,

            companyId: invite.companyId,

            onboardingCompleted: true,

          },

        });



        await tx.recruiterProfile.upsert({

          where: { userId: updated.id },

          create: {

            userId: updated.id,

            companyName:

              invite.company.firstName && invite.company.lastName

                ? `${invite.company.firstName} ${invite.company.lastName}`

                : invite.company.email,

          },

          update: {},

        });



        await tx.recruiterInvite.update({

          where: { id: invite.id },

          data: { isUsed: true },

        });



        return { success: true as const, companyId: invite.companyId };

      });



      if ("error" in result) {

        return NextResponse.json(

          { error: result.error },

          { status: result.status }

        );

      }



      revalidatePath("/company/dashboard");

      revalidatePath("/recruiter/dashboard");

      revalidatePath("/recruiter-join");



      return NextResponse.json({

        success: true,

        message: "Recruiter account activated.",

        redirect: "/recruiter/dashboard",

      });

    } catch (err) {

      console.error("[recruiter/signup]", err);

      return NextResponse.json(

        { error: "Failed to activate recruiter account" },

        { status: 500 }

      );

    }

  });

}

