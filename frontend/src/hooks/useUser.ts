/**
 * useUser — Global user context hook
 *
 * Fetches current user + student profile once after login and caches it
 * via React Query. Every component in the app can call useUser() to get
 * the logged-in user's data without making extra API calls.
 *
 * Data shape returned:
 *   user        → { id, email, full_name, role }
 *   student     → { id, college, branch, year, cgpa, ... }
 *   isLoggedIn  → boolean
 *   isLoading   → boolean
 *   refetch     → () => void  (call after onboarding updates)
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthAPI, OnboardingAPI } from "@/lib/api";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  college: string | null;
  branch: string | null;
  year: number | null;
  cgpa: number | null;
  city: string | null;
  state: string | null;
  preferred_language: string | null;
  is_onboarding_completed: boolean;
  current_step: number;
  profile_completeness: number;
}

export interface UserContextData {
  user: CurrentUser | null;
  student: StudentProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const USER_QUERY_KEY = ["currentUser"];

export function useUser(): UserContextData {
  const queryClient = useQueryClient();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data, isLoading, refetch } = useQuery({
    queryKey: USER_QUERY_KEY,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes — don't refetch on every render
    retry: 1,
    queryFn: async () => {
      // Fetch user + student profile in parallel
      const [meRes, profileRes] = await Promise.allSettled([
        AuthAPI.getMe(),
        OnboardingAPI.getMe(),
      ]);

      const user =
        meRes.status === "fulfilled" && meRes.value?.data
          ? (meRes.value.data as CurrentUser)
          : null;

      const student =
        profileRes.status === "fulfilled" &&
        profileRes.value?.data?.student_profile
          ? (profileRes.value.data.student_profile as StudentProfile)
          : null;

      return { user, student };
    },
  });

  return {
    user: data?.user ?? null,
    student: data?.student ?? null,
    isLoggedIn: !!token && !!data?.user,
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),
  };
}

/** Call after login/signup to seed the query cache immediately */
export function useInvalidateUser() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
}
