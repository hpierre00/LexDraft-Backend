"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Users,
  Settings,
  Mail,
  Crown,
  Shield,
  Edit,
  Eye,
  Sparkles,
  TrendingUp,
  Activity,
  Star,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { teamService } from "@/api/teams";
import { Team, TeamRole } from "@/lib/types";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleIcons = {
  [TeamRole.OWNER]: <Crown className="h-4 w-4 text-primary" />,
  [TeamRole.ADMIN]: <Shield className="h-4 w-4 text-foreground/80" />,
  [TeamRole.EDITOR]: <Edit className="h-4 w-4 text-primary/80" />,
  [TeamRole.VIEWER]: <Eye className="h-4 w-4 text-muted-foreground" />,
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

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Clear any console errors
  useEffect(() => {
    console.clear();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [searchQuery, roleFilter]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (roleFilter && roleFilter !== "all") params.role = roleFilter;

      const data = await teamService.getTeams(params);
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (teamData: {
    name: string;
    description?: string;
  }) => {
    try {
      const newTeam = await teamService.createTeam(teamData);
      toast({
        title: "Success!",
        description: `Team "${newTeam.name}" created successfully`,
      });
      setCreateDialogOpen(false);
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const handleTeamClick = (teamId: string) => {
    router.push(`/teams/${teamId}`);
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      !searchQuery ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || team.user_role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 mb-8 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-foreground to-primary/80 bg-clip-text text-transparent">
                      Teams
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Collaborative Workspace
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Create, manage, and collaborate with your team on legal
                  documents and projects. Build stronger workflows with
                  role-based access and real-time collaboration.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Enhanced Productivity</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure Collaboration</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-primary" />
                    <span>Real-time Updates</span>
                  </div>
                </div>
              </div>

              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                    <Plus className="h-4 w-4" />
                    Create Team
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <CreateTeamDialog
                    onSubmit={handleCreateTeam}
                    onCancel={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-xl"></div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-background border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-md">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-bold text-primary">
                    Total Teams
                  </span>
                  <p className="text-sm text-muted-foreground font-normal">
                    Your workspaces
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-primary mb-1">
                {teams.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Active collaborations
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/20 to-background border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-foreground/80 to-foreground rounded-lg shadow-md">
                  <Crown className="h-5 w-5 text-background" />
                </div>
                <div>
                  <span className="text-lg font-bold text-foreground">
                    Owned Teams
                  </span>
                  <p className="text-sm text-muted-foreground font-normal">
                    Your leadership
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-foreground mb-1">
                {
                  teams.filter((team) => team.user_role === TeamRole.OWNER)
                    .length
                }
              </div>
              <p className="text-sm text-muted-foreground">Teams you manage</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-accent/20 to-background border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-primary/80 to-primary rounded-lg shadow-md">
                  <Star className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-lg font-bold text-primary">
                    Active Projects
                  </span>
                  <p className="text-sm text-muted-foreground font-normal">
                    In progress
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-primary mb-1">
                {teams.reduce((sum, team) => sum + (team.member_count || 0), 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total members</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 shadow-lg border-primary/10 dark:border-primary/20 bg-card/50 dark:bg-card/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-primary/20 focus:border-primary focus:ring-primary/20 dark:border-primary/30 dark:focus:border-primary dark:bg-background/50"
              />
            </div>

            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-48 border-primary/20 focus:border-primary focus:ring-primary/20 dark:border-primary/30 dark:focus:border-primary dark:bg-background/50">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="dark:bg-card border-primary/20 dark:border-primary/30">
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    All Roles
                  </div>
                </SelectItem>
                <SelectItem value="owner">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    Owner
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-foreground" />
                    Admin
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary/80" />
                    Editor
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    Viewer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => {
            const gradients = [
              "from-primary/10 to-primary/5 border-primary/20 dark:from-primary/20 dark:to-primary/10 dark:border-primary/30",
              "from-muted/80 to-muted/40 border-border dark:from-muted dark:to-muted/60 dark:border-border",
              "from-primary/15 to-primary/8 border-primary/25 dark:from-primary/25 dark:to-primary/15 dark:border-primary/35",
              "from-accent/60 to-accent/30 border-border dark:from-accent/80 dark:to-accent/40 dark:border-border",
              "from-primary/12 to-primary/6 border-primary/22 dark:from-primary/22 dark:to-primary/12 dark:border-primary/32",
              "from-secondary/80 to-secondary/40 border-border dark:from-secondary dark:to-secondary/60 dark:border-border",
            ];
            const gradient = gradients[i % gradients.length];

            return (
              <Card
                key={i}
                className={`animate-pulse bg-gradient-to-br ${gradient} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-6 bg-foreground/10 dark:bg-foreground/20 rounded-lg w-3/4 mb-3"></div>
                      <div className="h-4 bg-foreground/8 dark:bg-foreground/15 rounded-lg w-1/2"></div>
                    </div>
                    <div className="p-2 bg-foreground/10 dark:bg-foreground/20 rounded-lg w-9 h-9"></div>
                  </div>
                  <div className="h-3 bg-foreground/8 dark:bg-foreground/15 rounded w-full mb-1"></div>
                  <div className="h-3 bg-foreground/8 dark:bg-foreground/15 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-foreground/8 dark:bg-foreground/15 rounded w-1/3"></div>
                      <div className="h-3 bg-foreground/8 dark:bg-foreground/15 rounded w-1/4"></div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-foreground/10 dark:border-foreground/20">
                      <div className="h-4 bg-foreground/8 dark:bg-foreground/15 rounded w-1/4"></div>
                      <div className="h-6 bg-foreground/8 dark:bg-foreground/15 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : filteredTeams.length === 0 ? (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 dark:from-primary/10 dark:via-background dark:to-primary/20 border-primary/20 dark:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50 dark:opacity-70"></div>
          <CardContent className="text-center py-16 relative z-10">
            <div className="p-4 bg-gradient-to-br from-primary to-primary/80 rounded-full w-20 h-20 mx-auto mb-6 shadow-lg">
              <Users className="h-12 w-12 text-primary-foreground mx-auto mt-2" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {searchQuery || (roleFilter && roleFilter !== "all")
                ? "No teams found"
                : "No teams yet"}
            </h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              {searchQuery || (roleFilter && roleFilter !== "all")
                ? "Try adjusting your search or filters to find what you're looking for"
                : "Create your first team to start collaborating with colleagues on legal projects"}
            </p>
            {!searchQuery && (!roleFilter || roleFilter === "all") && (
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg"
              >
                <Sparkles className="h-5 w-5" />
                Create Your First Team
              </Button>
            )}

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl opacity-60"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-lg opacity-40"></div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team, index) => {
            const gradients = [
              "from-primary/10 to-primary/5 border-primary/20 dark:from-primary/20 dark:to-primary/10 dark:border-primary/30",
              "from-muted/80 to-muted/40 border-border dark:from-muted dark:to-muted/60 dark:border-border",
              "from-primary/15 to-primary/8 border-primary/25 dark:from-primary/25 dark:to-primary/15 dark:border-primary/35",
              "from-accent/60 to-accent/30 border-border dark:from-accent/80 dark:to-accent/40 dark:border-border",
              "from-primary/12 to-primary/6 border-primary/22 dark:from-primary/22 dark:to-primary/12 dark:border-primary/32",
              "from-secondary/80 to-secondary/40 border-border dark:from-secondary dark:to-secondary/60 dark:border-border",
            ];
            const gradient = gradients[index % gradients.length];

            return (
              <Card
                key={team.id}
                className={`cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${gradient} shadow-lg group border-2 hover:border-primary/40 dark:hover:border-primary/50`}
                onClick={() => handleTeamClick(team.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold mb-2 group-hover:text-primary transition-colors dark:text-foreground dark:group-hover:text-primary">
                        {team.name}
                      </CardTitle>
                      {team.user_role && (
                        <Badge
                          variant="outline"
                          className={`${
                            roleColors[team.user_role]
                          } shadow-sm border-2`}
                        >
                          <span className="flex items-center gap-1 font-medium">
                            {roleIcons[team.user_role]}
                            {team.user_role.charAt(0).toUpperCase() +
                              team.user_role.slice(1)}
                          </span>
                        </Badge>
                      )}
                    </div>
                    <div className="p-2 bg-foreground/10 dark:bg-foreground/20 rounded-lg shadow-sm">
                      <Users className="h-5 w-5 text-foreground/80 dark:text-foreground" />
                    </div>
                  </div>

                  {team.description && (
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2 leading-relaxed dark:text-muted-foreground">
                      {team.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground/80 dark:text-foreground">
                        <div className="p-1 bg-foreground/10 dark:bg-foreground/20 rounded">
                          <Users className="h-3 w-3" />
                        </div>
                        <span className="font-medium">
                          {team.member_count || 0} members
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        <span className="text-xs">
                          {formatDistanceToNow(new Date(team.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-foreground/10 dark:border-foreground/20">
                      <div className="flex items-center gap-2">
                        {team.user_role === TeamRole.OWNER && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Owner
                          </Badge>
                        )}

                        {!team.is_active && (
                          <Badge
                            variant="outline"
                            className="text-xs text-destructive border-destructive/20 bg-destructive/10 dark:text-destructive dark:border-destructive/30 dark:bg-destructive/20"
                          >
                            Inactive
                          </Badge>
                        )}

                        {team.is_active && (
                          <Badge
                            variant="outline"
                            className="text-xs text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-400/30 dark:bg-green-400/10"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Active
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary/80 hover:bg-primary/10 group-hover:translate-x-1 transition-all dark:text-primary dark:hover:text-primary/90 dark:hover:bg-primary/20"
                      >
                        <span className="flex items-center gap-1">
                          View
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
