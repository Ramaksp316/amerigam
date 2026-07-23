"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Helper to get current user from cookies (assuming Amerigam has this setup)
async function getCurrentUser() {
  const cookieStore = await cookies();
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

export async function getTimeTableEntries(dateStr?: string) {
  const user = await getCurrentUser();
  if (!user) return [];

  // Determine the target date (start and end of that specific day)
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
  // Fetch all entries for this user
  const entries = await prisma.timeTableEntry.findMany({
    where: { userId: user.id },
    include: {
      taskLogs: {
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
        },
      },
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  // If we are looking at TODAY, run the missed tasks check
  const isToday = new Date().toDateString() === targetDate.toDateString();
  if (isToday) {
    const currentHours = String(new Date().getHours()).padStart(2, '0');
    const currentMinutes = String(new Date().getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const currentDay = dayNames[new Date().getDay()];

    for (const entry of entries) {
      if (entry.daysOfWeek.includes(currentDay) && currentTimeStr > entry.endTime) {
        // Time is up. Did they complete it?
        if (entry.taskLogs.length === 0) {
          // Missed it! Log it as MISSED and deduct 5 points
          await prisma.$transaction([
            prisma.taskLog.create({
              data: {
                userId: user.id,
                timeTableEntryId: entry.id,
                status: "MISSED",
                pointsAwarded: -5,
              }
            }),
            prisma.user.update({
              where: { id: user.id },
              data: { productivityScore: { decrement: 5 } }
            })
          ]);
          // Add it to the local array to reflect the new state
          entry.taskLogs.push({ status: "MISSED", pointsAwarded: -5 } as any);
        }
      }
    }
  }

  return entries;
}

export async function completeTask(entryId: string, dateStr?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const entry = await prisma.timeTableEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry || entry.userId !== user.id) {
    throw new Error("Entry not found");
  }

  // Check if already logged for this day
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

  const existingLog = await prisma.taskLog.findFirst({
    where: {
      timeTableEntryId: entryId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      },
    },
  });

  if (existingLog) {
    return { success: false, message: "Already logged for this day" };
  }

  // Create log and update user score
  await prisma.$transaction([
    prisma.taskLog.create({
      data: {
        userId: user.id,
        timeTableEntryId: entry.id,
        status: "COMPLETED",
        pointsAwarded: entry.pointsReward,
        date: new Date() // Will log for right now
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
