"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "@/lib/toast"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations"

interface ResetPasswordFormProps extends React.ComponentProps<"div"> {
  token: string | null
}

export function ResetPasswordForm({ token, className, ...props }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Reset link is missing or expired. Request a new one.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      })

      if (error) {
        throw error
      }

      toast.success("Password updated successfully. You can now sign in.")
      router.push("/login")
    } catch (error) {
      console.error("Password reset failed:", error)
      toast.error("Unable to reset password. The link may have expired.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Set a new password</CardTitle>
          <CardDescription>
            Choose a strong password to secure your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating password..." : "Update password"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>The reset link is invalid or has expired.</p>
              <p>
                You can request a new one from the <Link className="underline" href="/forgot-password">forgot password</Link> page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
