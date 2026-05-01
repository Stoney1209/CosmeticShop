import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";
import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  // Check for proxy headers first
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to the direct connection IP
  return request.headers.get('x-client-ip') || 
         request.headers.get('cf-connecting-ip') || 
         '0.0.0.0';
}

export async function recordLoginAttempt(ip: string, success: boolean) {
  try {
    await prisma.loginAttempt.create({
      data: {
        ipAddress: ip,
        username: "",
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error recording login attempt:", error);
  }
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  try {
    const blockedIp = await prisma.ipBlocklist.findUnique({
      where: { ipAddress: ip },
    });
    return !!blockedIp && (!blockedIp.expiresAt || blockedIp.expiresAt > new Date());
  } catch (error) {
    console.error("Error checking IP block:", error);
    return false;
  }
}

export async function checkAndBlockIp(ip: string): Promise<void> {
  try {
    const recentAttempts = await prisma.loginAttempt.findMany({
      where: {
        ipAddress: ip,
        createdAt: {
          gte: new Date(Date.now() - config.loginAttemptWindowMinutes * 60 * 1000),
        },
      },
    });

    if (recentAttempts.length >= config.maxLoginAttempts) {
      await prisma.ipBlocklist.upsert({
        where: { ipAddress: ip },
        update: {
          expiresAt: new Date(Date.now() + config.blockDurationHours * 60 * 60 * 1000),
        },
        create: {
          ipAddress: ip,
          reason: "Too many failed login attempts",
          expiresAt: new Date(Date.now() + config.blockDurationHours * 60 * 60 * 1000),
        },
      });
    }
  } catch (error) {
    console.error("Error checking and blocking IP:", error);
  }
}

export async function getRecentFailedAttempts(ip: string): Promise<number> {
  try {
    return await prisma.loginAttempt.count({
      where: {
        ipAddress: ip,
        createdAt: {
          gte: new Date(Date.now() - config.loginAttemptWindowMinutes * 60 * 1000),
        },
      },
    });
  } catch (error) {
    console.error("Error getting recent failed attempts:", error);
    return 0;
  }
}

export async function cleanupOldLoginAttempts() {
  // Delete login attempts older than 30 days
  await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // Delete expired IP blocks
  await prisma.ipBlocklist.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
