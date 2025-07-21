"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateTeamData } from "@/lib/types";

interface CreateTeamDialogProps {
  onSubmit: (data: CreateTeamData) => Promise<void>;
  onCancel: () => void;
}

export function CreateTeamDialog({
  onSubmit,
  onCancel,
}: CreateTeamDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("New Team");
  const [description, setDescription] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Clean and prepare the data
      const cleanData: CreateTeamData = {
        name: name.trim() || "New Team",
        description: description?.trim() || undefined,
      };

      await onSubmit(cleanData);

      // Reset form
      setName("New Team");
      setDescription("");
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Create New Team
        </DialogTitle>
        <DialogDescription className="text-lg text-muted-foreground">
          Create a new team to collaborate on legal documents and projects with
          your colleagues.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label
            htmlFor="name"
            className="text-sm font-semibold text-foreground"
          >
            Team Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a descriptive team name..."
            className="transition-all duration-200 border-border focus:border-primary focus:ring-primary/20"
            onFocus={(e) => {
              // Select all text when focusing if it's the default value
              if (e.target.value === "New Team") {
                e.target.select();
              }
            }}
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="description"
            className="text-sm font-semibold text-foreground"
          >
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this team and what you'll collaborate on..."
            rows={4}
            className="transition-all duration-200 resize-none border-border focus:border-primary focus:ring-primary/20"
          />
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/50">
            💡 Help team members understand the purpose and scope of this team
            for better collaboration.
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>✨</span>
                Create Team
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
