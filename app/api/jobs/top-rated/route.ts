import { NextRequest, NextResponse } from "next/server";
import { CategorySyncService } from "@/lib/services/category-sync";

function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-api-key");
  const expectedApiKey = process.env.JOB_API_KEY;
  return !!expectedApiKey && apiKey === expectedApiKey;
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting top-rated categories sync...");

    const syncService = new CategorySyncService();
    const result = await syncService.syncTopRated();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Top-rated categories sync completed successfully",
        jobId: result.jobId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Top-rated categories sync failed",
          error: result.error,
          jobId: result.jobId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Top-rated sync error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Top-rated categories sync failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
