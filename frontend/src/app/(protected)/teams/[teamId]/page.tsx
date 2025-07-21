"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Crown,
  Shield,
  Edit,
  Eye,
  Mail,
  Plus,
  Share2,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { teamService, collaborationService } from "@/api/teams";
import { documentService, Document } from "@/api/documents";
import { TeamDetails, TeamRole, TeamMember, TeamInvitation } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

const roleIcons = {
  [TeamRole.OWNER]: <Crown className="h-4 w-4 text-yellow-600" />,
  [TeamRole.ADMIN]: <Shield className="h-4 w-4 text-blue-600" />,
  [TeamRole.EDITOR]: <Edit className="h-4 w-4 text-green-600" />,
  [TeamRole.VIEWER]: <Eye className="h-4 w-4 text-gray-600" />,
};

const roleColors = {
  [TeamRole.OWNER]:
    "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30",
  [TeamRole.ADMIN]:
    "bg-muted/80 text-foreground border-border dark:bg-muted dark:text-foreground dark:border-border",
  [TeamRole.EDITOR]:
    "bg-primary/10 text-primary/80 border-primary/20 dark:bg-primary/20 dark:text-primary/90 dark:border-primary/30",
  [TeamRole.VIEWER]:
    "bg-muted text-muted-foreground border-border dark:bg-muted/60 dark:text-muted-foreground dark:border-border",
};

export default function TeamDetailPage() {
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [shareDocsDialogOpen, setShareDocsDialogOpen] = useState(false);

  // Loading states
  const [inviteLoading, setInviteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  // Form states
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("viewer");
  const [inviteMessage, setInviteMessage] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const teamId = params.teamId as string;

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
      fetchUserDocuments();
    }
  }, [teamId]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const data = await teamService.getTeamDetails(teamId);
      setTeamDetails(data);
      setTeamName(data.team.name);
      setTeamDescription(data.team.description || "");
    } catch (error) {
      console.error("Error fetching team details:", error);
      toast({
        title: "Error",
        description: "Failed to load team details",
        variant: "destructive",
      });
      router.push("/teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDocuments = async () => {
    try {
      const docs = await documentService.getAll();
      setUserDocuments(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleInviteMembers = async () => {
    if (!inviteEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    setInviteLoading(true);
    try {
      const emails = inviteEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const inviteData = {
        emails,
        role: inviteRole as TeamRole,
        message: inviteMessage.trim() || undefined,
      };

      await teamService.inviteMembers(teamId, inviteData);

      toast({
        title: "Success!",
        description: `Invitations sent to ${emails.length} email${
          emails.length > 1 ? "s" : ""
        }`,
      });

      setInviteDialogOpen(false);
      setInviteEmails("");
      setInviteMessage("");
      setInviteRole("viewer");
      fetchTeamDetails(); // Refresh to show new pending invitations
    } catch (error) {
      console.error("Error inviting members:", error);
      toast({
        title: "Error",
        description: "Failed to send invitations",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    setUpdateLoading(true);
    try {
      const updateData = {
        name: teamName.trim(),
        description: teamDescription.trim() || undefined,
      };

      await teamService.updateTeam(teamId, updateData);

      toast({
        title: "Success!",
        description: "Team settings updated successfully",
      });

      setSettingsDialogOpen(false);
      fetchTeamDetails(); // Refresh to show updated team info
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleShareDocuments = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one document to share",
        variant: "destructive",
      });
      return;
    }

    setShareLoading(true);
    try {
      await collaborationService.shareDocumentsWithTeam(
        teamId,
        selectedDocuments
      );

      toast({
        title: "Success!",
        description: `${selectedDocuments.length} document${
          selectedDocuments.length > 1 ? "s" : ""
        } shared with team`,
      });

      setShareDocsDialogOpen(false);
      setSelectedDocuments([]);
      fetchTeamDetails(); // Refresh to show new shared documents
    } catch (error) {
      console.error("Error sharing documents:", error);
      toast({
        title: "Error",
        description: "Failed to share documents",
        variant: "destructive",
      });
    } finally {
      setShareLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/teams");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teamDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">
            Team not found
          </h1>
          <Button onClick={handleBack} className="mt-4">
            Back to Teams
          </Button>
        </div>
      </div>
    );
  }

  const { team, members, pending_invitations, recent_documents } = teamDetails;
  const userRole = team.user_role;
  const canManageTeam =
    userRole === TeamRole.OWNER || userRole === TeamRole.ADMIN;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-6 hover:bg-primary/10 text-primary dark:hover:bg-primary/20 dark:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Teams
        </Button>

        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background dark:from-primary/20 dark:via-primary/10 dark:to-background border border-primary/20 dark:border-primary/30 mb-8 p-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 dark:opacity-70"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-foreground to-primary/80 bg-clip-text text-transparent">
                      {team.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge
                        variant="outline"
                        className={`${
                          roleColors[userRole!]
                        } shadow-sm border-2`}
                      >
                        <span className="flex items-center gap-1 font-medium">
                          {roleIcons[userRole || "viewer"]}
                          Your role:{" "}
                          {userRole
                            ? userRole.charAt(0).toUpperCase() +
                              userRole.slice(1)
                            : "Viewer"}
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-400/30 dark:bg-green-400/10"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                {team.description && (
                  <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
                    {team.description}
                  </p>
                )}

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{members.length} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-primary" />
                    <span>{recent_documents.length} documents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span>
                      Created{" "}
                      {formatDistanceToNow(new Date(team.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {canManageTeam && (
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                  {/* Settings Dialog */}
                  <Dialog
                    open={settingsDialogOpen}
                    onOpenChange={setSettingsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary/20 hover:bg-primary/10 hover:border-primary/40 dark:border-primary/30 dark:hover:bg-primary/20"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Team Settings</DialogTitle>
                        <DialogDescription>
                          Update your team information and settings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="team-name">Team Name</Label>
                          <Input
                            id="team-name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter team name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="team-description">Description</Label>
                          <Textarea
                            id="team-description"
                            value={teamDescription}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            placeholder="Enter team description (optional)"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setSettingsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateTeam}
                            disabled={updateLoading}
                          >
                            {updateLoading ? "Updating..." : "Update Team"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Invite Members Dialog */}
                  <Dialog
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Invite Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Invite Team Members</DialogTitle>
                        <DialogDescription>
                          Send invitations to collaborate on your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="invite-emails">Email Addresses</Label>
                          <Textarea
                            id="invite-emails"
                            value={inviteEmails}
                            onChange={(e) => setInviteEmails(e.target.value)}
                            placeholder="Enter email addresses (separate multiple emails with commas)"
                            rows={3}
                          />
                          <p className="text-sm text-muted-foreground">
                            Separate multiple email addresses with commas
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-role">Role</Label>
                          <Select
                            value={inviteRole}
                            onValueChange={(value) =>
                              setInviteRole(value as TeamRole)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Viewer - Can view team documents
                                </div>
                              </SelectItem>
                              <SelectItem value="editor">
                                <div className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Editor - Can edit team documents
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  Admin - Can manage team members
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-message">
                            Personal Message (Optional)
                          </Label>
                          <Textarea
                            id="invite-message"
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder="Add a personal message to the invitation"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setInviteDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleInviteMembers}
                            disabled={inviteLoading}
                          >
                            {inviteLoading ? "Sending..." : "Send Invitations"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 border-primary/20 dark:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="flex items-center text-primary">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-md mr-3">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">Members</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Active team members
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-primary mb-1">
              {members.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Collaborating together
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-muted/80 to-muted/40 dark:from-muted dark:to-muted/60 border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="flex items-center text-foreground">
              <div className="p-2 bg-gradient-to-br from-foreground/80 to-foreground rounded-lg shadow-md mr-3">
                <Mail className="h-5 w-5 text-background" />
              </div>
              <div>
                <span className="text-lg font-bold">Invitations</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Pending invites
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground mb-1">
              {pending_invitations.length}
            </div>
            <p className="text-sm text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/15 to-primary/8 dark:from-primary/25 dark:to-primary/15 border-primary/25 dark:border-primary/35 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="flex items-center text-primary">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-md mr-3">
                <Share2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">Documents</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Shared documents
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-primary mb-1">
              {recent_documents.length}
            </div>
            <p className="text-sm text-muted-foreground">Team resources</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-accent/60 to-accent/30 dark:from-accent/80 dark:to-accent/40 border-border shadow-lg hover:shadow-xl transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="flex items-center text-primary">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-md mr-3">
                <Crown className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">Team Age</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Time since creation
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg font-bold text-primary mb-1">
              {formatDistanceToNow(new Date(team.created_at), {
                addSuffix: true,
              })}
            </div>
            <p className="text-sm text-muted-foreground">Experience building</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Documents Dialog */}
      <Dialog open={shareDocsDialogOpen} onOpenChange={setShareDocsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Share Documents with Team</DialogTitle>
            <DialogDescription>
              Select documents from your library to share with the team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents available to share</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {userDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocuments.includes(doc.id)
                        ? "bg-primary/10 border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      setSelectedDocuments((prev) =>
                        prev.includes(doc.id)
                          ? prev.filter((id) => id !== doc.id)
                          : [...prev, doc.id]
                      );
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(doc.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {doc.title || "Untitled Document"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm text-muted-foreground">
                {selectedDocuments.length} document
                {selectedDocuments.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShareDocsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShareDocuments}
                  disabled={selectedDocuments.length === 0 || shareLoading}
                >
                  {shareLoading ? "Sharing..." : "Share Documents"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Share Documents Button */}
          {canManageTeam && (
            <Button
              variant="outline"
              onClick={() => setShareDocsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Documents
            </Button>
          )}
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Team Members
                </CardTitle>
                <CardDescription>Recent additions to the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(
                              member.user_full_name || member.user_email || "?"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {member.user_full_name || member.user_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.user_email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${roleColors[member.role]} text-xs`}
                      >
                        {roleIcons[member.role]}
                        <span className="ml-1">{member.role}</span>
                      </Badge>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("members")}
                    >
                      View all {members.length} members
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="h-5 w-5 mr-2" />
                  Recent Documents
                </CardTitle>
                <CardDescription>Recently shared with the team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recent_documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No documents shared yet</p>
                      {canManageTeam && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() => setShareDocsDialogOpen(true)}
                        >
                          Share your first document
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {recent_documents.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-start justify-between"
                        >
                          <div className="flex-1">
                            <Link href={`/documents/${doc.document_id}`}>
                              <p className="text-sm font-medium hover:text-primary cursor-pointer">
                                {doc.document_title || "Untitled Document"}
                              </p>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              Shared by {doc.shared_by_name} •{" "}
                              {formatDistanceToNow(new Date(doc.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <Link href={`/documents/${doc.document_id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {recent_documents.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab("documents")}
                        >
                          View all documents
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members ({members.length})</CardTitle>
                  <CardDescription>
                    Manage your team members and their roles
                  </CardDescription>
                </div>
                {canManageTeam && (
                  <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(
                            member.user_full_name || member.user_email || "?"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.user_full_name || "No name provided"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined{" "}
                          {formatDistanceToNow(new Date(member.joined_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${roleColors[member.role]}`}
                      >
                        {roleIcons[member.role]}
                        <span className="ml-1">{member.role}</span>
                      </Badge>
                      {canManageTeam && member.role !== TeamRole.OWNER && (
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {pending_invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Pending Invitations ({pending_invitations.length})
                </CardTitle>
                <CardDescription>
                  Users who have been invited but haven't joined yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pending_invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited{" "}
                          {formatDistanceToNow(
                            new Date(invitation.created_at),
                            {
                              addSuffix: true,
                            }
                          )}{" "}
                          • Expires{" "}
                          {formatDistanceToNow(
                            new Date(invitation.expires_at),
                            {
                              addSuffix: true,
                            }
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${roleColors[invitation.role]}`}
                      >
                        {roleIcons[invitation.role]}
                        <span className="ml-1">{invitation.role}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Team Documents ({recent_documents.length})
                  </CardTitle>
                  <CardDescription>
                    Documents shared with this team
                  </CardDescription>
                </div>
                {canManageTeam && (
                  <Button
                    size="sm"
                    onClick={() => setShareDocsDialogOpen(true)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Document
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recent_documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Share2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No documents shared yet
                  </h3>
                  <p className="mb-4">
                    Share documents with your team to start collaborating
                  </p>
                  {canManageTeam && (
                    <Button onClick={() => setShareDocsDialogOpen(true)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share your first document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recent_documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1">
                        <Link href={`/documents/${doc.document_id}`}>
                          <h4 className="font-medium mb-1 hover:text-primary cursor-pointer">
                            {doc.document_title || "Untitled Document"}
                          </h4>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Shared by {doc.shared_by_name} •{" "}
                          {formatDistanceToNow(new Date(doc.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Link href={`/documents/${doc.document_id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
