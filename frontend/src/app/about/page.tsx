import { Building, Target, Users, TrendingUp, Award, Zap } from "lucide-react";
import { HeroHeader } from "@/components/header";

export default function AboutPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">
              About Lawverra
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Revolutionizing the legal industry with AI-powered solutions that
              enhance efficiency, accuracy, and access to justice.
            </p>
          </div>

          {/* Our Mission */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              To empower legal professionals and individuals with intelligent
              tools that streamline complex legal processes, saving time and
              resources while ensuring the highest standards of quality.
            </p>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 border border-primary/20 rounded-lg bg-secondary/30">
                <Award className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  We are committed to delivering the highest quality in our
                  products and services.
                </p>
              </div>
              <div className="text-center p-6 border border-primary/20 rounded-lg bg-secondary/30">
                <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously push the boundaries of legal technology with
                  cutting-edge AI.
                </p>
              </div>
              <div className="text-center p-6 border border-primary/20 rounded-lg bg-secondary/30">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Customer-Centric</h3>
                <p className="text-muted-foreground">
                  Our users are at the heart of everything we do. We build for
                  their success.
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Founded by a team of legal experts and AI engineers, Lawverra was
              born from a shared passion to modernize the legal field. We saw
              the potential for technology to not only automate tedious tasks
              but also to provide deeper insights and support for legal
              professionals. Today, we are proud to serve thousands of users
              worldwide, helping them achieve better outcomes with greater
              efficiency.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
