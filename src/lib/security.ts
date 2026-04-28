import { prisma } from "@/lib/prisma";

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;
const BLOCK_DURATION_HOURS = 24;

export async function recordLoginAttempt(ipAddress: string, username: string, success: boolean) {
  // Record the attempt
  await prisma.loginAttempt.create({
    data: {
      ipAddress,
      username,
    },
  });

  // If failed, check if we should block the IP
  if (!success) {
    await checkAndBlockIp(ipAddress);
  } else {
    // On successful login, clear recent failed attempts for this IP
    await prisma.loginAttempt.deleteMany({
      where: {
        ipAddress,
        createdAt: {
          gte: new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000),
        },
      },
    });
  }
}

export async function checkAndBlockIp(ipAddress: string) {
  const recentAttempts = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      createdAt: {
        gte: new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000),
      },
    },
  });

  if (recentAttempts >= MAX_LOGIN_ATTEMPTS) {
    // Block the IP
    await prisma.ipBlocklist.create({
      data: {
        ipAddress,
        reason: `Too many failed login attempts (${recentAttempts} in ${LOGIN_ATTEMPT_WINDOW_MINUTES} minutes)`,
        expiresAt: new Date(Date.now() + BLOCK_DURATION_HOURS * 60 * 60 * 1000),
      },
    });
    return true; // IP was blocked
  }

  return false; // IP was not blocked
}

export async function isIpBlocked(ipAddress: string): Promise<boolean> {
  const block = await prisma.ipBlocklist.findFirst({
    where: {
      ipAddress,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return !!block;
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

export async function getRecentFailedAttempts(ipAddress: string): Promise<number> {
  return await prisma.loginAttempt.count({
    where: {
      ipAddress,
      createdAt: {
        gte: new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000),
      },
    },
  });
}
