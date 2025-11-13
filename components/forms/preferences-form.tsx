"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Check, X } from "lucide-react";
import { setUserPreferences } from "@/server/user";
import { toast } from "@/lib/toast";
import type { ReleaseYearRange } from "@prisma/client";
import type { Genre } from "@/lib/types/movie";

interface PreferencesFormProps {
  genres: Genre[];
  redirectTo?: string;
}

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
];

const YEAR_RANGES: { value: ReleaseYearRange; label: string; description: string }[] = [
  { value: "MODERN", label: "Modern", description: "2020 - Present" },
  { value: "RECENT", label: "Recent", description: "2010 - 2019" },
  { value: "CLASSIC", label: "Classic", description: "1990 - 2009" },
  { value: "RETRO", label: "Retro", description: "Before 1990" },
  { value: "ALL", label: "All Eras", description: "No preference" },
];

type Step = "genres" | "languages" | "years" | "keywords";

export function PreferencesForm({ genres, redirectTo = "/" }: PreferencesFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<Step>("genres");

  // Form state
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedYearRanges, setSelectedYearRanges] = useState<ReleaseYearRange[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleYearRange = (range: ReleaseYearRange) => {
    setSelectedYearRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const addKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const canProceed = () => {
    switch (currentStep) {
      case "genres":
        return selectedGenres.length >= 3;
      case "languages":
        return selectedLanguages.length >= 1;
      case "years":
        return selectedYearRanges.length >= 1;
      case "keywords":
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) return;

    const steps: Step[] = ["genres", "languages", "years", "keywords"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["genres", "languages", "years", "keywords"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = () => {
    if (!canProceed()) return;

    startTransition(async () => {
      const result = await setUserPreferences({
        genreIds: selectedGenres,
        languages: selectedLanguages,
        releaseYearRanges: selectedYearRanges,
        keywords,
      });

      if (result.success) {
        toast.success(result.message || "Preferences saved!");
        router.push(redirectTo);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save preferences");
      }
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "genres":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">What genres do you enjoy?</h2>
              <p className="text-muted-foreground mt-1">
                Select at least 3 genres you love
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary/90"
                  onClick={() => toggleGenre(genre.id)}
                >
                  {selectedGenres.includes(genre.id) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {genre.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedGenres.length}/∞ (minimum 3)
            </p>
          </div>
        );

      case "languages":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Preferred Languages</h2>
              <p className="text-muted-foreground mt-1">
                Choose the languages you want to watch movies in
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <Badge
                  key={lang.code}
                  variant={selectedLanguages.includes(lang.code) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary/90"
                  onClick={() => toggleLanguage(lang.code)}
                >
                  {selectedLanguages.includes(lang.code) && (
                    <Check className="mr-1 h-3 w-3" />
                  )}
                  {lang.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Selected: {selectedLanguages.length} language(s)
            </p>
          </div>
        );

      case "years":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">When were they made?</h2>
              <p className="text-muted-foreground mt-1">
                Select the time periods you prefer
              </p>
            </div>
            <div className="space-y-3">
              {YEAR_RANGES.map((range) => (
                <div
                  key={range.value}
                  onClick={() => toggleYearRange(range.value)}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedYearRanges.includes(range.value)
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{range.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {range.description}
                      </p>
                    </div>
                    {selectedYearRanges.includes(range.value) && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "keywords":
        return (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">
                Any specific themes? <span className="text-muted-foreground">(Optional)</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Add keywords like &ldquo;superhero&rdquo;, &ldquo;space&rdquo;, &ldquo;time-travel&rdquo;, etc.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a keyword..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button type="button" onClick={addKeyword} variant="secondary">
                Add
              </Button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="px-3 py-1">
                    {keyword}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const stepIndex = ["genres", "languages", "years", "keywords"].indexOf(currentStep);
  const progress = ((stepIndex + 1) / 4) * 100;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {stepIndex + 1} of 4</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={stepIndex === 0 || isPending}
        >
          Back
        </Button>
        {currentStep === "keywords" ? (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        ) : (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
