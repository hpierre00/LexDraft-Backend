"use client";

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
import { type ClientProfileCreate, clientService } from "@/api/clients";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

const clientCreateSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  address: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
});

type ClientCreateFormValues = z.infer<typeof clientCreateSchema>;

interface ClientCreateFormProps {
  onSuccess?: () => void;
}

export function ClientCreateForm({ onSuccess }: ClientCreateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast(); // Initialize toast from useToast hook

  const form = useForm<ClientCreateFormValues>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: {
      full_name: "",
      address: null,
      phone_number: null,
      gender: null,
      date_of_birth: null,
      state: null,
      city: null,
      zip_code: null,
    },
  });

  async function onSubmit(values: ClientCreateFormValues) {
    setIsLoading(true);
    try {
      const clientData: ClientProfileCreate = {
        full_name: values.full_name,
        address: values.address || null,
        phone_number: values.phone_number || null,
        gender: values.gender || null,
        date_of_birth: values.date_of_birth || null,
        state: values.state || null,
        city: values.city || null,
        zip_code: values.zip_code || null,
      };
      await clientService.createClientProfile(clientData);
      toast({
        title: "Client Created",
        description: `Client ${values.full_name} has been successfully added.`,
      });
      onSuccess?.();
      form.reset();
    } catch (error: any) {
      console.error("Failed to create client:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create client.",
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
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Client's Full Name" {...field} />
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
              <FormLabel>Phone Number</FormLabel>
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, Anytown"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Anytown"
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
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input
                    placeholder="CA"
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
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="90210"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || "Not specified"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not specified">Not specified</SelectItem>
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
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <UserPlus className="h-4 w-4 mr-2 animate-pulse" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Client
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
