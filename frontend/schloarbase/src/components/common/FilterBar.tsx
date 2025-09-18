import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { type ProjectFilters, Tags } from '../../types';

interface FilterBarProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onClearFilters: () => void;
  showYearFilter?: boolean;
  showDepartmentFilter?: boolean;
  departments?: string[];
  years?: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  showYearFilter = true,
  showDepartmentFilter = false,
  departments = [],
  years = [],
}) => {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleYearChange = (year: string) => {
    onFiltersChange({ ...filters, year: year === 'all' ? '' : year });
  };

  const handleDepartmentChange = (department: string) => {
    onFiltersChange({ ...filters, department: department === 'all' ? '' : department });
  };

  const handleTagToggle = (tag: Tags) => {
    const currentTags = filters.tags || [];
    const tagExists = currentTags.includes(tag);
    
    const newTags = tagExists
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({ ...filters, tags: newTags });
  };

  const removeTag = (tag: Tags) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.filter(t => t !== tag);
    onFiltersChange({ ...filters, tags: newTags });
  };

  const hasActiveFilters = !!(
    filters.search ||
    filters.year ||
    filters.department ||
    (filters.tags && filters.tags.length > 0)
  );

  return (
    <div className="space-y-4 p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Main Filters Row */}
      <div className="flex flex-col sm:flex-row lg:flex-row gap-3 md:gap-4">
        {/* Search */}
        <div className="flex-1 order-1">
          <Input
            placeholder="Search by title or student name..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full text-sm md:text-base"
          />
        </div>

        {/* Year Filter */}
        {showYearFilter && (
          <div className="w-full sm:w-32 lg:w-36 order-2 sm:order-2">
            <Select
              value={filters.year || 'all'}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.length > 0 ? (
                  years.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Department Filter */}
        {showDepartmentFilter && (
          <div className="w-full sm:w-48 lg:w-52 order-3 sm:order-3">
            <Select
              value={filters.department || 'all'}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="text-sm md:text-base">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.length > 0 ? (
                  departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full sm:w-auto order-4 sm:order-4 text-sm md:text-base px-3 md:px-4"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tags Section */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by Tags:
        </div>
        
        {/* Available Tags */}
        <div className="flex flex-wrap gap-2">
          {Object.values(Tags).map((tag) => {
            const isSelected = filters.tags?.includes(tag) || false;
            return (
              <Badge
                key={tag}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>

        {/* Selected Tags */}
        {filters.tags && filters.tags.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Selected Tags:
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="pr-1"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 ml-1"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;