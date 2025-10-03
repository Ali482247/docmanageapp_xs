// docmanageapp/client/src/constants.ts

// Системные имена для логики
export enum UserRole {
  BankApparati = 'Bank apparati',
  Boshqaruv = 'Boshqaruv',
  Yordamchi = 'Yordamchi',
  Tarmoq = 'Tarmoq',
  Reviewer = 'Reviewer',
  Resepshn = 'Resepshn',
  BankKengashiKotibi = 'Bank Kengashi kotibi',
  KollegialOrganKotibi = 'Kollegial organ kotibi',
  Admin = 'Admin',
}

// Системные имена для логики, полностью на английском, как в Prisma схеме
export enum CorrespondenceStage {
    PENDING_REGISTRATION = 'PENDING_REGISTRATION',
    REGISTRATION = 'REGISTRATION',
    RESOLUTION = 'RESOLUTION',
    ASSIGNMENT = 'ASSIGNMENT',
    EXECUTION = 'EXECUTION',
    DRAFTING = 'DRAFTING',
    REVISION_REQUESTED = 'REVISION_REQUESTED',
    SIGNATURE = 'SIGNATURE',
    DISPATCH = 'DISPATCH',
    FINAL_REVIEW = 'FINAL_REVIEW',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED',
    ARCHIVED = 'ARCHIVED',
}

// --- Функции для отображения на узбекском языке ---

// Объект для перевода этапов
const stageDisplayNames: { [key: string]: string } = {
    'PENDING_REGISTRATION': 'Registratsiya kutilmoqda',
    'REGISTRATION': 'Registratsiya',
    'RESOLUTION': 'Rezolyutsiya',
    'ASSIGNMENT': 'Ijrochiga yo`naltirish',
    'EXECUTION': 'Ijro',
    'DRAFTING': 'Loyihalash',
    'REVISION_REQUESTED': 'Qayta ishlashga yuborildi',
    'SIGNATURE': 'Imzolash',
    'DISPATCH': 'Jo`natish',
    'FINAL_REVIEW': 'Yakuniy kelishuv',
    'COMPLETED': 'Yakunlangan',
    'REJECTED': 'Rad etilgan',
    'ON_HOLD': 'To`xtatilgan',
    'CANCELLED': 'Bekor qilingan',
    'ARCHIVED': 'Arxivlangan',
};

// Функция, которую вы будете использовать в компонентах для отображения
export const getStageDisplayName = (stage: string): string => {
    return stageDisplayNames[stage] || stage;
};