"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService, ProfileInfo } from "@/api/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

const profileSetupSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  phone_number: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

interface ProfileSetupFormProps {
  onSuccess?: () => void;
}

export function ProfileSetupForm({ onSuccess }: ProfileSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      full_name: "",
      phone_number: undefined,
      gender: undefined,
      date_of_birth: undefined,
    },
  });

  async function onSubmit(values: ProfileSetupFormValues) {
    setIsLoading(true);
    try {
      const profileInfo: ProfileInfo = {
        full_name: values.full_name,
        phone_number: values.phone_number ?? undefined,
        gender: values.gender ?? undefined,
        date_of_birth: values.date_of_birth ?? undefined,
      };
      await authService.setupProfile(profileInfo);
      toast({
        title: "Profile Setup Complete",
        description: "Your profile has been successfully set up.",
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to set up profile:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to set up profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your full name"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="(123) 456-7890"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={
                  field.value === null || field.value === "" ? "" : field.value
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Non-binary">Non-binary</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <UserPlus className="h-4 w-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Setup Profile
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
