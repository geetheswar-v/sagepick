"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "@/lib/toast"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSubmitted, setEmailSubmitted] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const redirectUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "/reset-password"
    }
    const base = window.location.origin
    return `${base}/reset-password`
  }, [])

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: redirectUrl,
      })

      if (error) {
        throw error
      }

      setEmailSubmitted(data.email)
      toast.success("If that email is registered, a reset link is on the way.")
    } catch (error) {
      console.error("Password reset request failed:", error)
      toast.error("Unable to send reset link. Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the email associated with your account and we&apos;ll send you reset instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending reset link..." : "Send reset link"}
              </Button>

              {emailSubmitted && (
                <p className="text-sm text-center text-muted-foreground">
                  We sent a reset link to <span className="font-medium">{emailSubmitted}</span>. Check your inbox and spam folder.
                  <br />If you need another email, feel free to request a new link.
                </p>
              )}
            </form>
          </Form>
        </CardContent>
        </Card>
    </div>
  )
}
