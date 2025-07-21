import { MapPin, Briefcase, BrainCircuit, PenTool, Users } from "lucide-react";
import { HeroHeader } from "@/components/header";

const jobOpenings = [
  {
    title: "Senior AI Engineer",
    location: "Remote",
    department: "Engineering",
    icon: BrainCircuit,
  },
  {
    title: "Legal Content Specialist",
    location: "New York, NY",
    department: "Content",
    icon: PenTool,
  },
  {
    title: "Product Manager - AI Features",
    location: "Remote",
    department: "Product",
    icon: Briefcase,
  },
  {
    title: "Customer Success Manager",
    location: "San Francisco, CA",
    department: "Customer Success",
    icon: Users,
  },
];

export default function CareersPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">
              Join Our Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are building the future of legal technology and looking for
              passionate, talented individuals to join us on our mission.
            </p>
          </div>

          {/* Why Join Us */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Join Lawverra?</h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              At Lawverra, you'll work with a diverse and brilliant team on
              challenging problems that have a real-world impact. We offer a
              dynamic work environment, competitive compensation, and the
              opportunity to grow your career at the intersection of law and AI.
            </p>
          </div>

          {/* Job Openings */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">
              Current Openings
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {jobOpenings.map((job, index) => (
                <div
                  key={index}
                  className="p-6 border border-primary/20 rounded-lg bg-secondary/30 flex items-start space-x-4"
                >
                  <div className="bg-primary/10 p-3 rounded-full">
                    <job.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <p className="text-muted-foreground">
                Interested in any of these positions? Send your resume and cover
                letter to{" "}
                <a
                  href="mailto:careers@lawverra.com"
                  className="text-primary hover:underline font-medium"
                >
                  careers@lawverra.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
