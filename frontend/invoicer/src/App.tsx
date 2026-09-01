import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { ConsentProvider } from "@/context/ConsentContext";
import { UIProvider } from "@/context/UIContext";
import { router } from "@/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <UIProvider>
            <AuthProvider>
              <LocaleProvider>
                <ConsentProvider>
                  <RouterProvider router={router} />
                </ConsentProvider>
              </LocaleProvider>
            </AuthProvider>
          </UIProvider>
        </ThemeProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
