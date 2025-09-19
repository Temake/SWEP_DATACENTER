// Enums matching backend - using const assertions for better TypeScript compatibility
export const Role = {
  STUDENT: "Student",
  SUPERVISOR: "Supervisor",
  ADMIN: "Admin"
} as const;

export type Role = typeof Role[keyof typeof Role];

export const Status = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review", 
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SUSPENDED: "Suspended"
} as const;

export type Status = typeof Status[keyof typeof Status];

export const Tags = {
  AI: "AI",
  WEB_DEV: "Web Development",
  DATA_SCIENCE: "Data Science",
  MOBILE_DEV: "Mobile Development",
  CYBER_SECURITY: "Cyber Security",
  CLOUD_COMPUTING: "Cloud Computing",
  GAME_DEV: "Game Development",
  DEVOPS: "DevOps",
  IOT: "Internet of Things (IoT)",
  BLOCKCHAIN: "Blockchain",
  SOFTWARE_TESTING: "Software Testing",
  UI_UX: "UI/UX Design",
  NETWORKING: "Networking",
  DATABASES: "Databases",
  EMBEDDED_SYSTEMS: "Embedded Systems",
  ANIMATION: "Animation",
  MACHINE_LEARNING: "Machine Learning",
  AR_VR: "AR/VR",
  BIG_DATA: "Big Data",
  ROBOTICS: "Robotics",
  OTHERS: "Others"
} as const;

export type Tags = typeof Tags[keyof typeof Tags];



// Base account interface
export interface BaseAccount {
  id: number;
  name: string;
  role: Role;
  email: string;
  position?:string
  email_verified: boolean;
  department: string;
  created_at: string;
  hashed_password:string;
}

// Student account interface
export interface StudentAccount extends BaseAccount {
  id:number;
  matric_no: string;
  year?: string;
  profile_picture?: string;
  supervisor_id?: number;
  supervisor?: SupervisorAccount;
  projects?: Project[];
}

// Supervisor account interface
export interface SupervisorAccount extends BaseAccount {
  faculty?: string;
  office_address?: string;
  phone_number?: string;
  position?: string;
  specialization?: string;
  profile_picture?: string;
  office_hours?: Record<string, string | number>;
  bio?: string;
  students?: StudentAccount[];
  supervised_projects?: Project[];
}


export interface AdminAccount extends BaseAccount {
  permissions?: string[];
}

// Project interface
export interface Project {
  id: number;
  title: string;
  year: string;
  description: string;
  problem_statement?: string;
  file_url?: string; // URL link to project files (GitHub, Drive, etc.)
  document_url?: string; // URL to uploaded documentation files
  status: Status;
  created_at: string;
  updated_at: string;
  student_id?: number;
  supervisor_id?: number;
  tags?: Tags[];
  student?: StudentAccount;
  supervisor?: SupervisorAccount;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  matric_no?: string; // For students
  department: string;
  faculty?: string; // For supervisors
  phone_number?: string; // For supervisors
}

export interface AuthResponse {
  access_token: string;
  detail?: string;
  token_type: string;
  user: StudentAccount | SupervisorAccount | AdminAccount;
}

// Project form types
export interface CreateProjectRequest {
  title: string;
  year: string;
  description: string;
  tags: Tags[];
  file_url?: string; 
  supervisor_id?: number;
  document?: File; // Actual file upload for documentation
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: number;
}

// Filter types
export interface ProjectFilters {
  tags?: Tags[];
  year?: string;
  status?: Status;
  department?: string;
  search?: string;
  sortBy?: 'recent' | 'oldest' | 'title' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  per_page?: number;
}

export interface StudentFilters {
  department?: string;
  year?: string;
  supervisor_id?: number | null;
  search?: string;
  page?: number;
  per_page?: number;
}

// Dashboard statistics
export interface DashboardStats {
  total_projects: number;
  pending_projects: number;
  approved_projects: number;
  rejected_projects: number;
  total_students: number;
  total_supervisors: number;
}

export interface SupervisorDashboardStats {
  total_students: number;
  total_projects: number;
  pending_projects: number;
  approved_projects: number;
  rejected_projects: number;
  recent_submissions: number;
}

export interface StudentWithProject {
  id: number;
  name: string;
  email: string;
  matric_no: string;
  year: string;
  department: string;
  role: Role;
  profile_picture?: string;
  supervisor_id?: number;
  supervisor?: SupervisorAccount;
  created_at: string;
  updated_at: string;
  project_count: number;
  latest_project?: {
    id: number;
    title: string;
    status: string;
    created_at: string;
  };
}

// User context type
export type User = StudentAccount | SupervisorAccount | AdminAccount;

// Navigation item type
export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  role?: Role[];
}