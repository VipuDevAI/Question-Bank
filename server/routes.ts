import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import mammoth from "mammoth";
import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, PageBreak, BorderStyle } from "docx";
import type { Attempt } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { schoolCode, email, password } = req.body;
      if (!schoolCode || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const result = await storage.authenticateUser(email, password, schoolCode);
      if (!result) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tenant routes
  app.get("/api/tenants", async (req, res) => {
    try {
      const tenants = await storage.getAllTenants();
      res.json(tenants);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenants", async (req, res) => {
    try {
      const existing = await storage.getTenantByCode(req.body.code);
      if (existing) {
        return res.status(400).json({ error: "School code already exists" });
      }
      const tenant = await storage.createTenant(req.body);
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tenants/:id", async (req, res) => {
    try {
      const tenant = await storage.updateTenant(req.params.id, req.body);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tenants/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTenant(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Tenant not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const users = await storage.getUsersByTenant(tenantId);
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/students", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const students = await storage.getStudentsByTenant(tenantId);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
        active: true,
      });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Question routes
  app.get("/api/questions", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const questions = await storage.getQuestionsByTenant(tenantId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      const question = await storage.createQuestion({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions/:id/approve", async (req, res) => {
    try {
      const question = await storage.approveQuestion(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/questions/:id", async (req, res) => {
    try {
      const question = await storage.updateQuestion(req.params.id, req.body);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/questions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuestion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chapter routes
  app.get("/api/chapters", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const chapters = await storage.getChaptersByTenant(tenantId);
      res.json(chapters);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chapters/:id/unlock", async (req, res) => {
    try {
      const chapter = await storage.unlockChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chapters/:id/lock", async (req, res) => {
    try {
      const chapter = await storage.lockChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chapters/:id/deadline", async (req, res) => {
    try {
      const { deadline } = req.body;
      const chapter = await storage.setChapterDeadline(req.params.id, new Date(deadline));
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chapters/:id/reveal", async (req, res) => {
    try {
      const chapter = await storage.revealChapterScores(req.params.id);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Practice routes
  app.post("/api/practice/start", async (req, res) => {
    try {
      const { subject, chapter } = req.body;
      const tenantId = "tenant-demo";
      const studentId = "user-student";
      
      const result = await storage.startPracticeSession(tenantId, studentId, subject, chapter);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/practice/submit", async (req, res) => {
    try {
      const { answers, questionIds } = req.body;
      const result = await storage.submitPractice(answers, questionIds);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mock exam routes
  app.get("/api/mock/available", async (req, res) => {
    try {
      const tenantId = "tenant-demo";
      const tests = await storage.getAvailableMockTests(tenantId);
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mock/start", async (req, res) => {
    try {
      const { testId } = req.body;
      const tenantId = "tenant-demo";
      const studentId = "user-student";
      
      const result = await storage.startExam(tenantId, testId, studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mock/submit", async (req, res) => {
    try {
      const { testId, answers } = req.body;
      const attempts = await storage.getAttemptsByStudent("user-student");
      const attempt = attempts.find(a => a.testId === testId && a.status === "in_progress");
      
      if (!attempt) {
        return res.status(404).json({ error: "No active attempt found" });
      }
      
      const result = await storage.submitExam(attempt.id, answers);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = req.query.userId as string || "user-student";
      const data = await storage.getReportData(userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/reports/pdf/:attemptId", async (req, res) => {
    try {
      const attempt = await storage.getAttempt(req.params.attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }

      const test = await storage.getTest(attempt.testId);
      const student = await storage.getUser(attempt.studentId);
      const questions = await storage.getQuestionsByIds(attempt.assignedQuestionIds || []);

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=report-${req.params.attemptId}.pdf`);
      doc.pipe(res);

      doc.fontSize(24).font("Helvetica-Bold").text("Question Bank", { align: "center" });
      doc.fontSize(18).text("Exam Report", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(12).font("Helvetica");
      doc.text(`Student: ${student?.name || "Unknown"}`);
      doc.text(`Test: ${test?.title || "Unknown"}`);
      doc.text(`Subject: ${test?.subject || "Unknown"}`);
      doc.text(`Date: ${attempt.submittedAt?.toLocaleDateString() || "N/A"}`);
      doc.moveDown();

      doc.fontSize(16).font("Helvetica-Bold").text("Results Summary");
      doc.fontSize(12).font("Helvetica");
      doc.text(`Score: ${attempt.score || 0} / ${attempt.totalMarks || 0}`);
      doc.text(`Percentage: ${Number(attempt.percentage || 0).toFixed(1)}%`);
      doc.moveDown(2);

      doc.fontSize(16).font("Helvetica-Bold").text("Question Details");
      doc.moveDown();

      let qNum = 1;
      for (const q of questions) {
        const userAnswer = attempt.answers?.[q.id] || "Not answered";
        const isCorrect = userAnswer.toLowerCase().trim() === (q.correctAnswer || "").toLowerCase().trim();

        doc.fontSize(11).font("Helvetica-Bold");
        doc.text(`Q${qNum}. ${q.content}`);
        doc.fontSize(10).font("Helvetica");
        doc.text(`Your Answer: ${userAnswer}`);
        doc.text(`Correct Answer: ${q.correctAnswer || "N/A"}`);
        doc.text(`Status: ${isCorrect ? "Correct" : "Incorrect"}`);
        doc.moveDown();
        qNum++;

        if (doc.y > 700) {
          doc.addPage();
        }
      }

      doc.moveDown(2);
      doc.fontSize(10).text("Powered by SmartGenEduX 2025", { align: "center" });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notifications
  app.post("/api/notifications/send", async (req, res) => {
    try {
      res.json({ success: true, message: "Notification sent" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tests routes
  app.get("/api/tests", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const tests = await storage.getTestsByTenant(tenantId);
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/generate", async (req, res) => {
    try {
      const test = await storage.createTest({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/activate", async (req, res) => {
    try {
      const test = await storage.activateTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/reveal-results", async (req, res) => {
    try {
      const test = await storage.revealTestResults(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Exam Engine Routes
  app.post("/api/exam/start", async (req, res) => {
    try {
      const { testId, studentId } = req.body;
      const tenantId = req.body.tenantId || "tenant-demo";
      const result = await storage.startExam(tenantId, testId, studentId || "user-student");
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/exam/save-state", async (req, res) => {
    try {
      const { attemptId, answers, questionStatuses, markedForReview, timeRemaining } = req.body;
      const result = await storage.saveExamState(attemptId, answers, questionStatuses, markedForReview, timeRemaining);
      if (!result) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/exam/submit", async (req, res) => {
    try {
      const { attemptId, answers } = req.body;
      const result = await storage.submitExam(attemptId, answers);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/exam/attempt/:id", async (req, res) => {
    try {
      const attempt = await storage.getAttempt(req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json(attempt);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/exam/active/:testId/:studentId", async (req, res) => {
    try {
      const attempt = await storage.getActiveAttempt(req.params.testId, req.params.studentId);
      res.json(attempt || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Exam Config Routes
  app.get("/api/config", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const config = await storage.getAllConfig(tenantId);
      res.json(config);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const { key, value, tenantId } = req.body;
      await storage.setConfig(tenantId || "tenant-demo", key, value);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Manual Marking Routes
  app.post("/api/marking/question", async (req, res) => {
    try {
      const { attemptId, questionId, score } = req.body;
      const result = await storage.markQuestion(attemptId, questionId, score);
      if (!result) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/marking/finalize", async (req, res) => {
    try {
      const { attemptId, remarks } = req.body;
      const result = await storage.finalizeMarking(attemptId, remarks);
      if (!result) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get attempts for marking
  app.get("/api/attempts/pending-marking", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const tests = await storage.getTestsByTenant(tenantId);
      const pendingAttempts = [];
      
      for (const test of tests) {
        const attempts = await storage.getAttemptsByTest(test.id);
        const pending = attempts.filter(a => a.status === "submitted");
        pendingAttempts.push(...pending.map(a => ({ ...a, testTitle: test.title, subject: test.subject })));
      }
      
      res.json(pendingAttempts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics Routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const timeRange = req.query.timeRange as string || "all";
      
      let daysBack = 0;
      switch (timeRange) {
        case "7d": daysBack = 7; break;
        case "30d": daysBack = 30; break;
        case "90d": daysBack = 90; break;
        default: daysBack = 0;
      }
      
      const analytics = await storage.getAnalytics(tenantId, daysBack);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CSV Export
  app.get("/api/export/results/:testId", async (req, res) => {
    try {
      const test = await storage.getTest(req.params.testId);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      
      const attempts = await storage.getAttemptsByTest(req.params.testId);
      const rows = ["Student ID,Student Name,Score,Total,Percentage,Status,Submitted At"];
      
      for (const attempt of attempts) {
        const user = await storage.getUser(attempt.studentId);
        rows.push([
          attempt.studentId,
          user?.name || "Unknown",
          attempt.score || 0,
          attempt.totalMarks || 0,
          attempt.percentage || 0,
          attempt.status,
          attempt.submittedAt?.toISOString() || ""
        ].join(","));
      }
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${test.title.replace(/\s+/g, "_")}_results.csv`);
      res.send(rows.join("\n"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/export/questions", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const questions = await storage.getQuestionsByTenant(tenantId);
      
      const rows = ["ID,Subject,Chapter,Topic,Type,Content,Correct Answer,Marks,Difficulty"];
      for (const q of questions) {
        rows.push([
          q.id,
          q.subject,
          q.chapter,
          q.topic || "",
          q.type,
          `"${q.content.replace(/"/g, '""')}"`,
          q.correctAnswer || "",
          q.marks || 1,
          q.difficulty || "medium"
        ].join(","));
      }
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=questions.csv");
      res.send(rows.join("\n"));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Uploads tracking
  app.get("/api/uploads", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const uploads = await storage.getUploadsByTenant(tenantId);
      res.json(uploads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/uploads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteUpload(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Upload not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk question creation
  app.post("/api/questions/bulk", async (req, res) => {
    try {
      const { questions, uploadId } = req.body;
      const tenantId = req.body.tenantId || "tenant-demo";
      
      const questionsWithTenant = questions.map((q: any) => ({
        ...q,
        tenantId,
        uploadId: uploadId || null,
      }));
      
      const created = await storage.createQuestions(questionsWithTenant);
      res.json({ success: true, count: created.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Passages
  app.get("/api/passages", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const passages = await storage.getPassagesByTenant(tenantId);
      res.json(passages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/passages", async (req, res) => {
    try {
      const passage = await storage.createPassage({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(passage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/passages/:id", async (req, res) => {
    try {
      const passage = await storage.getPassage(req.params.id);
      if (!passage) {
        return res.status(404).json({ error: "Passage not found" });
      }
      res.json(passage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get questions for a specific test (with passage info)
  app.get("/api/exam/questions/:attemptId", async (req, res) => {
    try {
      const attempt = await storage.getAttempt(req.params.attemptId);
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found" });
      }
      
      const questions = await storage.getQuestionsByIds(attempt.assignedQuestionIds || []);
      
      // Add passage content if needed
      const questionsWithPassages = await Promise.all(questions.map(async (q) => {
        if (q.passageId) {
          const passage = await storage.getPassage(q.passageId);
          return { ...q, passageText: passage?.content || null };
        }
        return { ...q, passageText: null };
      }));
      
      res.json(questionsWithPassages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Grades
  app.get("/api/grades/student/:studentId", async (req, res) => {
    try {
      const grades = await storage.getGradesByStudent(req.params.studentId);
      res.json(grades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/grades/test/:testId", async (req, res) => {
    try {
      const grades = await storage.getGradesByTest(req.params.testId);
      res.json(grades);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Word (.docx) upload for bulk question import
  app.post("/api/upload/word", upload.single("file"), async (req: Request, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const tenantId = req.body.tenantId || "tenant-demo";
      const subject = req.body.subject || "General";
      const chapter = req.body.chapter || "";
      const grade = req.body.grade || "10";

      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;

      const questions = parseQuestionsFromText(text, subject, chapter, grade, tenantId);

      if (questions.length === 0) {
        return res.status(400).json({ error: "No questions found in document" });
      }

      const uploadRecord = await storage.createUpload({
        tenantId,
        filename: req.file.originalname || "upload.docx",
        source: "word",
        subject,
        grade,
        questionCount: questions.length,
        uploadedBy: req.body.uploadedBy || null,
      });

      const questionsWithUpload = questions.map(q => ({
        ...q,
        uploadId: uploadRecord.id,
      }));

      const created = await storage.createQuestions(questionsWithUpload);

      res.json({
        success: true,
        uploadId: uploadRecord.id,
        questionsCreated: created.length,
        questions: created,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Google Sheets / CSV import endpoint
  app.post("/api/upload/csv", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const tenantId = req.body.tenantId || "tenant-demo";
      const subject = req.body.subject || "General";
      const chapter = req.body.chapter || "";
      const grade = req.body.grade || "10";

      const csvContent = req.file.buffer.toString("utf-8");
      const questions = parseCSVQuestions(csvContent, subject, chapter, grade, tenantId);

      if (questions.length === 0) {
        return res.status(400).json({ error: "No valid questions found in CSV" });
      }

      const uploadRecord = await storage.createUpload({
        tenantId,
        filename: req.file.originalname || "upload.csv",
        source: "google_sheets",
        subject,
        grade,
        questionCount: questions.length,
        uploadedBy: req.body.uploadedBy || null,
      });

      const questionsWithUpload = questions.map(q => ({
        ...q,
        uploadId: uploadRecord.id,
      }));

      const created = await storage.createQuestions(questionsWithUpload);

      res.json({
        success: true,
        uploadId: uploadRecord.id,
        questionsCreated: created.length,
        questions: created,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Google Sheets URL import (public sheets only)
  app.post("/api/upload/sheets", async (req, res) => {
    try {
      const { sheetUrl, tenantId = "tenant-demo", subject = "General", chapter = "", grade = "10" } = req.body;

      if (!sheetUrl) {
        return res.status(400).json({ error: "Sheet URL is required" });
      }

      // Extract sheet ID from URL
      const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        return res.status(400).json({ error: "Invalid Google Sheets URL" });
      }

      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      // Fetch the CSV content
      const response = await fetch(csvUrl);
      if (!response.ok) {
        return res.status(400).json({ error: "Could not fetch sheet. Make sure it's publicly accessible." });
      }

      const csvContent = await response.text();
      const questions = parseCSVQuestions(csvContent, subject, chapter, grade, tenantId);

      if (questions.length === 0) {
        return res.status(400).json({ error: "No valid questions found in sheet" });
      }

      const uploadRecord = await storage.createUpload({
        tenantId,
        filename: `sheets-${sheetId}.csv`,
        source: "google_sheets",
        subject,
        grade,
        questionCount: questions.length,
        uploadedBy: req.body.uploadedBy || null,
      });

      const questionsWithUpload = questions.map(q => ({
        ...q,
        uploadId: uploadRecord.id,
      }));

      const created = await storage.createQuestions(questionsWithUpload);

      res.json({
        success: true,
        uploadId: uploadRecord.id,
        questionsCreated: created.length,
        questions: created,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Register additional route modules
  registerBlueprintRoutes(app);
  registerActivityLogRoutes(app);
  registerWorkflowRoutes(app);
  registerPaperGenerationRoutes(app);

  return httpServer;
}

function parseQuestionsFromText(text: string, subject: string, chapter: string, grade: string, tenantId: string): any[] {
  const questions: any[] = [];
  const lines = text.split("\n").map(l => l.trim()).filter(l => l);

  let currentQuestion: any = null;
  let options: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const qMatch = line.match(/^(?:Q\d+[\.\):\s]|Question\s*\d*[\.\):\s]|\d+[\.\)]\s)/i);
    if (qMatch) {
      if (currentQuestion && currentQuestion.content) {
        currentQuestion.options = options.length > 0 ? options : null;
        currentQuestion.type = options.length >= 2 ? "mcq" : "short_answer";
        questions.push(currentQuestion);
      }

      currentQuestion = {
        tenantId,
        subject,
        chapter,
        grade,
        topic: null,
        content: line.replace(qMatch[0], "").trim(),
        type: "short_answer",
        options: null,
        correctAnswer: null,
        difficulty: "medium",
        marks: 1,
        pool: "assessment",
        status: "active",
        imageUrl: null,
        passageId: null,
        uploadId: null,
      };
      options = [];
      continue;
    }

    const optMatch = line.match(/^(?:[A-D][\.\):\s]|[a-d][\.\):\s]|i+[\.\):\s]|\(\d+\))/i);
    if (optMatch && currentQuestion) {
      options.push(line.replace(optMatch[0], "").trim());
      continue;
    }

    const ansMatch = line.match(/^(?:Answer|Ans|Correct Answer)[\s:]+(.+)/i);
    if (ansMatch && currentQuestion) {
      currentQuestion.correctAnswer = ansMatch[1].trim();
      continue;
    }

    if (currentQuestion && !line.match(/^(?:Marks|Points|Difficulty)/i)) {
      currentQuestion.content += " " + line;
    }
  }

  if (currentQuestion && currentQuestion.content) {
    currentQuestion.options = options.length > 0 ? options : null;
    currentQuestion.type = options.length >= 2 ? "mcq" : "short_answer";
    questions.push(currentQuestion);
  }

  return questions;
}

function parseCSVQuestions(csvContent: string, subject: string, chapter: string, grade: string, tenantId: string): any[] {
  const questions: any[] = [];
  
  // Parse CSV properly handling multi-line quoted fields
  const rows = parseCSVContent(csvContent);
  
  if (rows.length < 2) {
    return questions;
  }

  // Parse header row to identify columns
  const headers = rows[0].map(h => h.toLowerCase().trim());
  
  const colMap = {
    question: headers.findIndex(h => h.includes("question") || h.includes("content")),
    optionA: headers.findIndex(h => h === "a" || h.includes("option a") || h.includes("option_a")),
    optionB: headers.findIndex(h => h === "b" || h.includes("option b") || h.includes("option_b")),
    optionC: headers.findIndex(h => h === "c" || h.includes("option c") || h.includes("option_c")),
    optionD: headers.findIndex(h => h === "d" || h.includes("option d") || h.includes("option_d")),
    answer: headers.findIndex(h => h.includes("answer") || h.includes("correct")),
    type: headers.findIndex(h => h.includes("type")),
    difficulty: headers.findIndex(h => h.includes("difficulty") || h.includes("level")),
    marks: headers.findIndex(h => h.includes("mark") || h.includes("point") || h.includes("score")),
    topic: headers.findIndex(h => h.includes("topic")),
    chapter: headers.findIndex(h => h.includes("chapter")),
    subject: headers.findIndex(h => h.includes("subject")),
  };

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || row.every(cell => !cell.trim())) continue;

    const questionContent = colMap.question >= 0 ? row[colMap.question] : row[0];
    if (!questionContent || questionContent.trim() === "") continue;

    const options: string[] = [];
    if (colMap.optionA >= 0 && row[colMap.optionA]) options.push(row[colMap.optionA]);
    if (colMap.optionB >= 0 && row[colMap.optionB]) options.push(row[colMap.optionB]);
    if (colMap.optionC >= 0 && row[colMap.optionC]) options.push(row[colMap.optionC]);
    if (colMap.optionD >= 0 && row[colMap.optionD]) options.push(row[colMap.optionD]);

    const answer = colMap.answer >= 0 ? row[colMap.answer] : null;
    const questionType = options.length >= 2 ? "mcq" : (colMap.type >= 0 ? row[colMap.type] || "short_answer" : "short_answer");
    const difficulty = colMap.difficulty >= 0 ? row[colMap.difficulty] || "medium" : "medium";
    const marks = colMap.marks >= 0 ? parseInt(row[colMap.marks]) || 1 : 1;
    const rowTopic = colMap.topic >= 0 ? row[colMap.topic] : null;
    const rowChapter = colMap.chapter >= 0 ? row[colMap.chapter] || chapter : chapter;
    const rowSubject = colMap.subject >= 0 ? row[colMap.subject] || subject : subject;

    questions.push({
      tenantId,
      subject: rowSubject,
      chapter: rowChapter,
      grade,
      topic: rowTopic,
      content: questionContent.trim(),
      type: questionType.toLowerCase(),
      options: options.length > 0 ? options : null,
      correctAnswer: answer,
      difficulty: difficulty.toLowerCase(),
      marks,
      pool: "assessment",
      status: "active",
      imageUrl: null,
      passageId: null,
      uploadId: null,
    });
  }

  return questions;
}

// ========================
// BLUEPRINT ROUTES
// ========================
export function registerBlueprintRoutes(app: Express) {
  app.get("/api/blueprints", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const blueprints = await storage.getBlueprintsByTenant(tenantId);
      res.json(blueprints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/blueprints/:id", async (req, res) => {
    try {
      const blueprint = await storage.getBlueprint(req.params.id);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blueprints", async (req, res) => {
    try {
      const blueprint = await storage.createBlueprint({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/blueprints/:id", async (req, res) => {
    try {
      const blueprint = await storage.updateBlueprint(req.params.id, req.body);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blueprints/:id/approve", async (req, res) => {
    try {
      const { approvedBy } = req.body;
      const blueprint = await storage.approveBlueprint(req.params.id, approvedBy);
      if (!blueprint) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// ========================
// ACTIVITY LOG ROUTES
// ========================
export function registerActivityLogRoutes(app: Express) {
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId as string | undefined;
      const logs = await storage.getActivityLogs(tenantId, entityType, entityId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/activity-logs", async (req, res) => {
    try {
      const log = await storage.logActivity({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(log);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// ========================
// WORKFLOW ROUTES
// ========================
export function registerWorkflowRoutes(app: Express) {
  app.get("/api/tests/workflow/:state", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const states = req.params.state.split(",") as any[];
      const tests = await storage.getTestsByWorkflowState(tenantId, states);
      res.json(tests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/questions/pending", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const questions = await storage.getPendingQuestions(tenantId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/workflow", async (req, res) => {
    try {
      const { state, userId, comments } = req.body;
      const test = await storage.updateTestWorkflow(req.params.id, state, userId, comments);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/submit-to-hod", async (req, res) => {
    try {
      const { userId } = req.body;
      const test = await storage.updateTestWorkflow(req.params.id, "pending_hod", userId, "Submitted for HOD review");
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/hod-approve", async (req, res) => {
    try {
      const { userId, comments } = req.body;
      const test = await storage.updateTestWorkflow(req.params.id, "hod_approved", userId, comments);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/hod-reject", async (req, res) => {
    try {
      const { userId, comments } = req.body;
      if (!comments) {
        return res.status(400).json({ error: "Rejection comments are required" });
      }
      const test = await storage.updateTestWorkflow(req.params.id, "hod_rejected", userId, comments);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/submit-to-principal", async (req, res) => {
    try {
      const { userId } = req.body;
      const test = await storage.updateTestWorkflow(req.params.id, "pending_principal", userId, "Submitted for Principal approval");
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/principal-approve", async (req, res) => {
    try {
      const { userId, comments } = req.body;
      const test = await storage.updateTestWorkflow(req.params.id, "principal_approved", userId, comments);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/principal-reject", async (req, res) => {
    try {
      const { userId, comments } = req.body;
      if (!comments) {
        return res.status(400).json({ error: "Rejection comments are required" });
      }
      const test = await storage.updateTestWorkflow(req.params.id, "principal_rejected", userId, comments);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/send-to-committee", async (req, res) => {
    try {
      const test = await storage.sendTestToCommittee(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/lock", async (req, res) => {
    try {
      const test = await storage.lockTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/mark-confidential", async (req, res) => {
    try {
      const test = await storage.markTestConfidential(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tests/:id/printing-ready", async (req, res) => {
    try {
      const test = await storage.markPrintingReady(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }
      res.json(test);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions/:id/hod-approve", async (req, res) => {
    try {
      const { reviewerId, comments } = req.body;
      const question = await storage.approveQuestionByHOD(req.params.id, reviewerId, comments);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/questions/:id/hod-reject", async (req, res) => {
    try {
      const { reviewerId, comments } = req.body;
      if (!comments) {
        return res.status(400).json({ error: "Rejection comments are required" });
      }
      const question = await storage.rejectQuestionByHOD(req.params.id, reviewerId, comments);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

// ========================
// QUESTION PAPER GENERATION ROUTES
// ========================
export function registerPaperGenerationRoutes(app: Express) {
  app.post("/api/tests/:id/generate-paper", async (req, res) => {
    try {
      const { format } = req.body;
      const result = await storage.generateQuestionPaper(req.params.id, format || "A4");
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tests/:id/paper-pdf", async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      const questions = [];
      for (const qId of test.questionIds || []) {
        const q = await storage.getQuestion(qId);
        if (q) questions.push(q);
      }

      const doc = new PDFDocument({ size: req.query.format === "Legal" ? "LEGAL" : "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf"`);
      doc.pipe(res);

      doc.fontSize(16).font("Helvetica-Bold").text("Question Bank", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).text(test.title, { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(`Subject: ${test.subject} | Grade: ${test.grade} | Total Marks: ${test.totalMarks} | Duration: ${test.duration} min`, { align: "center" });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(11).text("Instructions:", { underline: true });
      doc.fontSize(10).text("1. Read all questions carefully before answering.");
      doc.text("2. Answers must be written neatly.");
      doc.text("3. No electronic devices allowed.");
      doc.moveDown();

      let questionNum = 1;
      for (const q of questions) {
        doc.fontSize(11).font("Helvetica-Bold").text(`Q${questionNum}. ${q.content}`, { continued: false });
        doc.font("Helvetica").fontSize(9).text(`[${q.marks} mark(s)] - ${q.difficulty}`, { align: "right" });
        
        if (q.type === "mcq" && q.options) {
          const opts = q.options as string[];
          opts.forEach((opt, i) => {
            doc.fontSize(10).text(`   ${String.fromCharCode(65 + i)}) ${opt}`);
          });
        }
        doc.moveDown();
        questionNum++;
      }

      doc.moveDown(2);
      doc.fontSize(8).text("--- End of Question Paper ---", { align: "center" });
      doc.moveDown();
      doc.text("Powered by SmartGenEduX 2025", { align: "center" });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tests/:id/answer-key-pdf", async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      const questions = [];
      for (const qId of test.questionIds || []) {
        const q = await storage.getQuestion(qId);
        if (q) questions.push(q);
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_answer_key.pdf"`);
      doc.pipe(res);

      doc.fontSize(16).font("Helvetica-Bold").text("ANSWER KEY - CONFIDENTIAL", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(14).text(test.title, { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica").text(`Subject: ${test.subject} | Grade: ${test.grade}`, { align: "center" });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown();

      let questionNum = 1;
      for (const q of questions) {
        doc.fontSize(10).font("Helvetica-Bold").text(`Q${questionNum}. `, { continued: true });
        doc.font("Helvetica").text(q.content.substring(0, 80) + (q.content.length > 80 ? "..." : ""));
        doc.fontSize(11).fillColor("green").text(`   Answer: ${q.correctAnswer || "N/A"}`);
        if (q.explanation) {
          doc.fontSize(9).fillColor("gray").text(`   Explanation: ${q.explanation}`);
        }
        doc.fillColor("black").moveDown(0.5);
        questionNum++;
      }

      doc.moveDown(2);
      doc.fontSize(8).text("--- End of Answer Key ---", { align: "center" });
      doc.moveDown();
      doc.text("CONFIDENTIAL - For Examiner Use Only", { align: "center" });
      doc.text("Powered by SmartGenEduX 2025", { align: "center" });

      doc.end();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ DOCX Export Routes ============
  app.get("/api/tests/:id/paper-docx", async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      const tenant = await storage.getTenant(test.tenantId);
      const questions = [];
      for (const qId of test.questionIds || []) {
        const q = await storage.getQuestion(qId);
        if (q) questions.push(q);
      }

      const schoolName = tenant?.name || "Question Bank";
      const schoolAddress = (tenant as any)?.address || "";

      const docChildren: any[] = [
        new Paragraph({
          text: schoolName,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: schoolAddress,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: test.title,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Subject: ${test.subject} | Grade: ${test.grade} | Total Marks: ${test.totalMarks} | Duration: ${test.duration} min`, size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
        new Paragraph({
          children: [new TextRun({ text: "Instructions:", bold: true })],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({ text: "1. Read all questions carefully before answering." }),
        new Paragraph({ text: "2. Answers must be written neatly." }),
        new Paragraph({ text: "3. No electronic devices allowed." }),
        new Paragraph({ text: "", spacing: { after: 300 } }),
      ];

      let questionNum = 1;
      for (const q of questions) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${questionNum}. ${q.content}`, bold: true }),
              new TextRun({ text: `  [${q.marks} mark(s)]`, italics: true }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        if (q.type === "mcq" && q.options) {
          const opts = q.options as string[];
          opts.forEach((opt, i) => {
            docChildren.push(
              new Paragraph({ text: `   ${String.fromCharCode(65 + i)}) ${opt}` })
            );
          });
        }

        docChildren.push(new Paragraph({ text: "", spacing: { after: 150 } }));
        questionNum++;
      }

      docChildren.push(
        new Paragraph({
          text: "--- End of Question Paper ---",
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
        new Paragraph({
          text: "Powered by SmartGenEduX 2025",
          alignment: AlignmentType.CENTER,
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          headers: {
            default: new Header({
              children: [new Paragraph({ text: schoolName, alignment: AlignmentType.CENTER })],
            }),
          },
          footers: {
            default: new Footer({
              children: [new Paragraph({ text: "Powered by SmartGenEduX 2025", alignment: AlignmentType.CENTER })],
            }),
          },
          children: docChildren,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_paper.docx"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tests/:id/answer-key-docx", async (req, res) => {
    try {
      const test = await storage.getTest(req.params.id);
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      const tenant = await storage.getTenant(test.tenantId);
      const questions = [];
      for (const qId of test.questionIds || []) {
        const q = await storage.getQuestion(qId);
        if (q) questions.push(q);
      }

      const schoolName = tenant?.name || "Question Bank";

      const docChildren: any[] = [
        new Paragraph({
          text: "ANSWER KEY - CONFIDENTIAL",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: test.title,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Subject: ${test.subject} | Grade: ${test.grade}`, size: 22 }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      ];

      let questionNum = 1;
      for (const q of questions) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${questionNum}. `, bold: true }),
              new TextRun({ text: q.content.substring(0, 100) + (q.content.length > 100 ? "..." : "") }),
            ],
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `   Answer: ${q.correctAnswer || "N/A"}`, bold: true, color: "228B22" }),
            ],
          })
        );

        if (q.explanation) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `   Explanation: ${q.explanation}`, italics: true, color: "666666" }),
              ],
            })
          );
        }
        questionNum++;
      }

      docChildren.push(
        new Paragraph({
          text: "--- End of Answer Key ---",
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
        }),
        new Paragraph({
          text: "CONFIDENTIAL - For Examiner Use Only",
          alignment: AlignmentType.CENTER,
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          headers: {
            default: new Header({
              children: [new Paragraph({ text: `${schoolName} - CONFIDENTIAL`, alignment: AlignmentType.CENTER })],
            }),
          },
          footers: {
            default: new Footer({
              children: [new Paragraph({ text: "Powered by SmartGenEduX 2025", alignment: AlignmentType.CENTER })],
            }),
          },
          children: docChildren,
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${test.title.replace(/[^a-zA-Z0-9]/g, '_')}_answer_key.docx"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CSV Export Routes ============
  app.get("/api/export/analytics-csv", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const attempts = await storage.getAllAttempts(tenantId);
      const users = await storage.getUsersByTenant(tenantId);
      const tests = await storage.getTestsByTenant(tenantId);

      const userMap = new Map(users.map(u => [u.id, u]));
      const testMap = new Map(tests.map(t => [t.id, t]));

      let csv = "Student Name,Student Email,Class,Section,Test Title,Subject,Score,Total Marks,Percentage,Date Completed\n";

      for (const attempt of attempts) {
        const student = userMap.get(attempt.studentId) as any;
        const test = testMap.get(attempt.testId);
        const att = attempt as any;
        if (student && test && att.completedAt) {
          const totalMarks = test.totalMarks || 0;
          const percentage = totalMarks > 0 ? ((attempt.score || 0) / totalMarks * 100).toFixed(1) : "0";
          csv += `"${student.name}","${student.email}","${student.classId || ''}","${student.section || ''}","${test.title}","${test.subject}","${attempt.score || 0}","${totalMarks}","${percentage}%","${new Date(att.completedAt).toLocaleDateString()}"\n`;
        }
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=analytics_report.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/export/class-results-csv", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const classId = req.query.classId as string;
      const attempts = await storage.getAllAttempts(tenantId);
      const users = await storage.getUsersByTenant(tenantId);
      const tests = await storage.getTestsByTenant(tenantId);

      const students = users.filter(u => u.role === "student" && (!classId || (u as any).classId === classId));
      const studentIds = new Set(students.map(s => s.id));
      const relevantAttempts = attempts.filter((a: Attempt) => studentIds.has(a.studentId));

      const testMap = new Map(tests.map(t => [t.id, t]));
      const studentMap = new Map(students.map(s => [s.id, s]));

      let csv = "Class,Section,Student Name,Email,Tests Taken,Average Score,Total Marks Earned\n";

      const studentStats = new Map<string, { tests: number; totalScore: number; totalMarks: number }>();

      for (const attempt of relevantAttempts) {
        const test = testMap.get(attempt.testId);
        const att = attempt as any;
        if (test && att.completedAt) {
          const stats = studentStats.get(attempt.studentId) || { tests: 0, totalScore: 0, totalMarks: 0 };
          stats.tests++;
          stats.totalScore += attempt.score || 0;
          stats.totalMarks += test.totalMarks || 0;
          studentStats.set(attempt.studentId, stats);
        }
      }

      for (const student of students) {
        const s = student as any;
        const stats = studentStats.get(student.id) || { tests: 0, totalScore: 0, totalMarks: 0 };
        const avgScore = stats.tests > 0 ? (stats.totalScore / stats.totalMarks * 100).toFixed(1) : "0";
        csv += `"${s.classId || ''}","${s.section || ''}","${student.name}","${student.email}","${stats.tests}","${avgScore}%","${stats.totalScore}"\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=class_results.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tab Switch / Focus Warning Log ============
  app.post("/api/exam/log-tab-switch", async (req, res) => {
    try {
      const { attemptId, studentId, tenantId } = req.body;
      
      await storage.logActivity({
        tenantId: tenantId || "tenant-demo",
        userId: studentId,
        entityType: "attempt",
        action: "tab_switch_detected",
        entityId: attemptId,
      });

      const existingAlerts = await storage.getRiskAlertsByTenant(tenantId || "tenant-demo");
      const studentSwitches = existingAlerts.filter(a => 
        a.studentId === studentId && 
        a.type === "tab_switch" &&
        new Date(a.createdAt).getTime() > Date.now() - 3600000
      );

      if (studentSwitches.length >= 2) {
        await storage.createRiskAlert({
          id: `risk-${Date.now()}`,
          tenantId: tenantId || "tenant-demo",
          studentId,
          type: "multiple_tab_switches",
          severity: "high",
          message: "Multiple tab switches detected during exam - potential cheating",
          resolved: false,
          createdAt: new Date(),
        });
      } else {
        await storage.createRiskAlert({
          id: `risk-${Date.now()}`,
          tenantId: tenantId || "tenant-demo",
          studentId,
          type: "tab_switch",
          severity: "medium",
          message: "Tab switch detected during exam",
          resolved: false,
          createdAt: new Date(),
        });
      }

      res.json({ success: true, warning: "Tab switch logged" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Blueprint Routes ============
  app.get("/api/blueprints", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const blueprints = await storage.getBlueprintsByTenant(tenantId);
      res.json(blueprints);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/blueprints", async (req, res) => {
    try {
      const { totalMarks, sections, ...rest } = req.body;
      const duration = totalMarks === 40 ? 90 : totalMarks === 80 ? 180 : 120;
      const blueprint = await storage.createBlueprint({
        ...rest,
        totalMarks,
        sections,
        duration,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(blueprint);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/blueprints/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBlueprint(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Blueprint not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Bulk User Upload ============
  app.post("/api/users/bulk", async (req, res) => {
    try {
      const { users } = req.body;
      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: "No users provided" });
      }
      let created = 0;
      const errors: any[] = [];
      for (const userData of users) {
        try {
          await storage.createUser({
            ...userData,
            active: true,
          });
          created++;
        } catch (err: any) {
          errors.push({ user: userData.username, error: err.message });
        }
      }
      res.json({ created, errors, total: users.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Portions Routes ============
  app.patch("/api/chapters/:id/portions", async (req, res) => {
    try {
      const { completedTopics } = req.body;
      const chapter = await storage.updateChapterPortions(req.params.id, completedTopics);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Subjects Routes ============
  app.get("/api/subjects", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const subjects = await storage.getSubjectsByTenant(tenantId);
      res.json(subjects);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Students Routes ============
  app.get("/api/students", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const students = await storage.getStudentsByTenant(tenantId);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Makeup Tests Routes ============
  app.get("/api/makeup-tests", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const makeupTests = await storage.getMakeupTestsByTenant(tenantId);
      res.json(makeupTests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/makeup-tests", async (req, res) => {
    try {
      const makeupTest = await storage.createMakeupTest({
        ...req.body,
        tenantId: req.body.tenantId || "tenant-demo",
      });
      res.json(makeupTest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Submissions Routes ============
  app.get("/api/submissions", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const submissions = await storage.getSubmissionsByTenant(tenantId);
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/submissions/:id/marks", async (req, res) => {
    try {
      const { marks, feedback } = req.body;
      const submission = await storage.updateSubmissionMarks(req.params.id, marks, feedback);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/submissions/:id/complete", async (req, res) => {
    try {
      const submission = await storage.completeSubmissionMarking(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }
      res.json(submission);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Results Routes ============
  app.get("/api/results", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const userId = req.query.userId as string;
      const results = await storage.getResultsByUser(tenantId, userId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Parent Routes ============
  app.get("/api/parent/children", async (req, res) => {
    try {
      const parentId = req.query.parentId as string;
      const children = await storage.getChildrenByParent(parentId);
      res.json(children);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parent/results", async (req, res) => {
    try {
      const parentId = req.query.parentId as string;
      const results = await storage.getResultsByParent(parentId);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parent/progress", async (req, res) => {
    try {
      const parentId = req.query.parentId as string;
      const progress = await storage.getProgressByParent(parentId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parent/notifications", async (req, res) => {
    try {
      const parentId = req.query.parentId as string;
      const notifications = await storage.getNotificationsByParent(parentId);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parent/activity-timeline", async (req, res) => {
    try {
      const parentId = req.query.parentId as string;
      if (!parentId) {
        return res.json([]);
      }
      
      const children = await storage.getChildrenByParent(parentId);
      if (!children || children.length === 0) {
        return res.json([]);
      }
      
      const activities: any[] = [];
      
      const attemptPromises = children.map(async (child: any) => {
        try {
          const attempts = await storage.getAttemptsByStudent(child.id);
          return { child, attempts: attempts || [] };
        } catch {
          return { child, attempts: [] };
        }
      });
      
      const childAttempts = await Promise.all(attemptPromises);
      
      for (const { child, attempts } of childAttempts) {
        for (const attempt of attempts) {
          try {
            const test = await storage.getTest(attempt.testId);
            const att = attempt as any;
            if (test && att.completedAt) {
              activities.push({
                id: `activity-${attempt.id}`,
                type: "test_completed",
                title: `Completed: ${test.title}`,
                description: `${child?.name || 'Student'} scored ${attempt.score || 0}/${test.totalMarks || 0} in ${test.subject}`,
                timestamp: att.completedAt,
                icon: "award",
                childName: child?.name || 'Student',
              });
            } else if (test && att.startedAt) {
              activities.push({
                id: `activity-start-${attempt.id}`,
                type: "test_started",
                title: `Started: ${test.title}`,
                description: `${child?.name || 'Student'} started ${test.subject} test`,
                timestamp: att.startedAt,
                icon: "play",
                childName: child?.name || 'Student',
              });
            }
          } catch {
            continue;
          }
        }
      }
      
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json(activities.slice(0, 20));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Risk Alerts Routes ============
  app.get("/api/risk-alerts", async (req, res) => {
    try {
      const tenantId = req.query.tenantId as string || "tenant-demo";
      const alerts = await storage.getRiskAlertsByTenant(tenantId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/risk-alerts/:id/acknowledge", async (req, res) => {
    try {
      const alert = await storage.acknowledgeRiskAlert(req.params.id);
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

function parseCSVContent(csvContent: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  
  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];
    
    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
      } else if (nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      if (char === '\r') i++;
    } else if (char === '\r' && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }
  
  currentRow.push(currentCell.trim());
  if (currentRow.some(cell => cell !== "")) {
    rows.push(currentRow);
  }
  
  return rows;
}
