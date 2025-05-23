"use server"

import { cookies } from "next/headers"

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  if (!token) {
    return null
  }

  // In a real app, we would validate the token and fetch user data
  // For demo purposes, we'll just return a mock user
  return {
    user: {
      id: "1",
      name: "Taylor Smith",
      email: "taylor@example.com",
    },
  }
}

export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}
