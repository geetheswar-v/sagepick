import { prisma } from "@/lib/prisma";
import { SyncJobType, SyncJobStatus, LogLevel, Prisma } from "@prisma/client";

type JobMetadata = Prisma.InputJsonObject;
type LogDetails = Prisma.InputJsonObject;

export class JobLogger {
  private jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }

  static async createJob(jobType: SyncJobType, metadata?: JobMetadata) {
    const job = await prisma.syncJob.create({
      data: {
        jobType,
        status: SyncJobStatus.RUNNING,
        metadata: metadata || {},
      },
    });

    return new JobLogger(job.id);
  }

  async log(level: LogLevel, message: string, details?: LogDetails) {
    await prisma.syncLog.create({
      data: {
        jobId: this.jobId,
        level,
        message,
        details: details || {},
      },
    });

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${level}: ${message}`;

      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, details);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, details);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, details);
          break;
        default:
          console.log(logMessage, details);
      }
    }
  }

  async debug(message: string, details?: LogDetails) {
    await this.log(LogLevel.DEBUG, message, details);
  }

  async info(message: string, details?: LogDetails) {
    await this.log(LogLevel.INFO, message, details);
  }

  async warn(message: string, details?: LogDetails) {
    await this.log(LogLevel.WARN, message, details);
  }

  async error(message: string, details?: LogDetails) {
    await this.log(LogLevel.ERROR, message, details);
  }

  async updateProgress(itemsTotal: number, itemsSync: number) {
    await prisma.syncJob.update({
      where: { id: this.jobId },
      data: {
        itemsTotal,
        itemsSync,
      },
    });
  }

  async completeJob(success: boolean, errorMsg?: string) {
    await prisma.syncJob.update({
      where: { id: this.jobId },
      data: {
        status: success ? SyncJobStatus.COMPLETED : SyncJobStatus.FAILED,
        completedAt: new Date(),
        errorMsg,
      },
    });

    if (success) {
      await this.info("Job completed successfully");
    } else {
      await this.error("Job failed", { error: errorMsg });
    }
  }

  async cancelJob(reason?: string) {
    await prisma.syncJob.update({
      where: { id: this.jobId },
      data: {
        status: SyncJobStatus.CANCELLED,
        completedAt: new Date(),
        errorMsg: reason || "Job was cancelled",
      },
    });

    await this.warn("Job cancelled", { reason });
  }

  getJobId(): string {
    return this.jobId;
  }

  // Static utility methods
  static async getJobStatus(jobId: string) {
    return prisma.syncJob.findUnique({
      where: { id: jobId },
      include: {
        logs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  static async getRunningJobs() {
    return prisma.syncJob.findMany({
      where: { status: SyncJobStatus.RUNNING },
      orderBy: { startedAt: "desc" },
    });
  }

  static async getRecentJobs(limit = 50) {
    return prisma.syncJob.findMany({
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });
  }

  static async cleanupOldData() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete old logs (30 days)
    await prisma.syncLog.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
      },
    });

    // Delete old jobs (90 days)
    await prisma.syncJob.deleteMany({
      where: {
        startedAt: { lt: ninetyDaysAgo },
      },
    });
  }
}
