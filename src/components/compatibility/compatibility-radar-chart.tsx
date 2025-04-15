import { useEffect, useState } from 'react';
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
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Transform the data into the format needed for Recharts
    const transformedData = Object.keys(userData).map(key => {
      // Convert camelCase to Title Case with spaces
      const name = key.charAt(0).toUpperCase() + 
                  key.slice(1).replace(/([A-Z])/g, ' $1');
      
      return {
        subject: name,
        [userName]: userData[key],
        [otherUserName]: otherUserData[key],
        fullMark: 100
      };
    });
    
    setChartData(transformedData);
  }, [userData, otherUserData, userName, otherUserName]);

  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          
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
          
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}