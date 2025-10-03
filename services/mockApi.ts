import { User, Correspondence, Department, Role, Violation } from '../types';
import { UserRole, CorrespondenceStage } from '../constants';

// FIX: Export MOCK_USERS to make it accessible in other files.
export let MOCK_USERS: User[] = [
  { id: 1, name: 'Azizov A. (Admin)', email: 'admin@agrobank.uz', role: UserRole.Admin, department: 'IT' },
  { id: 2, name: 'Karimov K. (Apparat)', email: 'apparat@agrobank.uz', role: UserRole.BankApparati, department: 'Bosh apparat' },
  { id: 3, name: 'Valiyev V. (Boshqaruv)', email: 'board@agrobank.uz', role: UserRole.Boshqaruv, department: 'Boshqaruv' },
  { id: 4, name: 'Nazarov N. (Yordamchi)', email: 'assistant@agrobank.uz', role: UserRole.Yordamchi, department: 'Boshqaruv', managerId: 3 },
  { id: 5, name: 'Tursunov T. (Kreditlash)', email: 'credit.head@agrobank.uz', role: UserRole.Tarmoq, department: 'Kreditlash' },
  { id: 6, name: 'Murodov M. (Ijrochi)', email: 'credit.reviewer@agrobank.uz', role: UserRole.Reviewer, department: 'Kreditlash', managerId: 5 },
  { id: 7, name: 'Saidov S. (HR)', email: 'hr.head@agrobank.uz', role: UserRole.Tarmoq, department: 'HR' },
  { id: 8, name: 'Usmonova U. (Yuridik)', email: 'legal.head@agrobank.uz', role: UserRole.Tarmoq, department: 'Yuridik Departament' },
  { id: 9, name: 'Qosimov Q. (Komplayens)', email: 'compliance.head@agrobank.uz', role: UserRole.Tarmoq, department: 'Komplayens nazorat' },
  { id: 10, name: 'Jorayev J. (Resepshn)', email: 'reception@agrobank.uz', role: UserRole.Resepshn, department: 'Bosh apparat'},
  { id: 11, name: 'Sultanova S. (Kengash Kotibi)', email: 'council.secretary@agrobank.uz', role: UserRole.BankKengashiKotibi, department: 'Boshqaruv'},
  { id: 12, name: 'Rahmatov R. (Kollegial Kotib)', email: 'collegial.secretary@agrobank.uz', role: UserRole.KollegialOrganKotibi, department: 'Kreditlash'},
];

export const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: 'Boshqaruv' },
    { id: 2, name: 'Kreditlash', parentId: 1 },
    { id: 3, name: 'HR', parentId: 1 },
    { id: 4, name: 'Yuridik Departament', parentId: 1 },
    { id: 5, name: 'Komplayens nazorat', parentId: 1 },
];

export let MOCK_ROLES: Role[] = Object.values(UserRole).map(roleName => ({
    id: roleName.toLowerCase().replace(' ', '_'),
    name: roleName,
    description: `System role for ${roleName}`
}));


export let MOCK_VIOLATIONS: Violation[] = [
    { id: 1, userId: 6, correspondenceId: 1, date: '2023-11-06T10:00:00Z', reason: 'Q3 moliyaviy hisoboti topshirish muddati o`tkazib yuborildi.', type: 'Ogohlantirish' },
    { id: 2, userId: 6, correspondenceId: 2, date: '2023-11-11T10:00:00Z', reason: 'Mijoz murojaatiga javob berish kechiktirildi.', type: 'Hayfsan' },
    { id: 3, userId: 6, date: '2024-01-10T10:00:00Z', reason: 'Yillik hisobotni kechiktirdi', type: 'Oylikning 30% ushlab qolish' },
];

const addHours = (date: Date, hours: number) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate.toISOString();
};

// FIX: Export MOCK_CORRESPONDENCES to allow it to be imported in other modules.
export let MOCK_CORRESPONDENCES: Correspondence[] = [
  {
    id: 1,
    type: 'Kiruvchi',
    title: 'Q3 Moliyaviy Hisoboti',
    content: 'Uchinchi chorak uchun batafsil moliyaviy hisobotni o`z ichiga olgan hujjat...',
    source: 'Tashqi API - financial-feeds.com',
    status: 'Yangi',
    stage: CorrespondenceStage.RESOLUTION,
    stageDeadline: addHours(new Date(), 2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deadline: addHours(new Date(), 24 * 10),
    department: '',
    metadata: { urgency: 'High', quarter: 'Q3' },
    kartoteka: 'Markaziy Bank',
    aiSuggestion: { 
        suggestedMainExecutorId: 5,
        reason: 'Moliyaviy tahlil Kreditlash departamenti vakolatiga kiradi.',
        sentiment: 'Neutral',
        riskFlag: 'Yuqori moliyaviy ma`lumotlar. Komplayens nazorati talab etiladi.'
    },
    auditLog: [{ timestamp: new Date().toISOString(), user: 'System', action: 'Hujjat qabul qilindi. Registratsiyadan o`tdi.' }],
  },
  {
    id: 2,
    type: 'Kiruvchi',
    title: 'Kredit arizasi - "Agro Biznes" MChJ',
    content: 'Mikrokredit olish uchun "Agro Biznes" MChJ tomonidan yuborilgan ariza...',
    source: 'Bank veb-sayti',
    status: 'Ijroga yuborildi',
    stage: CorrespondenceStage.EXECUTION,
    stageDeadline: addHours(new Date(), 24 * 5),
    mainExecutorId: 5, // Kreditlash
    coExecutorIds: [8], // Yuridik
    internalAssigneeId: 6,
    createdAt: '2023-10-25T14:30:00Z',
    updatedAt: '2023-10-25T15:00:00Z',
    deadline: addHours(new Date(), 24 * 15),
    assignedTo: MOCK_USERS.find(u => u.id === 6),
    department: 'Kreditlash',
    kartoteka: 'Murojaatlar',
    metadata: { loanAmount: 50000000, client: 'Agro Biznes MChJ' },
    auditLog: [
        { timestamp: '2023-10-25T14:30:00Z', user: 'System', action: 'Hujjat qabul qilindi' },
        { timestamp: '2023-10-25T15:00:00Z', user: 'Valiyev V. (Boshqaruv)', action: 'Ijrochilar tayinlandi' },
    ]
  },
  {
    id: 3,
    type: 'Chiquvchi',
    title: 'Markaziy Bankka Javob Xati',
    content: 'Markaziy Bankning 2024-yil 15-sentabrdagi so`roviga javoban...',
    source: 'Bank ichki tizimi',
    status: 'Ko`rib chiqilmoqda',
    stage: CorrespondenceStage.FINAL_REVIEW,
    stageDeadline: addHours(new Date(), 24 * 2),
    mainExecutorId: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deadline: addHours(new Date(), 24 * 3),
    department: 'Kreditlash',
    kartoteka: 'Markaziy Bank',
    metadata: {},
    reviewers: [
      { userId: 8, status: 'pending', department: 'Yuridik' },
      { userId: 9, status: 'pending', department: 'Komplayens' },
      { userId: 2, status: 'pending', department: 'Apparat' }
    ],
    auditLog: [
      { timestamp: new Date().toISOString(), user: 'Tursunov T. (Kreditlash)', action: 'Hujjat loyihasi tayyorlandi' },
      { timestamp: new Date().toISOString(), user: 'Tursunov T. (Kreditlash)', action: 'Yakuniy kelishuvga yuborildi' },
    ]
  },
  {
    id: 4,
    type: 'Kiruvchi',
    title: 'Yangi xodimlar uchun jihozlar so`rovi',
    content: 'HR departamentidan yangi ishga olingan 5 nafar xodim uchun kompyuter va mebel jihozlarini ajratish to`g`risida so`rov...',
    source: 'Ichki portal',
    status: 'Yangi',
    stage: CorrespondenceStage.PENDING_REGISTRATION,
    stageDeadline: addHours(new Date(), 2),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deadline: addHours(new Date(), 24 * 3),
    department: 'HR',
    metadata: { employeeCount: 5 },
    kartoteka: 'Xizmat yozishmalari',
    aiSuggestion: { 
        suggestedMainExecutorId: 7,
        reason: 'HR departamenti so`rovi',
        sentiment: 'Neutral',
    },
    auditLog: [{ timestamp: new Date().toISOString(), user: 'System', action: 'Hujjat qabul qilindi. Registratsiya kutilmoqda.' }],
  }
];

const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 300));

export const login = (email: string, _: string): Promise<User | undefined> => {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    return simulateDelay(user);
};

export const getCorrespondences = (user: User): Promise<Correspondence[]> => {
    let items: Correspondence[] = [];
    switch (user.role) {
        case UserRole.Admin:
            items = MOCK_CORRESPONDENCES;
            break;
        case UserRole.BankApparati:
            items = MOCK_CORRESPONDENCES;
            break;
        case UserRole.Boshqaruv:
             items = MOCK_CORRESPONDENCES.filter(c => 
                c.stage === CorrespondenceStage.ASSIGNMENT || 
                c.stage === CorrespondenceStage.SIGNATURE ||
                c.stage === CorrespondenceStage.RESOLUTION // Can also see what's coming up
            );
            break;
        case UserRole.Yordamchi:
            items = MOCK_CORRESPONDENCES.filter(c => c.stage === CorrespondenceStage.RESOLUTION);
            break;
        case UserRole.Tarmoq:
            const isHead = !MOCK_USERS.some(u => u.managerId === user.id);
            if (isHead) {
                // Department head sees all tasks for their department
                items = MOCK_CORRESPONDENCES.filter(c => 
                    c.department === user.department ||
                    MOCK_USERS.find(u => u.id === c.mainExecutorId)?.department === user.department
                );
            } else {
                // Regular employee sees only tasks assigned to them internally
                items = MOCK_CORRESPONDENCES.filter(c => c.internalAssigneeId === user.id);
            }
            break;
        case UserRole.Reviewer:
            items = MOCK_CORRESPONDENCES.filter(c => c.assignedTo?.id === user.id || c.internalAssigneeId === user.id);
            break;
        // Specialized roles see an empty list on the main dashboard
        case UserRole.Resepshn:
        case UserRole.BankKengashiKotibi:
        case UserRole.KollegialOrganKotibi:
            items = [];
            break;
    }
    return simulateDelay(items);
}

export const getCorrespondenceById = (id: number): Promise<Correspondence | undefined> => {
    const item = MOCK_CORRESPONDENCES.find(d => d.id === id);
    return simulateDelay(item);
}

export const createIncomingTask = (title: string, content: string, source: string, user: User): Promise<Correspondence> => {
    const newCorrespondence: Correspondence = {
        id: Math.max(...MOCK_CORRESPONDENCES.map(c => c.id)) + 1,
        type: 'Kiruvchi',
        title,
        content,
        source,
        stage: CorrespondenceStage.PENDING_REGISTRATION,
        stageDeadline: addHours(new Date(), 2),
        status: 'Yangi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: addHours(new Date(), 24 * 15),
        department: '',
        kartoteka: 'Murojaatlar',
        metadata: {},
        auditLog: [{ timestamp: new Date().toISOString(), user: user.name, action: `Yangi ${source} hujjati tizimga kiritildi.` }]
    };
    MOCK_CORRESPONDENCES = [newCorrespondence, ...MOCK_CORRESPONDENCES];
    return simulateDelay(newCorrespondence);
}

export const createCorrespondence = (title: string, content: string, user: User): Promise<Correspondence> => {
    const newCorrespondence: Correspondence = {
        id: Math.max(...MOCK_CORRESPONDENCES.map(c => c.id)) + 1,
        type: 'Chiquvchi',
        title,
        content,
        source: 'Bank ichki tizimi',
        stage: CorrespondenceStage.DRAFTING,
        stageDeadline: addHours(new Date(), 24 * 3), // 3 days for drafting
        status: 'Yangi',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deadline: addHours(new Date(), 24 * 7), // 7 days total
        department: user.department,
        mainExecutorId: user.id,
        kartoteka: 'Xizmat yozishmalari',
        metadata: {},
        auditLog: [{ timestamp: new Date().toISOString(), user: user.name, action: 'Chiquvchi hujjat yaratildi.' }]
    };
    MOCK_CORRESPONDENCES = [newCorrespondence, ...MOCK_CORRESPONDENCES];
    return simulateDelay(newCorrespondence);
};

export const advanceStage = (id: number, nextStage: CorrespondenceStage, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if(docIndex === -1) return Promise.reject('Hujjat topilmadi');
    
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const oldStage = oldDoc.stage;
    
    let deadlineHours = 24 * 5; // Default execution time
    if(nextStage === CorrespondenceStage.RESOLUTION) deadlineHours = 2;
    if(nextStage === CorrespondenceStage.ASSIGNMENT) deadlineHours = 3;
    if(nextStage === CorrespondenceStage.EXECUTION) deadlineHours = 2 + 24 * 5; // 2 hours for Tarmoq + execution
    if(nextStage === CorrespondenceStage.FINAL_REVIEW) deadlineHours = 24 * 2;
    if(nextStage === CorrespondenceStage.SIGNATURE) deadlineHours = 24 * 1;
    if(nextStage === CorrespondenceStage.DISPATCH) deadlineHours = 24 * 1;
    
    const newDoc: Correspondence = {
      ...oldDoc,
      stage: nextStage,
      updatedAt: new Date().toISOString(),
      stageDeadline: addHours(new Date(), deadlineHours),
      auditLog: [...oldDoc.auditLog, {
          timestamp: new Date().toISOString(),
          user: user.name,
          action: `Bosqich '${oldStage}' dan '${nextStage}' ga o'zgartirildi`
      }]
    };

    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}


export const assignExecutors = (id: number, mainExecutorId: number, coExecutorIds: number[], contributorIds: number[], user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    const mainExecutor = MOCK_USERS.find(u => u.id === mainExecutorId);

    if(docIndex !== -1 && mainExecutor) {
        const oldDoc = MOCK_CORRESPONDENCES[docIndex];
        const newDoc: Correspondence = {
          ...oldDoc,
          stage: CorrespondenceStage.EXECUTION,
          stageDeadline: addHours(new Date(), 2 + (24*5)), // 2 hours for Tarmoq to assign + 5 days execution
          mainExecutorId,
          coExecutorIds,
          contributorIds,
          department: mainExecutor.department,
          updatedAt: new Date().toISOString(),
          auditLog: [...oldDoc.auditLog, {
              timestamp: new Date().toISOString(),
              user: user.name,
              action: `Ijrochilar tayinlandi. Asosiy: ${mainExecutor.name}`
          }]
        };
        MOCK_CORRESPONDENCES[docIndex] = newDoc;
        return simulateDelay(newDoc);
    }
    return Promise.reject('Hujjat yoki foydalanuvchi topilmadi');
}

export const rejectTask = (id: number, reason: string, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');

    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const newDoc: Correspondence = {
      ...oldDoc,
      stage: CorrespondenceStage.RESOLUTION, // Route back to Assistant
      stageDeadline: addHours(new Date(), 2),
      mainExecutorId: undefined,
      coExecutorIds: [],
      contributorIds: [],
      auditLog: [...oldDoc.auditLog, {
          timestamp: new Date().toISOString(),
          user: user.name,
          action: 'Topshiriq rad etildi',
          details: reason
      }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const submitForReview = (id: number, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    
    const legalDeptHead = MOCK_USERS.find(u => u.department === 'Yuridik Departament');
    const complianceDeptHead = MOCK_USERS.find(u => u.department === 'Komplayens nazorat');
    const apparat = MOCK_USERS.find(u => u.role === UserRole.BankApparati);
    
    const newReviewers: Correspondence['reviewers'] = [];
    if(legalDeptHead) newReviewers.push({ userId: legalDeptHead.id, status: 'pending', department: 'Yuridik' });
    if(complianceDeptHead) newReviewers.push({ userId: complianceDeptHead.id, status: 'pending', department: 'Komplayens' });
    if(apparat) newReviewers.push({ userId: apparat.id, status: 'pending', department: 'Apparat' });
    
    const newDoc: Correspondence = {
        ...oldDoc,
        stage: CorrespondenceStage.FINAL_REVIEW,
        stageDeadline: addHours(new Date(), 48),
        reviewers: newReviewers,
        auditLog: [...oldDoc.auditLog, {
            timestamp: new Date().toISOString(),
            user: user.name,
            action: 'Yakuniy kelishuvga yuborildi'
        }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
};

export const approveReview = (id: number, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');

    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const reviewerIndex = oldDoc.reviewers?.findIndex(r => r.userId === user.id);
    if (!oldDoc.reviewers || typeof reviewerIndex !== 'number' || reviewerIndex === -1) {
        return Promise.reject("Siz ushbu hujjatni ko'rib chiquvchi emassiz.");
    }
    
    const newReviewers = [...oldDoc.reviewers];
    newReviewers[reviewerIndex] = { ...newReviewers[reviewerIndex], status: 'approved' };

    const newAuditLog = [...oldDoc.auditLog, {
        timestamp: new Date().toISOString(),
        user: user.name,
        action: `Kelishuv tasdiqlandi (${newReviewers[reviewerIndex].department})`
    }];

    let newStage = oldDoc.stage;
    let newStageDeadline = oldDoc.stageDeadline;

    const allApproved = newReviewers.every(r => r.status === 'approved');
    if (allApproved) {
        newStage = CorrespondenceStage.SIGNATURE;
        newStageDeadline = addHours(new Date(), 24);
        newAuditLog.push({
            timestamp: new Date().toISOString(),
            user: 'System',
            action: `Barcha kelishuvlar olindi. Imzolashga yuborildi.`
        });
    }

    const newDoc: Correspondence = {
        ...oldDoc,
        reviewers: newReviewers,
        auditLog: newAuditLog,
        stage: newStage,
        stageDeadline: newStageDeadline,
    };

    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
};


export const holdCorrespondence = (id: number, reason: string, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const newDoc: Correspondence = {
      ...oldDoc,
      stage: CorrespondenceStage.ON_HOLD,
      auditLog: [...oldDoc.auditLog, { timestamp: new Date().toISOString(), user: user.name, action: `Hujjat to'xtatildi`, details: reason }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const rerouteCorrespondence = (id: number, reason: string, recipient: string, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const newDoc: Correspondence = {
      ...oldDoc,
      stage: CorrespondenceStage.CANCELLED,
      auditLog: [...oldDoc.auditLog, { 
          timestamp: new Date().toISOString(), 
          user: user.name, 
          action: `Hujjat bekor qilindi (Qayta yo'naltirildi)`, 
          details: `Sabab: ${reason}. Yangi qabul qiluvchi: ${recipient}.` 
      }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const assignInternalEmployee = (id: number, employeeId: number, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const employee = MOCK_USERS.find(u => u.id === employeeId);
    const newDoc: Correspondence = {
      ...oldDoc,
      internalAssigneeId: employeeId,
      auditLog: [...oldDoc.auditLog, { timestamp: new Date().toISOString(), user: user.name, action: `Ichki ijrochi tayinlandi`, details: `Xodim: ${employee?.name}` }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const updateDeadline = (id: number, newDeadline: string, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const newDoc: Correspondence = {
      ...oldDoc,
      stageDeadline: newDeadline,
      auditLog: [...oldDoc.auditLog, { timestamp: new Date().toISOString(), user: user.name, action: `Muddati o'zgartirildi`, details: `Yangi muddat: ${new Date(newDeadline).toLocaleString()}` }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const forceChangeExecutors = (id: number, mainExecutorId: number, coExecutorIds: number[], contributorIds: number[], user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const mainExecutor = MOCK_USERS.find(u => u.id === mainExecutorId);
    const newDoc: Correspondence = {
      ...oldDoc,
      mainExecutorId,
      coExecutorIds,
      contributorIds,
      auditLog: [...oldDoc.auditLog, { timestamp: new Date().toISOString(), user: user.name, action: `Ijrochilar majburiy o'zgartirildi`, details: `Yangi asosiy ijrochi: ${mainExecutor?.name}` }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const cancelTask = (id: number, reason: string, user: User): Promise<Correspondence> => {
    const docIndex = MOCK_CORRESPONDENCES.findIndex(d => d.id === id);
    if (docIndex === -1) return Promise.reject('Hujjat topilmadi');
    const oldDoc = MOCK_CORRESPONDENCES[docIndex];
    const newDoc: Correspondence = {
      ...oldDoc,
      stage: CorrespondenceStage.CANCELLED,
      auditLog: [...oldDoc.auditLog, { timestamp: new Date().toISOString(), user: user.name, action: `Topshiriq bekor qilindi`, details: reason }]
    };
    MOCK_CORRESPONDENCES[docIndex] = newDoc;
    return simulateDelay(newDoc);
}

export const getUsers = (): Promise<User[]> => {
    return simulateDelay(MOCK_USERS);
};

export const getDepartments = (): Promise<Department[]> => {
    return simulateDelay(MOCK_DEPARTMENTS);
};

export const getRoles = (): Promise<Role[]> => {
    return simulateDelay(MOCK_ROLES);
}

export const getUserViolations = (userId: number): Promise<Violation[]> => {
    return simulateDelay(MOCK_VIOLATIONS.filter(v => v.userId === userId));
}

export const getAllViolations = (): Promise<Violation[]> => {
    return simulateDelay(MOCK_VIOLATIONS);
}

export const addUser = (user: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = {
        id: MOCK_USERS.length > 0 ? Math.max(...MOCK_USERS.map(u => u.id)) + 1 : 1,
        ...user,
    };
    MOCK_USERS = [...MOCK_USERS, newUser];
    return simulateDelay(newUser);
};

export const updateUser = (userId: number, updatedData: Partial<Omit<User, 'id'>>): Promise<User> => {
    const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...updatedData };
        return simulateDelay(MOCK_USERS[userIndex]);
    }
    return Promise.reject('User not found');
};

export const deleteUser = (userId: number): Promise<{ success: boolean }> => {
    const initialLength = MOCK_USERS.length;
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== userId);
    if (MOCK_USERS.length < initialLength) {
        return simulateDelay({ success: true });
    }
    return Promise.reject('User not found');
};

// Role Management
export const addRole = (role: Omit<Role, 'id'>): Promise<Role> => {
    const newRole: Role = {
        id: role.name.toLowerCase().replace(' ', '_') + `_${Date.now()}`,
        ...role,
    };
    MOCK_ROLES = [...MOCK_ROLES, newRole];
    return simulateDelay(newRole);
};

export const updateRole = (roleId: string, updatedData: Partial<Omit<Role, 'id'>>): Promise<Role> => {
    const roleIndex = MOCK_ROLES.findIndex(r => r.id === roleId);
    if (roleIndex !== -1) {
        MOCK_ROLES[roleIndex] = { ...MOCK_ROLES[roleIndex], ...updatedData };
        return simulateDelay(MOCK_ROLES[roleIndex]);
    }
    return Promise.reject('Role not found');
};

export const deleteRole = (roleId: string): Promise<{ success: boolean }> => {
    const role = MOCK_ROLES.find(r => r.id === roleId);
    if (!role) {
        return Promise.reject('Role not found');
    }
    // Check if any user has this role
    const isRoleInUse = MOCK_USERS.some(u => u.role === role.name);
    if (isRoleInUse) {
        return Promise.reject('Cannot delete role. It is currently assigned to one or more users.');
    }

    const initialLength = MOCK_ROLES.length;
    MOCK_ROLES = MOCK_ROLES.filter(r => r.id !== roleId);
    if (MOCK_ROLES.length < initialLength) {
        return simulateDelay({ success: true });
    }
    return Promise.reject('Role not found');
};