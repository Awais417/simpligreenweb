export type Role = 'admin' | 'manager' | 'installer' | 'qa';

export interface InstallerType {
  id: string;
  name: string;
  requiresCertificate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  installerTypeId: string | null;
  installerType?: InstallerType | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'locked' | 'pending' | 'submitted' | 'approved' | 'rejected';
export type JobStatus = 'pending' | 'in_progress' | 'submitted_to_qa' | 'approved' | 'rejected';
export type MediaType = 'image' | 'certificate';

export interface TaskMedia {
  id: string;
  taskId: string;
  filePath: string;
  fileType: MediaType;
  uploadedAt: string;
}

export interface TaskInstaller {
  id: string;
  name: string;
  installerType?: InstallerType | null;
}

export interface Task {
  id: string;
  jobId: string;
  sequenceNumber: number;
  installerId: string;
  description: string;
  status: TaskStatus;
  managerComments: string | null;
  createdAt: string;
  updatedAt: string;
  installer?: TaskInstaller;
  media?: TaskMedia[];
  job?: { id: string; title: string; status?: JobStatus };
}

export interface QaReview {
  id: string;
  jobId: string;
  qaId: string;
  decision: 'approved' | 'rejected';
  comments: string | null;
  createdAt: string;
}

export interface JobPerson {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  address: string | null;
  description: string | null;
  adminId: string;
  managerId: string;
  qaId: string;
  status: JobStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  admin?: JobPerson;
  manager?: JobPerson;
  qa?: JobPerson;
  tasks?: Task[];
  qaReviews?: QaReview[];
  _count?: { tasks: number };
}
