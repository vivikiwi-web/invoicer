import { Spinner } from "@/components/ui/Spinner";
import AILogo from "./AILogo";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="relative flex items-center justify-center h-[88px] w-[88px]">
        <Spinner size={88} className="absolute inset-0" />
        <AILogo size={40} />
      </div>
    </div>
  );
}
