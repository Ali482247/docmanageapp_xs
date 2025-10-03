// docmanageapp/server/generate-users-sql.js
const bcrypt = require('bcryptjs');

const usersToCreate = [
  { name: 'Azizov A. (Admin)', email: 'admin@agrobank.uz', role: 'Admin', department: 'IT', password: 'admin_pass_2025' },
  { name: 'Karimov K. (Apparat)', email: 'apparat@agrobank.uz', role: 'Bank apparati', department: 'Bosh apparat', password: 'apparat_pass_2025' },
  { name: 'Valiyev V. (Boshqaruv)', email: 'board@agrobank.uz', role: 'Boshqaruv', department: 'Boshqaruv', password: 'board_pass_2025' },
  { name: 'Nazarov N. (Yordamchi)', email: 'assistant@agrobank.uz', role: 'Yordamchi', department: 'Boshqaruv', password: 'assistant_pass_2025' },
  { name: 'Tursunov T. (Kreditlash)', email: 'credit.head@agrobank.uz', role: 'Tarmoq', department: 'Kreditlash', password: 'credit_head_pass_2025' },
  { name: 'Murodov M. (Ijrochi)', email: 'credit.reviewer@agrobank.uz', role: 'Reviewer', department: 'Kreditlash', password: 'reviewer_pass_2025' },
  { name: 'Saidov S. (HR)', email: 'hr.head@agrobank.uz', role: 'Tarmoq', department: 'HR', password: 'hr_pass_2025' },
  { name: 'Usmonova U. (Yuridik)', email: 'legal.head@agrobank.uz', role: 'Tarmoq', department: 'Yuridik Departament', password: 'legal_pass_2025' },
  { name: 'Qosimov Q. (Komplayens)', email: 'compliance.head@agrobank.uz', role: 'Tarmoq', department: 'Komplayens nazorat', password: 'compliance_pass_2025' },
  { name: 'Jorayev J. (Resepshn)', email: 'reception@agrobank.uz', role: 'Resepshn', department: 'Bosh apparat', password: 'reception_pass_2025' },
  { name: 'Sultanova S. (Kengash Kotibi)', email: 'council.secretary@agrobank.uz', role: 'Bank Kengashi kotibi', department: 'Boshqaruv', password: 'council_pass_2025' },
  { name: 'Rahmatov R. (Kollegial Kotib)', email: 'collegial.secretary@agrobank.uz', role: 'Kollegial organ kotibi', department: 'Kreditlash', password: 'collegial_pass_2025' },
];

console.log('-- ## Фаза 1: Вставка Ролей ##');
console.log(`
INSERT INTO "Role" (name, description) VALUES
('Admin', 'Super user for system management'),
('Bank apparati', 'Handles document registration and dispatch'),
('Boshqaruv', 'Management, assigns executors and signs documents'),
('Yordamchi', 'Assistant to management, prepares resolutions'),
('Tarmoq', 'Department head or executor'),
('Reviewer', 'Employee-level executor/reviewer'),
('Resepshn', 'Handles citizen requests at reception'),
('Bank Kengashi kotibi', 'Secretary of the Bank Council'),
('Kollegial organ kotibi', 'Secretary of the Collegial Body');
`);

console.log('\n-- ## Фаза 2: Вставка Департаментов ##');
console.log(`
INSERT INTO "Department" (name) VALUES
('IT'), ('Bosh apparat'), ('Boshqaruv'), ('Kreditlash'),
('HR'), ('Yuridik Departament'), ('Komplayens nazorat');
`);

console.log('\n-- ## Фаза 3: Вставка Пользователей ##');
let userSql = 'INSERT INTO "User" (name, email, password, "roleId", "departmentId") VALUES\n';
usersToCreate.forEach((user, index) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);
  const isLast = index === usersToCreate.length - 1;
  userSql += `('${user.name}', '${user.email}', '${hash}', (SELECT id FROM "Role" WHERE name = '${user.role}'), (SELECT id FROM "Department" WHERE name = '${user.department}'))${isLast ? ';' : ','}\n`;
});
console.log(userSql);

console.log('\n-- ## Фаза 4: Установка Руководителей ##');
console.log(`
UPDATE "User" SET "managerId" = (SELECT id FROM "User" WHERE email = 'board@agrobank.uz') WHERE email = 'assistant@agrobank.uz';
UPDATE "User" SET "managerId" = (SELECT id FROM "User" WHERE email = 'credit.head@agrobank.uz') WHERE email = 'credit.reviewer@agrobank.uz';
`);