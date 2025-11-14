import { requireAuth } from "@/server/user";
import { getGenres } from "@/lib/services/movie-service";
import { PreferencesForm } from "@/components/forms/preferences-form";
import { Sparkles } from "lucide-react";

export default async function OnboardingPage() {
  await requireAuth();

  // Fetch genres from Core Service
  const genres = await getGenres();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">
          Welcome to SagePick!
        </h1>
        <p className="text-lg text-muted-foreground">
          Let&apos;s personalize your movie experience
        </p>
      </div>

      <PreferencesForm genres={genres} redirectTo="/" />
    </div>
  );
}
