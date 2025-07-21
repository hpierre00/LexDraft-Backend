"use client";

import { useEffect, useState } from "react";
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
import { ClientProfileCreate, clientService } from "@/api/clients";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UUID } from "@/lib/types";

const clientEditSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  address: z.string().optional().nullable(),
  phone_number: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(), // YYYY-MM-DD
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
});

type ClientEditFormValues = z.infer<typeof clientEditSchema>;

interface ClientEditFormProps {
  clientId: UUID;
  onSuccess?: () => void;
}

export function ClientEditForm({ clientId, onSuccess }: ClientEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingClient, setIsFetchingClient] = useState(true);
  const { toast } = useToast();

  const form = useForm<ClientEditFormValues>({
    resolver: zodResolver(clientEditSchema),
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

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setIsFetchingClient(true);
        const client = await clientService.getClientProfile(clientId);
        form.reset({
          full_name: client.full_name || "",
          address: client.address || null,
          phone_number: client.phone_number || null,
          gender: client.gender || null,
          date_of_birth: client.date_of_birth?.split("T")[0] || null, // Format for input type="date"
          state: client.state || null,
          city: client.city || null,
          zip_code: client.zip_code || null,
        });
      } catch (error) {
        console.error("Failed to fetch client data:", error);
        toast({
          title: "Error",
          description:
            "Failed to load client profile for editing. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsFetchingClient(false);
      }
    };
    fetchClientData();
  }, [clientId, form, toast]);

  async function onSubmit(values: ClientEditFormValues) {
    setIsLoading(true);
    try {
      const clientUpdateData: ClientProfileCreate = {
        full_name: values.full_name,
        address: values.address || null,
        phone_number: values.phone_number || null,
        gender: values.gender || null,
        date_of_birth: values.date_of_birth || null,
        state: values.state || null,
        city: values.city || null,
        zip_code: values.zip_code || null,
      };

      await clientService.updateClientProfile(clientId, clientUpdateData);
      toast({
        title: "Client Updated",
        description: `Client ${values.full_name} has been successfully updated.`,
      });
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to update client:", error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update client.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetchingClient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Client's Full Name"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
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
                <FormLabel>City (Optional)</FormLabel>
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
                <FormLabel>State (Optional)</FormLabel>
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
                <FormLabel>Zip Code (Optional)</FormLabel>
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
              <FormLabel>Gender (Optional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={
                  field.value === null || field.value === ""
                    ? "not-specified"
                    : field.value
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not-specified">Not specified</SelectItem>
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
          {isLoading ? "Updating..." : "Update Client"}
        </Button>
      </form>
    </Form>
  );
}
