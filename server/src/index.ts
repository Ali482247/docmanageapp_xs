import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// ... (весь код до секции API для документов остается без изменений)

// РЕГИСТРАЦИЯ
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

// ЛОГИН
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

// Middleware для проверки JWT токена
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

// --- API ДЛЯ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ ---
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

// --- API ДЛЯ УПРАВЛЕНИЯ РОЛЯМИ ---
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

// --- API ДЛЯ ПОЛУЧЕНИЯ ДЕПАРТАМЕНТОВ ---
app.get("/api/departments", authenticateToken, async (req, res) => {
    try {
        const departments = await prisma.department.findMany({ orderBy: { id: 'asc' } });
        res.json(departments);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});


// --- API ДЛЯ ДОКУМЕНТОВ (CORRESPONDENCES) ---
app.get("/api/correspondences", authenticateToken, async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            include: { author: true, mainExecutor: true, internalAssignee: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/api/correspondences/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const document = await prisma.document.findUnique({
            where: { id: Number(id) },
            include: { author: true, mainExecutor: true, internalAssignee: true },
        });

        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }
        res.json(document);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/api/correspondences/incoming", authenticateToken, async (req, res) => {
    const { title, content, source } = req.body;
    const authorId = (req as any).user.userId; 

    if (!title || !content || !source) {
        return res.status(400).json({ error: "Title, content, and source are required" });
    }

    try {
        const newDocument = await prisma.document.create({
            data: {
                title, content, source, authorId,
                type: 'Kiruvchi',
                stage: 'PENDING_REGISTRATION',
            }
        });
        res.status(201).json(newDocument);
    } catch (e) {
        res.status(500).json({ error: "Failed to create document" });
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
        // --- ИСПРАВЛЕНИЕ: Меняем этап на EXECUTION ---
        const updatedDocument = await prisma.document.update({
            where: { id: Number(id) },
            data: {
                mainExecutorId: Number(mainExecutorId),
                stage: 'EXECUTION', // <-- ВОТ ИЗМЕНЕНИЕ
            },
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
        });
        res.json(updatedDocument);
    } catch (e) {
        res.status(500).json({ error: "Failed to delegate task" });
    }
});


// --- ЗАПУСК СЕРВЕРА ---
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));