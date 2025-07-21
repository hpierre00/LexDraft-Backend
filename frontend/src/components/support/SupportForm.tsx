"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Paperclip,
  Send,
  Bug,
  Lightbulb,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import apiClient from "@/api/client";

const supportFormSchema = z.object({
  type: z.enum(["bug", "feature", "feedback", "other"]),
  subject: z.string().min(5, "Subject must be at least 5 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters."),
  attachment: z.any().optional(),
});

export function SupportForm() {
  const form = useForm<z.infer<typeof supportFormSchema>>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      type: "bug",
      subject: "",
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof supportFormSchema>) {
    const formData = new FormData();
    formData.append("type", values.type);
    formData.append("subject", values.subject);
    formData.append("description", values.description);
    if (values.attachment && values.attachment.length > 0) {
      formData.append("attachment", values.attachment[0]);
    }

    try {
      await apiClient.post("/support", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Feedback submitted!", {
        description:
          "Thank you for helping us improve. We'll review your submission within 24 hours.",
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to submit feedback.", {
        description: "Please try again later.",
      });
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4" />;
      case "feature":
        return <Lightbulb className="h-4 w-4" />;
      case "feedback":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-secondary/20 to-accent/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Submit Your Feedback
        </CardTitle>
        <p className="text-muted-foreground">
          Help us improve by sharing your thoughts, reporting issues, or
          requesting new features.
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      Type of Request
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-primary/30 focus:border-primary focus:ring-primary/20">
                          <SelectValue placeholder="Select a request type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="bug"
                          className="flex items-center gap-2"
                        >
                          <Bug className="h-4 w-4 text-red-500" />
                          Report a Bug
                        </SelectItem>
                        <SelectItem
                          value="feature"
                          className="flex items-center gap-2"
                        >
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          Request a Feature
                        </SelectItem>
                        <SelectItem
                          value="feedback"
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          General Feedback
                        </SelectItem>
                        <SelectItem
                          value="other"
                          className="flex items-center gap-2"
                        >
                          <HelpCircle className="h-4 w-4 text-gray-500" />
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-medium">
                      Subject
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief summary of your request"
                        className="border-primary/30 focus-visible:ring-primary focus-visible:border-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide detailed information about your request. Include steps to reproduce if reporting a bug."
                      className="min-h-[150px] border-primary/30 focus-visible:ring-primary focus-visible:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Be as specific as possible to help us understand and address
                    your request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attachment"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel className="text-foreground font-medium">
                    Attachment (Optional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="file"
                        className="pl-10 border-primary/30 focus-visible:ring-primary focus-visible:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(e) => onChange(e.target.files)}
                        {...fieldProps}
                      />
                      <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    You can attach screenshots, documents, or other relevant
                    files (max 10MB).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-medium px-8"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
