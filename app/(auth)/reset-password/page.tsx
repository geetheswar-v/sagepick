import { ResetPasswordForm } from "@/components/forms/reset-password-form"

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[] }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams
  const tokenParam = resolvedSearchParams?.token
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam ?? null

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}
