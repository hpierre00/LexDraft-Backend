export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  snippet: string;
  content: string;
  featured_image_url?: string | null;
  featured_image_alt?: string | null;
  category_id: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  tags?: string[] | null;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API}/blog/posts`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

export async function fetchPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API}/blog/posts/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Post not found: ${slug}`);
  return res.json();
}
