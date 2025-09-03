import Link from "next/link";
import { fetchPosts } from "@/lib/api";

export const revalidate = 60; // ISR revalidation time (seconds)

export default async function BlogPage() {
  const posts = await fetchPosts();

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold">Lawverra Blog</h1>
      <ul className="space-y-6">
        {posts.map((p) => (
          <li key={p.id} className="border rounded-lg p-4">
            <Link href={`/blog/${p.slug}`} className="text-xl font-semibold hover:underline">
              {p.title}
            </Link>
            <p className="text-gray-600 mt-2">{p.snippet}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
