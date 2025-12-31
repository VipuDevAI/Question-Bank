import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import mammoth from "mammoth";
import PDFDocument from "pdfkit";

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
      const analytics = await storage.getAnalytics(tenantId);
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
