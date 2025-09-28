import { NextRequest, NextResponse } from "next/server";
import { CategorySyncService } from "@/lib/services/category-sync";
import { verifyApiKey } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting trending categories sync...");

    const syncService = new CategorySyncService();
    const result = await syncService.syncTrending();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Trending categories sync completed successfully",
        jobId: result.jobId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Trending categories sync failed",
          error: result.error,
          jobId: result.jobId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Trending sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Trending categories sync failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
