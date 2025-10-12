// C:\Users\aliak\Desktop\Док-оборот\docmanageapp\server\src\index.ts

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// РЕГИСТРАЦІЯ
app.post("/auth/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });
    const defaultRole = await prisma.role.findFirst({ where: { name: 'Reviewer' } });
    const defaultDepartment = await prisma.department.findFirst({ where: { name: 'Bosh apparat' } });
    if (!defaultRole || !defaultDepartment) {
        return res.status(500).json({ error: "Default role or department not found. Please seed the database." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        email, name, password: hashed,
        roleId: defaultRole.id,
        departmentId: defaultDepartment.id,
      },
      select: { id: true, email: true, name: true },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ЛОГІН
app.post("/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password required" });
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true, department: true },
        });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({
            user: {
                id: user.id, email: user.email, name: user.name,
                role: user.role.name,
                department: user.department.name,
            },
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Middleware для перевірки JWT токена
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    (req as any).user = user;
    next();
  });
};

// --- API ДЛЯ КЕРУВАННЯ КОРИСТУВАЧАМИ ---
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true, department: true },
      orderBy: { id: 'asc' }
    });
    const formattedUsers = users.map(u => ({
        id: u.id, name: u.name, email: u.email,
        role: u.role.name, department: u.department.name, managerId: u.managerId
    }));
    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/users", authenticateToken, async (req, res) => {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role || !department) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        const departmentRecord = await prisma.department.findUnique({ where: { name: department } });
        if (!roleRecord || !departmentRecord) return res.status(400).json({ error: "Invalid role or department" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, roleId: roleRecord.id, departmentId: departmentRecord.id },
        });
        res.status(201).json(newUser);
    } catch(e) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.put("/api/users/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, email, role, department } = req.body;
    try {
        const roleRecord = await prisma.role.findUnique({ where: { name: role } });
        const departmentRecord = await prisma.department.findUnique({ where: { name: department } });
        if (!roleRecord || !departmentRecord) return res.status(400).json({ error: "Invalid role or department" });

        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { name, email, roleId: roleRecord.id, departmentId: departmentRecord.id },
        });
        res.json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

app.delete("/api/users/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// --- API ДЛЯ КЕРУВАННЯ РОЛЯМИ ---
app.get("/api/roles", authenticateToken, async (req, res) => {
    try {
        const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
        res.json(roles);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/roles", authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    try {
        const newRole = await prisma.role.create({ data: { name, description } });
        res.status(201).json(newRole);
    } catch (e) {
        res.status(500).json({ error: "Failed to create role" });
    }
});

app.put("/api/roles/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    try {
        const updatedRole = await prisma.role.update({
            where: { id: Number(id) },
            data: { description },
        });
        res.json(updatedRole);
    } catch (e) {
        res.status(500).json({ error: "Failed to update role" });
    }
});

app.delete("/api/roles/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const usersWithRole = await prisma.user.count({ where: { roleId: Number(id) } });
        if (usersWithRole > 0) {
            return res.status(400).json({ error: "Cannot delete role. It is currently assigned to one or more users." });
        }
        await prisma.role.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (e) {
        res.status(500).json({ error: "Failed to delete role" });
    }
});

// --- API ДЛЯ ОТРИМАННЯ ДЕПАРТАМЕНТІВ ---
app.get("/api/departments", authenticateToken, async (req, res) => {
    try {
        const departments = await prisma.department.findMany({ orderBy: { id: 'asc' } });
        res.json(departments);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- API ДЛЯ КЕРУВАННЯ ПОРУШЕННЯМИ (VIOLATIONS) ---
app.get("/api/violations", authenticateToken, async (req, res) => {
    try {
        const violations = await prisma.violation.findMany({
            orderBy: { date: 'desc' },
            include: {
                user: { select: { id: true, name: true } },
                correspondence: { select: { id: true, title: true } }
            }
        });
        res.json(violations);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error while fetching violations" });
    }
});

app.post("/api/violations", authenticateToken, async (req, res) => {
    try {
        const { userId, reason, type, date, correspondenceId } = req.body;
        if (!userId || !reason || !type || !date) {
            return res.status(400).json({ error: "userId, reason, type, and date are required" });
        }
        const dataToCreate: any = {
            reason, type,
            date: new Date(date),
            userId: Number(userId),
        };
        if (correspondenceId) {
            dataToCreate.correspondenceId = Number(correspondenceId);
        }
        const newViolation = await prisma.violation.create({
            data: dataToCreate,
        });
        res.status(201).json(newViolation);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create violation" });
    }
});


// --- API ДЛЯ ДОКУМЕНТІВ (CORRESPONDENCES) ---

const documentInclude = {
    author: { select: { id: true, name: true } },
    mainExecutor: { select: { id: true, name: true, department: { select: { name: true } } } },
    internalAssignee: { select: { id: true, name: true } },
    coExecutors: { // Добавлено для соисполнителей
        select: { user: { select: { id: true, name: true } } }
    },
    contributors: { // Добавлено для участников
        select: { user: { select: { id: true, name: true } } }
    },
    reviewers: {
        orderBy: { updatedAt: 'desc' },
        select: {
            status: true,
            comment: true,
            user: { select: { id: true, name: true } }
        }
    }
} satisfies Prisma.DocumentInclude;

// GET /api/correspondences (СПИСОК ДОКУМЕНТІВ)
app.get("/api/correspondences", authenticateToken, async (req, res) => {
    try {
        const userId = (req as any).user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true, department: true }
        });

        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }

        let whereClause: Prisma.DocumentWhereInput = {};
        
        // Базова умова для будь-якого користувача: він бачить документ, якщо він є очікуючим узгоджувачем.
        const reviewCondition = { reviewers: { some: { userId: user.id, status: 'PENDING' } } };

        switch (user.role.name) {
            case 'Admin':
            case 'Bank apparati':
                whereClause = {}; // Бачать все
                break;
            case 'Boshqaruv':
                // Бачить документи на своїх етапах І ті, що очікують його узгодження
                whereClause = {
                    OR: [
                        { stage: { in: ['ASSIGNMENT', 'SIGNATURE', 'RESOLUTION'] } },
                        reviewCondition
                    ]
                };
                break;
            case 'Yordamchi':
                // Бачить документи на етапі резолюції І ті, що очікують його узгодження
                whereClause = {
                    OR: [
                        { stage: 'RESOLUTION' },
                        reviewCondition
                    ]
                };
                break;
            case 'Tarmoq':
                // Глава відділу бачить документи свого відділу І ті, що очікують його узгодження
                whereClause = {
                    OR: [
                        { mainExecutor: { departmentId: user.departmentId } },
                        reviewCondition
                    ]
                };
                break;
            case 'Reviewer':
                // Рядовий співробітник бачить призначені йому завдання І ті, що очікують його узгодження
                whereClause = {
                    OR: [
                        { internalAssigneeId: user.id },
                        reviewCondition
                    ]
                };
                break;
            default:
                // Інші ролі бачать тільки ті документи, де вони є узгоджувачами
                whereClause = reviewCondition;
                break;
        }

        const documents = await prisma.document.findMany({
            where: whereClause,
            include: documentInclude,
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error while fetching documents" });
    }
});

app.get("/api/correspondences/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const document = await prisma.document.findUnique({
            where: { id: Number(id) },
            include: documentInclude,
        });
        if (!document) return res.status(404).json({ error: "Document not found" });
        res.json(document);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/correspondences/incoming", authenticateToken, async (req, res) => {
    const { title, content, source, kartoteka } = req.body;
    const authorId = (req as any).user.userId; 

    if (!title || !content || !source) {
        return res.status(400).json({ error: "Title, content, and source are required" });
    }

    try {
        const newDocument = await prisma.document.create({
            data: {
                title, content, source, authorId, kartoteka,
                type: 'Kiruvchi',
                stage: 'PENDING_REGISTRATION',
            }
        });
        res.status(201).json(newDocument);
    } catch (e) {
        res.status(500).json({ error: "Failed to create document" });
    }
});

app.post("/api/correspondences/outgoing", authenticateToken, async (req, res) => {
    const { title, content, kartoteka } = req.body;
    const authorId = (req as any).user.userId;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const newDocument = await prisma.document.create({
            data: {
                title,
                content,
                authorId,
                kartoteka,
                type: 'Chiquvchi',
                stage: 'DRAFTING',
                source: 'Bank ichki tizimi'
            }
        });
        res.status(201).json(newDocument);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create outgoing document" });
    }
});

// --- ЕНДПОІНТИ ДЛЯ ЖИТТЄВОГО ЦИКЛУ ДОКУМЕНТА ---
app.post("/api/correspondences/:id/submit-review", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const documentId = Number(id);

    try {
        const requiredReviewers = await prisma.user.findMany({
            where: {
                OR: [
                    { role: { name: 'Bank apparati' } },
                    { department: { name: 'Yuridik Departament' } },
                    { department: { name: 'Komplayens nazorat' } },
                ]
            }
        });

        if (requiredReviewers.length === 0) {
            return res.status(404).json({ error: "Required reviewers not found. Please seed the database." });
        }

        await prisma.documentReviewer.createMany({
            data: requiredReviewers.map(reviewer => ({
                documentId: documentId,
                userId: reviewer.id,
                status: 'PENDING'
            })),
            skipDuplicates: true
        });

        await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'FINAL_REVIEW' }
        });
        
        const finalDocument = await prisma.document.findUnique({
            where: { id: documentId },
            include: documentInclude,
        });
        res.json(finalDocument);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to submit for review." });
    }
});

app.post("/api/correspondences/:id/approve-review", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const documentId = Number(id);
    const userId = (req as any).user.userId;

    try {
        const updatedReview = await prisma.documentReviewer.update({
            where: {
                documentId_userId: { documentId, userId }
            },
            data: { status: 'APPROVED' }
        });

        if (!updatedReview) {
            return res.status(404).json({ error: "Reviewer entry not found for this user and document." });
        }

        const pendingReviews = await prisma.documentReviewer.count({
            where: { documentId, status: 'PENDING' }
        });

        if (pendingReviews === 0) {
            await prisma.document.update({
                where: { id: documentId },
                data: { stage: 'SIGNATURE' }
            });
            const finalDocument = await prisma.document.findUnique({
                where: { id: documentId },
                include: documentInclude,
            });
            return res.json(finalDocument);
        }

        res.status(200).json({ message: "Review approved successfully." });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to approve review." });
    }
});

app.post("/api/correspondences/:id/reject-review", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    const documentId = Number(id);
    const userId = (req as any).user.userId;

    try {
        await prisma.documentReviewer.update({
            where: {
                documentId_userId: { documentId, userId }
            },
            data: { 
                status: 'REJECTED',
                comment: comment || 'Без коментаря'
            }
        });

        await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'REVISION_REQUESTED' }
        });
        
        const finalDocument = await prisma.document.findUnique({
            where: { id: documentId },
            include: documentInclude,
        });

        res.json(finalDocument);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to reject review." });
    }
});

app.put("/api/correspondences/:id/stage", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { stage } = req.body; 

    if (!stage) {
        return res.status(400).json({ error: "New stage is required" });
    }

    try {
        const updatedDocument = await prisma.document.update({
            where: { id: Number(id) },
            data: { stage: stage }, 
        });
        res.json(updatedDocument);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update document stage. Invalid stage value provided." });
    }
});

app.post("/api/correspondences/:id/assign", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { mainExecutorId } = req.body;

    if (!mainExecutorId) {
        return res.status(400).json({ error: "mainExecutorId is required" });
    }

    try {
        const updatedDocument = await prisma.document.update({
            where: { id: Number(id) },
            data: {
                mainExecutorId: Number(mainExecutorId),
                stage: 'EXECUTION',
            },
            include: documentInclude,
        });
        res.json(updatedDocument);
    } catch (e) {
        res.status(500).json({ error: "Failed to assign executor" });
    }
});

app.post("/api/correspondences/:id/delegate", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { internalAssigneeId } = req.body;

    if (!internalAssigneeId) {
        return res.status(400).json({ error: "internalAssigneeId is required" });
    }

    try {
        const updatedDocument = await prisma.document.update({
            where: { id: Number(id) },
            data: {
                internalAssigneeId: Number(internalAssigneeId),
            },
            include: documentInclude,
        });
        res.json(updatedDocument);
    } catch (e) {
        res.status(500).json({ error: "Failed to delegate task" });
    }
});

app.post("/api/correspondences/:id/sign", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const documentId = Number(id);
    const userId = (req as any).user.userId;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true }});
        if (user?.role.name !== 'Boshqaruv') {
            return res.status(403).json({ error: "You do not have permission to sign documents." });
        }

        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (document?.stage !== 'SIGNATURE') {
            return res.status(400).json({ error: `Document is not in SIGNATURE stage, but in ${document?.stage}` });
        }

        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'DISPATCH' },
            include: documentInclude,
        });

        res.json(updatedDocument);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to sign the document." });
    }
});

app.post("/api/correspondences/:id/dispatch", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const documentId = Number(id);
    const userId = (req as any).user.userId;

    try {
        // Перевіряємо, що у користувача є права (роль Bank apparati)
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true }});
        if (user?.role.name !== 'Bank apparati') {
            return res.status(403).json({ error: "You do not have permission to dispatch documents." });
        }

        // Знаходимо документ і перевіряємо, що він на правильному етапі
        const document = await prisma.document.findUnique({ where: { id: documentId } });
        if (document?.stage !== 'DISPATCH') {
            return res.status(400).json({ error: `Document is not in DISPATCH stage, but in ${document?.stage}` });
        }

        // Оновлюємо етап документа на COMPLETED (Завершено)
        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: { stage: 'COMPLETED' },
            include: documentInclude,
        });

        res.json(updatedDocument);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to dispatch the document." });
    }
});

// --- START: НОВИЙ ЕНДПОІНТ ДЛЯ ОНОВЛЕННЯ ДЕДЛАЙНУ ---
app.put("/api/correspondences/:id/deadline", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { deadline, stageDeadline } = req.body;

    if (!deadline && !stageDeadline) {
        return res.status(400).json({ error: "At least one deadline field is required" });
    }

    try {
        const dataToUpdate: any = {};
        if (deadline) dataToUpdate.deadline = new Date(deadline);
        if (stageDeadline) dataToUpdate.stageDeadline = new Date(stageDeadline);

        const updatedDocument = await prisma.document.update({
            where: { id: Number(id) },
            data: dataToUpdate,
            include: documentInclude,
        });

        res.json(updatedDocument);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update deadline." });
    }
});
// --- END: НОВИЙ ЕНДПОІНТ ---


// --- START: НОВИЙ ЕНДПОІНТ ДЛЯ ОНОВЛЕННЯ ВСІХ ВИКОНАВЦІВ ---
app.put("/api/correspondences/:id/executors", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const documentId = Number(id);
    const { mainExecutorId, coExecutorIds, contributorIds } = req.body; // Отримуємо ID всіх типів виконавців

    try {
        // Використовуємо транзакцію, щоб всі зміни застосувалися разом або жодна з них
        const transaction = await prisma.$transaction(async (tx) => {
            // 1. Оновлюємо основного виконавця, якщо він переданий
            if (mainExecutorId) {
                await tx.document.update({
                    where: { id: documentId },
                    data: { mainExecutorId: Number(mainExecutorId) }
                });
            }

            // 2. Оновлюємо співвиконавців (спочатку видаляємо старих, потім додаємо нових)
            if (Array.isArray(coExecutorIds)) {
                await tx.documentCoExecutor.deleteMany({ where: { documentId } });
                if (coExecutorIds.length > 0) {
                    await tx.documentCoExecutor.createMany({
                        data: coExecutorIds.map((userId: number) => ({ documentId, userId }))
                    });
                }
            }

            // 3. Оновлюємо учасників (аналогічно співвиконавцям)
            if (Array.isArray(contributorIds)) {
                await tx.documentContributor.deleteMany({ where: { documentId } });
                if (contributorIds.length > 0) {
                    await tx.documentContributor.createMany({
                        data: contributorIds.map((userId: number) => ({ documentId, userId }))
                    });
                }
            }

            // Повертаємо оновлений документ з усіма даними
            return tx.document.findUnique({
                where: { id: documentId },
                include: documentInclude,
            });
        });

        res.json(transaction);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update executors." });
    }
});
// --- END: НОВИЙ ЕНДПОІНТ ---


// --- ЗАПУСК СЕРВЕРА ---
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));