import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Michael Rodriguez",
    role: "Managing Partner, Rodriguez & Associates",
    image: "",
    quote:
      "LexDraft has revolutionized how we handle document generation. We've cut our document creation time by 75% while maintaining the highest standards of legal accuracy.",
  },
  {
    name: "Emily Chen",
    role: "Legal Operations Director, TechCorp",
    image: "",
    quote:
      "The AI-powered insights and risk analysis features have been game-changers for our legal team. We can now focus on strategy rather than document drafting.",
  },
  {
    name: "David Thompson",
    role: "General Counsel, InnovateTech",
    image: "",
    quote:
      "The template library is comprehensive and the customization options are excellent. It's like having a team of legal experts at your fingertips.",
  },
  {
    name: "Sarah Williams",
    role: "Solo Practitioner",
    image: "",
    quote:
      "As a solo practitioner, LexDraft has been invaluable. It helps me maintain professional standards while handling more cases efficiently.",
  },
  {
    name: "James Wilson",
    role: "Legal Department Head, Global Corp",
    image: "",
    quote:
      "The compliance features and automated risk assessment have significantly reduced our legal review time. A must-have for modern legal departments.",
  },
  {
    name: "Lisa Martinez",
    role: "Legal Tech Consultant",
    image: "",
    quote:
      "LexDraft represents the future of legal document automation. Its AI capabilities and user-friendly interface set a new standard in the industry.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Trusted by Legal Professionals Worldwide
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how LexDraft is transforming legal document workflows
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.image}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <blockquote className="mt-4 text-muted-foreground">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
