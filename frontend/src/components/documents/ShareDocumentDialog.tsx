"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, X, Users, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { collaborationService, teamService } from "@/api/teams";
import { Team, TeamRole, ShareDocumentData } from "@/lib/types";

const shareSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.nativeEnum(TeamRole),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareDocumentDialogProps {
  documentId: string;
  documentTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ShareDocumentDialog({
  documentId,
  documentTitle,
  onSuccess,
  onCancel,
}: ShareDocumentDialogProps) {
  const [activeTab, setActiveTab] = useState("individual");
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [collaborators, setCollaborators] = useState<ShareDocumentData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      role: TeamRole.VIEWER,
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (activeTab === "team") {
      fetchTeams();
    }
  }, [activeTab]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await teamService.getTeams();
      // Filter teams where user has permission to share (editor+ role)
      const eligibleTeams = data.filter(
        (team) =>
          team.user_role &&
          ["owner", "admin", "editor"].includes(team.user_role)
      );
      setTeams(eligibleTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleAddCollaborator = (data: ShareFormData) => {
    const newCollaborator: ShareDocumentData = {
      email: data.email,
      role: data.role,
    };

    // Check if email already exists
    if (collaborators.some((c) => c.email === data.email)) {
      toast({
        title: "Error",
        description: "This email is already in the collaborators list",
        variant: "destructive",
      });
      return;
    }

    setCollaborators([...collaborators, newCollaborator]);
    reset({ role: selectedRole }); // Keep the role, clear the email
  };

  const handleRemoveCollaborator = (index: number) => {
    setCollaborators(collaborators.filter((_, i) => i !== index));
  };

  const handleShareWithIndividuals = async () => {
    if (collaborators.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one collaborator",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await collaborationService.shareDocument(documentId, collaborators);

      toast({
        title: "Success!",
        description: `Document shared with ${collaborators.length} collaborator(s)`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error sharing document:", error);
      toast({
        title: "Error",
        description: "Failed to share document",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWithTeam = async () => {
    if (!selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await collaborationService.shareDocumentsWithTeam(selectedTeam, [
        documentId,
      ]);

      const team = teams.find((t) => t.id === selectedTeam);
      toast({
        title: "Success!",
        description: `Document shared with ${team?.name || "team"}`,
      });

      onSuccess();
    } catch (error) {
      console.error("Error sharing document with team:", error);
      toast({
        title: "Error",
        description: "Failed to share document with team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TeamRole.ADMIN:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case TeamRole.EDITOR:
        return "bg-green-100 text-green-800 border-green-200";
      case TeamRole.VIEWER:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDescription = (role: TeamRole) => {
    switch (role) {
      case TeamRole.EDITOR:
        return "Can view and edit the document";
      case TeamRole.VIEWER:
        return "Can only view the document";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Share Document</DialogTitle>
        <DialogDescription>
          Share "{documentTitle}" with team members or individual collaborators
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <form
            onSubmit={handleSubmit(handleAddCollaborator)}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permission</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue("role", value as TeamRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TeamRole.VIEWER}>
                      <div className="flex flex-col items-start">
                        <span>Viewer</span>
                        <span className="text-xs text-gray-500">View only</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={TeamRole.EDITOR}>
                      <div className="flex flex-col items-start">
                        <span>Editor</span>
                        <span className="text-xs text-gray-500">
                          View & edit
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Collaborator
            </Button>
          </form>

          {collaborators.length > 0 && (
            <div className="space-y-3">
              <Label>Collaborators ({collaborators.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collaborators.map((collaborator, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {collaborator.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getRoleDescription(collaborator.role)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={getRoleColor(collaborator.role)}
                      >
                        {collaborator.role.charAt(0).toUpperCase() +
                          collaborator.role.slice(1)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(index)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareWithIndividuals}
              disabled={isSubmitting || collaborators.length === 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share Document
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team">Select Team</Label>
              {loadingTeams ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a team to share with" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span>{team.name}</span>
                            <span className="text-xs text-gray-500">
                              {team.member_count} members
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {teams.length === 0 && !loadingTeams && (
                <p className="text-sm text-gray-500">
                  No teams available. You need editor+ permissions to share
                  documents with teams.
                </p>
              )}
            </div>

            {selectedTeam && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What happens when you share?
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• All team members will be able to view the document</li>
                  <li>• Team members with editor+ role can make changes</li>
                  <li>
                    • Team members will receive notifications about the shared
                    document
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareWithTeam}
              disabled={isSubmitting || !selectedTeam}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share with Team
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
