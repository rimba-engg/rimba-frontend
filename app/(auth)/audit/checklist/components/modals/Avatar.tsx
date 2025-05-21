import { cn } from "@/lib/utils";
import { User } from "@/lib/types";

interface AvatarProps {
  user: Pick<User, "first_name" | "last_name">;
  size?: "sm" | "md" | "lg";
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const getRandomColor = (): string => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
    "bg-teal-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const Avatar = ({ user, size = "md" }: AvatarProps) => {
  const initials = getInitials(user.first_name + " " + user.last_name);
  const bgColor = getRandomColor();
  
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full text-white font-medium",
        bgColor,
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  );
};