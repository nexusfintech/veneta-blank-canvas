import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

// Extend User type to include role
export type UserWithRole = User & { role?: string };

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<UserWithRole>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });
      
      if (response.status === 401) {
        return null;
      }
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // In dev, a missing API route may return HTML from the dev server
        return null;
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}