import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CompatibilityCardProps {
  userId: string | number;
  name: string;
  avatar?: string;
  score: number;
  strengths?: string[];
  challenges?: string[];
  dimensions?: {
    name: string;
    score: number;
  }[];
  actionText?: string;
  className?: string;
}

// Helper function to get compatibility level description
const getCompatibilityLevel = (score: number) => {
  if (score >= 90) return { level: "Exceptional", color: "bg-green-500 text-white" };
  if (score >= 75) return { level: "Strong", color: "bg-green-400 text-white" };
  if (score >= 60) return { level: "Moderate", color: "bg-yellow-400 text-gray-900" };
  if (score >= 40) return { level: "Mixed", color: "bg-orange-400 text-white" };
  return { level: "Limited", color: "bg-red-500 text-white" };
};

export function CompatibilityCard({
  userId,
  name,
  avatar,
  score,
  strengths = [],
  challenges = [],
  dimensions = [],
  actionText = "View Details",
  className = "",
}: CompatibilityCardProps) {
  const { level, color } = getCompatibilityLevel(score);
  
  // Extract initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative p-4 sm:p-6 flex flex-col items-center text-center">
        <Badge className={`absolute top-3 right-3 sm:top-4 sm:right-4 text-xs sm:text-sm ${color}`}>
          {score}% · {level}
        </Badge>
        
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mb-3 sm:mb-4">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <h3 className="text-lg sm:text-xl font-medium truncate max-w-full">{name}</h3>
        
        {dimensions.length > 0 && (
          <div className="w-full mt-3 sm:mt-4 space-y-2">
            {dimensions.slice(0, 3).map((dimension) => (
              <div key={dimension.name} className="w-full">
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="truncate pr-2">{dimension.name}</span>
                  <span className="flex-shrink-0">{dimension.score}%</span>
                </div>
                <div className="h-1 sm:h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dimension.score >= 90
                        ? "bg-green-500"
                        : dimension.score >= 75
                        ? "bg-green-400"
                        : dimension.score >= 60
                        ? "bg-yellow-400"
                        : dimension.score >= 40
                        ? "bg-orange-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${dimension.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {(strengths.length > 0 || challenges.length > 0) && (
        <CardContent className="px-4 sm:px-6 py-0">
          <div className="border-t pt-3 sm:pt-4 space-y-2">
            {strengths.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium">Top Strength</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{strengths[0]}</p>
              </div>
            )}
            
            {challenges.length > 0 && (
              <div>
                <p className="text-xs sm:text-sm font-medium">Top Challenge</p>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{challenges[0]}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="px-4 sm:px-6 py-3 sm:py-4 flex">
        <Button className="w-full text-sm" asChild>
          <Link href={`/compatibility/${userId}`}>{actionText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}