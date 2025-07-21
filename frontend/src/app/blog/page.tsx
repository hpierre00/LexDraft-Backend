import { Calendar, User, ArrowRight } from "lucide-react";
import { HeroHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const blogPosts = [
  {
    title: "The Rise of AI in Legal Tech: A 2024 Perspective",
    author: "Dr. Evelyn Reed",
    date: "October 26, 2023",
    excerpt:
      "Exploring the transformative impact of artificial intelligence on the legal industry and what to expect in the coming years.",
    image: "/blog/post1.jpg",
  },
  {
    title: "Streamlining Contract Management with Lawverra",
    author: "John Carter",
    date: "October 20, 2023",
    excerpt:
      "A deep dive into how Lawverra's features can save your firm time and money while reducing risk.",
    image: "/blog/post2.jpg",
  },
  {
    title: "Navigating Data Privacy in the Age of AI",
    author: "Samantha Greene",
    date: "October 15, 2023",
    excerpt:
      "Best practices for ensuring data security and compliance when leveraging AI-powered legal tools.",
    image: "/blog/post3.jpg",
  },
];

export default function BlogPage() {
  return (
    <>
      <HeroHeader />
      <div className="bg-background text-foreground pt-20">
        <div className="container mx-auto py-16 px-6">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-extrabold text-primary tracking-tight">
              Lawverra Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Insights, trends, and discussions on the intersection of law,
              technology, and artificial intelligence.
            </p>
          </div>

          {/* Blog Posts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <div
                key={index}
                className="border border-primary/20 rounded-lg bg-secondary/30 overflow-hidden flex flex-col"
              >
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground flex-grow">
                    {post.excerpt}
                  </p>
                  <Button
                    variant="link"
                    asChild
                    className="self-start p-0 mt-4 text-primary"
                  >
                    <Link
                      href={`/blog/${post.title
                        .toLowerCase()
                        .replace(/ /g, "-")}`}
                    >
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
