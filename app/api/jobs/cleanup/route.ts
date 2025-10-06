import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyApiKey } from "@/lib/utils/auth";
import { SYNC_CONFIG } from "@/lib/config/sync-config";

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const jobCutoff = new Date(
      now.getTime() - SYNC_CONFIG.CLEANUP.jobRetentionDays * 24 * 60 * 60 * 1000
    );
    const logCutoff = new Date(
      now.getTime() - SYNC_CONFIG.CLEANUP.logRetentionDays * 24 * 60 * 60 * 1000
    );
    const categoryCutoff = new Date(
      now.getTime() -
        SYNC_CONFIG.CLEANUP.categoryRetentionDays * 24 * 60 * 60 * 1000
    );

    // Clean up old jobs and logs
    const [jobsDeleted, logsDeleted, categoriesDeleted] = await Promise.all([
      prisma.syncJob.deleteMany({
        where: { startedAt: { lt: jobCutoff } },
      }),
      prisma.syncLog.deleteMany({
        where: { createdAt: { lt: logCutoff } },
      }),
      prisma.mediaCategory.deleteMany({
        where: { updatedAt: { lt: categoryCutoff } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Cleanup completed",
      deleted: {
        jobs: jobsDeleted.count,
        logs: logsDeleted.count,
        categories: categoriesDeleted.count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
