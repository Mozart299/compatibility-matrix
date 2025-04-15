import { useEffect, useState, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';

// Define the props with TypeScript
interface RadarChartProps {
  userData: { [key: string]: number };
  otherUserData: { [key: string]: number };
  userName?: string;
  otherUserName?: string;
  className?: string;
}

export default function CompatibilityRadarChart({ 
  userData, 
  otherUserData,
  userName = "You",
  otherUserName = "Other",
  className
}: RadarChartProps) {
  // Convert data format for the radar chart
  const [chartData, setChartData] = useState<{ subject: string; [key: string]: number | string; fullMark: number }[]>([]);
  const [chartWidth, setChartWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle responsive sizing
    function handleResize() {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Initialize size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Transform the data into the format needed for Recharts
    const transformedData = Object.keys(userData).map(key => {
      // Convert camelCase to Title Case with spaces
      const name = key.charAt(0).toUpperCase() + 
                  key.slice(1).replace(/([A-Z])/g, ' $1');
      
      // For small screens, abbreviate long dimension names
      const subject = chartWidth < 350 && name.length > 12 
        ? name.split(' ').map(word => word.charAt(0)).join('')
        : name;
      
      return {
        subject: subject,
        fullName: name, // Keep the full name for tooltips
        [userName]: userData[key],
        [otherUserName]: otherUserData[key],
        fullMark: 100
      };
    });
    
    setChartData(transformedData);
  }, [userData, otherUserData, userName, otherUserName, chartWidth]);

  return (
    <div className={`w-full h-64 md:h-80 ${className}`} ref={containerRef}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fontSize: chartWidth < 350 ? 10 : 12,
              fill: "#64748b" // Using a slate color that works well in both light/dark themes
            }}
          />
          
          {/* User data line */}
          <Radar
            name={userName}
            dataKey={userName}
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.3}
          />
          
          {/* Other user data line */}
          <Radar
            name={otherUserName}
            dataKey={otherUserName}
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.3}
          />
          
          <Legend wrapperStyle={{ fontSize: chartWidth < 350 ? '0.75rem' : '0.875rem' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}