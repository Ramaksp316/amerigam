'use server';

import { prisma } from '../../lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function completeOnboarding(data: {
    masterPath: string;
    corePath: string;
    hobbies: string;
    mindset: string;
    vision: string;
    name: string;
    username: string;
    bio: string;
    location: string;
    portfolio: string;
}) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;

        if (!userId) {
            return { success: false, error: "Not logged in" };
        }

        // Check if username is taken
        const existingUsername = await prisma.user.findUnique({
            where: { username: data.username }
        });

        if (existingUsername && existingUsername.id !== userId) {
            return { success: false, error: "Username is already taken" };
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                username: data.username,
                masterPath: data.masterPath,
                corePath: data.corePath,
                hobbies: data.hobbies,
                mindset: data.mindset,
                vision: data.vision,
                bio: data.bio,
                location: data.location,
                portfolioUrl: data.portfolio,
                onboarded: true
            }
        });

        revalidatePath('/feed');
        revalidatePath('/profile');
        
        return { success: true };
    } catch (error: any) {
        console.error("Onboarding error:", error);
        return { success: false, error: error.message || "Failed to complete onboarding" };
    }
}
