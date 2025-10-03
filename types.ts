import { CorrespondenceStage } from './constants';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // Now maps to new roles like 'Boshqaruv', 'Yordamchi', etc.
  department: string; // Represents 'Tarmoq'
  managerId?: number;
}

export interface Correspondence {
  id: number;
  type: 'Kiruvchi' | 'Chiquvchi';
  title: string;
  content: string;
  source: string;
  stage: CorrespondenceStage;
  stageDeadline: string;
  status: 'Yangi' | 'Ko`rib chiqilmoqda' | 'Ijroga yuborildi' | 'Tasdiqlangan' | 'Rad etilgan' | 'Arxivlangan' | 'Qo`lda ko`rib chiqish';
  createdAt: string;
  updatedAt: string;
  deadline: string;
  department: string; // 'Tarmoq'
  assignedTo?: User; // Specific employee if assigned by Tarmoq head
  internalAssigneeId?: number; // Employee within the department assigned by Tarmoq head
  mainExecutorId?: number; // Asosiy ijrochi
  coExecutorIds?: number[]; // Teng ijrochilar
  contributorIds?: number[]; // Ham ijrochilar
  reviewers?: { userId: number; status: 'pending' | 'approved' | 'rejected'; department: string; comment?: string }[];
  metadata: Record<string, any>;
  aiSuggestion?: {
    suggestedMainExecutorId: number;
    suggestedCoExecutorIds?: number[];
    reason: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    riskFlag?: string;
  };
  kartoteka: 'Prezident' | 'Vazirlar Mahkamasi' | 'Markaziy Bank' | 'Murojaatlar' | 'Xizmat yozishmalari' | 'Boshqa';
  auditLog: AuditLogEntry[];
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  details?: string;
  rejectionReason?: string;
}

export interface Department {
    id: number;
    name: string;
    parentId?: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Violation {
  id: number;
  userId: number;
  correspondenceId?: number;
  date: string;
  reason: string;
  type: 'Ogohlantirish' | 'Hayfsan' | 'Oylikning 30% ushlab qolish' | 'Oylikning 50% ushlab qolish' | 'Shartnomani bekor qilish';
}