"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, User, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/api/client";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactFormSchema>) {
    try {
      await apiClient.post("/contact", values);
      toast.success("Message sent!", {
        description:
          "Thank you for contacting us. We will get back to you shortly.",
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to send message.", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="text-center p-0 mb-6">
        <CardTitle className="text-3xl font-bold text-slate-100">
          Contact Us
        </CardTitle>
        <p className="text-slate-300">
          Have a question? We'd love to hear from you.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="John Doe"
                          className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-slate-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
                          className="pl-10 bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-slate-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Message</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-4 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Textarea
                        placeholder="Your message..."
                        className="pl-10 min-h-[120px] bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-slate-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-primary text-primary-foreground font-bold px-12 py-6 text-base"
              >
                <Send className="h-5 w-5 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
