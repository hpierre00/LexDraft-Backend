"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Check, X, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { teamService } from "@/api/teams";
import { TeamRole } from "@/lib/types";

export default function JoinTeamPage() {
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    // For this demo, we'll proceed directly to accept
    // In a real app, you might want to show invitation details first
    setLoading(false);
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    try {
      setAccepting(true);
      const member = await teamService.acceptInvitation(token);

      setAccepted(true);
      toast({
        title: "Welcome to the team!",
        description: "You have successfully joined the team.",
      });

      // Redirect to team page after a short delay
      setTimeout(() => {
        router.push(`/teams/${member.team_id}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);

      const errorMessage =
        error.response?.data?.detail || "Failed to accept invitation";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = () => {
    router.push("/teams");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <CardTitle>Loading Invitation...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push("/teams")} variant="outline">
              Go to Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">
              Welcome to the Team!
            </CardTitle>
            <CardDescription>
              You have successfully joined the team. Redirecting you to the team
              workspace...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team on Lawverra
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Ready to collaborate?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Join this team to start collaborating on legal documents and
                projects.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By accepting this invitation, you'll be able to:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Collaborate on team documents</li>
                <li>• Participate in team discussions</li>
                <li>• Access shared resources</li>
                <li>• Work together on legal projects</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleDeclineInvitation}
              variant="outline"
              className="flex-1"
              disabled={accepting}
            >
              Decline
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              className="flex-1"
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Don't recognize this invitation?{" "}
              <button
                onClick={handleDeclineInvitation}
                className="text-primary hover:underline"
              >
                Decline and report
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
