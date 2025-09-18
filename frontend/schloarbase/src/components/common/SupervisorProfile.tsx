import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { SupervisorAccount } from '../../types';

interface SupervisorProfileProps {
  supervisor?: SupervisorAccount;
  compact?: boolean;
}

const SupervisorProfile: React.FC<SupervisorProfileProps> = ({ supervisor, compact = false }) => {
  if (!supervisor) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg font-medium">No Supervisor Assigned</p>
            <p className="text-sm">A supervisor will be assigned to you soon.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Supervisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {supervisor.profile_picture ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={supervisor.profile_picture}
                  alt={supervisor.name}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-lg font-medium text-white">
                    {supervisor.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {supervisor.name}
                </h3>
                {supervisor.position && (
                  <Badge variant="secondary" className="text-xs">
                    {supervisor.position}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {supervisor.department}
              </p>
              {supervisor.specialization && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {supervisor.specialization}
                </p>
              )}
              {supervisor.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {supervisor.email}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Supervisor Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {supervisor.profile_picture ? (
              <img
                className="h-20 w-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                src={supervisor.profile_picture}
                alt={supervisor.name}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                <span className="text-2xl font-medium text-white">
                  {supervisor.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {supervisor.name}
              </h3>
              {supervisor.position && (
                <Badge variant="outline" className="text-sm">
                  {supervisor.position}
                </Badge>
              )}
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {supervisor.department}
            </p>
            {supervisor.specialization && (
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                Specialization: {supervisor.specialization}
              </p>
            )}
            {supervisor.faculty && (
              <p className="text-gray-600 dark:text-gray-400">
                Faculty: {supervisor.faculty}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h4>
            {supervisor.email && (
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{supervisor.email}</span>
              </div>
            )}
            {supervisor.phone_number && (
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{supervisor.phone_number}</span>
              </div>
            )}
            {supervisor.office_address && (
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-400">{supervisor.office_address}</span>
              </div>
            )}
          </div>

          {/* Office Hours */}
          {supervisor.office_hours && Object.keys(supervisor.office_hours).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Office Hours</h4>
              <div className="space-y-2">
                {Object.entries(supervisor.office_hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {day}:
                    </span>
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {supervisor.bio && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">About</h4>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {supervisor.bio}
            </p>
          </div>
        )}

        {/* Projects Count */}
        {supervisor.supervised_projects && supervisor.supervised_projects.length > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Currently supervising {supervisor.supervised_projects.length} project{supervisor.supervised_projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupervisorProfile;