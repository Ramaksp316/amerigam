"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Helper to get current user from cookies (assuming Amerigam has this setup)
async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return null;
  }
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function createTimeTableEntry(data: {
  title: string;
  appContext?: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  daysOfWeek: string[]; // ["MON", "TUE"]
  pointsReward?: number;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const entry = await prisma.timeTableEntry.create({
    data: {
      userId: user.id,
      title: data.title,
      appContext: data.appContext,
      startTime: data.startTime,
      endTime: data.endTime,
      daysOfWeek: JSON.stringify(data.daysOfWeek),
      pointsReward: data.pointsReward || 10,
    },
  });

  revalidatePath("/productivity");
  return entry;
}

export async function getTimeTableEntries() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Fetch all entries for this user
  const entries = await prisma.timeTableEntry.findMany({
    where: { userId: user.id },
    include: {
      taskLogs: {
        // Only fetch today's logs to see if they're completed today
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  return entries;
}

export async function completeTask(entryId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const entry = await prisma.timeTableEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.userId !== user.id) {
    throw new Error("Entry not found");
  }

  // Check if already completed today
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const existingLog = await prisma.taskLog.findFirst({
    where: {
      timeTableEntryId: entryId,
      date: {
        gte: today,
      },
    },
  });

  if (existingLog) {
    return { success: false, message: "Already completed today" };
  }

  // Create log and update user score
  await prisma.$transaction([
    prisma.taskLog.create({
      data: {
        userId: user.id,
        timeTableEntryId: entry.id,
        pointsAwarded: entry.pointsReward,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        productivityScore: {
          increment: entry.pointsReward,
        },
      },
    }),
  ]);

  revalidatePath("/productivity");
  return { success: true, pointsAwarded: entry.pointsReward };
}

export async function logDistraction(reason: string, pointsLost: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Log distraction and update user score
  await prisma.$transaction([
    prisma.distractionLog.create({
      data: {
        userId: user.id,
        reason,
        pointsLost,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        productivityScore: {
          decrement: pointsLost,
        },
      },
    }),
  ]);

  revalidatePath("/productivity");
  return { success: true, pointsLost };
}

export async function getProductivityScore() {
  const user = await getCurrentUser();
  if (!user) return 0;
  return user.productivityScore;
}
