
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
}: CompatibilityCardProps) {
  const { level, color } = getCompatibilityLevel(score);
  
  // Extract initials for avatar fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Card className="overflow-hidden">
      <div className="relative p-6 flex flex-col items-center text-center">
        <Badge className={`absolute top-4 right-4 ${color}`}>
          {score}% · {level}
        </Badge>
        
        <Avatar className="h-20 w-20 mb-4">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        
        <h3 className="text-xl font-medium">{name}</h3>
        
        {dimensions.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            {dimensions.slice(0, 3).map((dimension) => (
              <div key={dimension.name} className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>{dimension.name}</span>
                  <span>{dimension.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
        <CardContent className="px-6 py-0">
          <div className="border-t pt-4 space-y-2">
            {strengths.length > 0 && (
              <div>
                <p className="text-sm font-medium">Top Strength</p>
                <p className="text-sm text-muted-foreground">{strengths[0]}</p>
              </div>
            )}
            
            {challenges.length > 0 && (
              <div>
                <p className="text-sm font-medium">Top Challenge</p>
                <p className="text-sm text-muted-foreground">{challenges[0]}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="px-6 py-4 flex">
        <Button className="w-full" asChild>
          <Link href={`/compatibility/${userId}`}>{actionText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}