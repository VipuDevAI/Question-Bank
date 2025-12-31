import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type CoinColor = "gold" | "blue" | "green" | "red" | "orange" | "indigo" | "teal" | "pink" | "purple" | "slate";
type CoinShape = "rectangle" | "square" | "round";

interface CoinButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: CoinColor;
  shape?: CoinShape;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const colorClasses: Record<CoinColor, string> = {
  gold: "bg-coin-gold hover:bg-coin-gold-hover text-white shadow-lg shadow-yellow-500/30",
  blue: "bg-coin-blue hover:bg-coin-blue-hover text-white shadow-lg shadow-blue-500/30",
  green: "bg-coin-green hover:bg-coin-green-hover text-white shadow-lg shadow-green-500/30",
  red: "bg-coin-red hover:bg-coin-red-hover text-white shadow-lg shadow-red-500/30",
  orange: "bg-coin-orange hover:bg-coin-orange-hover text-white shadow-lg shadow-orange-500/30",
  indigo: "bg-coin-indigo hover:bg-coin-indigo-hover text-white shadow-lg shadow-indigo-500/30",
  teal: "bg-coin-teal hover:bg-coin-teal-hover text-white shadow-lg shadow-teal-500/30",
  pink: "bg-coin-pink hover:bg-coin-pink-hover text-white shadow-lg shadow-pink-500/30",
  purple: "bg-coin-purple hover:bg-coin-purple-hover text-white shadow-lg shadow-purple-500/30",
  slate: "bg-coin-slate hover:bg-coin-slate-hover text-white shadow-lg shadow-slate-500/30",
};

const shapeClasses: Record<CoinShape, string> = {
  rectangle: "px-6 py-3 rounded-md",
  square: "p-3 rounded-md aspect-square",
  round: "p-4 rounded-full aspect-square",
};

export const CoinButton = forwardRef<HTMLButtonElement, CoinButtonProps>(
  ({ className, color = "blue", shape = "rectangle", isLoading, icon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200",
          "transform hover:scale-[1.02] active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          colorClasses[color],
          shapeClasses[shape],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : icon ? (
          <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
        ) : null}
        {shape !== "square" && shape !== "round" && children}
      </button>
    );
  }
);

CoinButton.displayName = "CoinButton";
