import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ProjectStatusChartProps {
  pending: number;
  approved: number;
  rejected: number;
}

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({
  pending,
  approved,
  rejected
}) => {
  const total = pending + approved + rejected;
  
  // Calculate percentages
  const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
  const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectedPercent = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Calculate angles for the pie chart (in degrees)
  const pendingAngle = total > 0 ? (pending / total) * 360 : 0;
  const approvedAngle = total > 0 ? (approved / total) * 360 : 0;
  const rejectedAngle = total > 0 ? (rejected / total) * 360 : 0;

  // Create SVG path for pie slices
  const createPath = (startAngle: number, endAngle: number, radius: number = 80) => {
    const centerX = 120;
    const centerY = 120;
    
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  let currentAngle = 0;
  const pendingPath = createPath(currentAngle, currentAngle + pendingAngle);
  currentAngle += pendingAngle;
  
  const approvedPath = createPath(currentAngle, currentAngle + approvedAngle);
  currentAngle += approvedAngle;
  
  const rejectedPath = createPath(currentAngle, currentAngle + rejectedAngle);

  return (
    <Card>
      <CardHeader className="pb-4 md:pb-6">
        <CardTitle className="text-lg md:text-xl">Project Status Distribution</CardTitle>
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
          Current status of all projects
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* SVG Pie Chart */}
          <div className="relative">
            <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
              {/* Pending slice */}
              {pending > 0 && (
                <path
                  d={pendingPath}
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
              )}
              
              {/* Approved slice */}
              {approved > 0 && (
                <path
                  d={approvedPath}
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
              )}
              
              {/* Rejected slice */}
              {rejected > 0 && (
                <path
                  d={rejectedPath}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity"
                />
              )}
              
              {/* Center circle for donut effect */}
              <circle
                cx="120"
                cy="120"
                r="40"
                fill="white"
                className="dark:fill-gray-800"
              />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Projects
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                PENDING {pendingPercent}%
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-600 dark:text-green-400 font-medium">
                APPROVED {approvedPercent}%
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-red-600 dark:text-red-400 font-medium">
                REJECTED {rejectedPercent}%
              </span>
            </div>
          </div>

          {/* Detailed breakdown */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="text-xs md:text-sm font-medium text-blue-600 dark:text-blue-400">
                {pending} projects
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Approved</span>
              <span className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400">
                {approved} projects
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Rejected</span>
              <span className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">
                {rejected} projects
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStatusChart;