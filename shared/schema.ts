import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenants (Schools)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  logo: text("logo"),
  active: boolean("active").default(true),
  // Extended school details
  principalName: text("principal_name"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  pincode: text("pincode"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  board: text("board"), // CBSE, ICSE, State Board, etc.
  affiliationNumber: text("affiliation_number"),
  establishedYear: text("established_year"),
  studentCount: integer("student_count"),
  teacherCount: integer("teacher_count"),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

// User roles - Updated with HOD, Principal, Examination Committee
export const userRoles = ["super_admin", "admin", "hod", "principal", "exam_committee", "teacher", "student", "parent"] as const;
export type UserRole = typeof userRoles[number];

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"),
  email: text("email").notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().$type<UserRole>(),
  grade: text("grade").default("V"),
  avatar: text("avatar"),
  parentOf: varchar("parent_of"),
  active: boolean("active").default(true),
  assignedQuestions: jsonb("assigned_questions").$type<Record<string, any>>().default({}),
  sessionToken: text("session_token"),
});

export const insertUserSchema = createInsertSchema(users, {
  role: z.enum(userRoles),
  assignedQuestions: z.record(z.any()).optional(),
}).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Login schema
export const loginSchema = z.object({
  schoolCode: z.string().min(1, "School code is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Question types
export const questionTypes = ["mcq", "true_false", "fill_blank", "matching", "numerical", "short_answer", "long_answer"] as const;
export type QuestionType = typeof questionTypes[number];

// Difficulty levels
export const difficultyLevels = ["easy", "medium", "hard"] as const;
export type DifficultyLevel = typeof difficultyLevels[number];

// Bloom's taxonomy levels
export const bloomLevels = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const;
export type BloomLevel = typeof bloomLevels[number];

// Passages for passage-based questions
export const passages = pgTable("passages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade"),
  passageType: text("passage_type").default("prose"),
});

export const insertPassageSchema = createInsertSchema(passages).omit({ id: true });
export type InsertPassage = z.infer<typeof insertPassageSchema>;
export type Passage = typeof passages.$inferSelect;

// Questions
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().$type<QuestionType>(),
  options: jsonb("options").$type<string[]>(),
  optionImages: jsonb("option_images").$type<string[]>(),
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  hint: text("hint"),
  imageUrl: text("image_url"),
  passageId: varchar("passage_id"),
  instructionText: text("instruction_text"),
  subject: text("subject").notNull(),
  chapter: text("chapter").notNull(),
  topic: text("topic"),
  grade: text("grade").notNull(),
  difficulty: text("difficulty").$type<DifficultyLevel>().default("medium"),
  bloomLevel: text("bloom_level").$type<BloomLevel>(),
  marks: integer("marks").default(1),
  isVerified: boolean("is_verified").default(false),
  isPractice: boolean("is_practice").default(true),
  isAssessment: boolean("is_assessment").default(false),
  createdBy: varchar("created_by"),
  uploadId: varchar("upload_id"),
  status: text("status").default("draft"),
});

export const insertQuestionSchema = createInsertSchema(questions, {
  type: z.enum(questionTypes),
  options: z.array(z.string()).nullable().optional(),
  optionImages: z.array(z.string()).nullable().optional(),
  difficulty: z.enum(difficultyLevels).nullable().optional(),
  bloomLevel: z.enum(bloomLevels).nullable().optional(),
}).omit({ id: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Chapter status
export const chapterStatuses = ["draft", "locked", "unlocked", "completed"] as const;
export type ChapterStatus = typeof chapterStatuses[number];

// Chapters
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  orderIndex: integer("order_index").default(0),
  status: text("status").$type<ChapterStatus>().default("draft"),
  unlockDate: timestamp("unlock_date"),
  deadline: timestamp("deadline"),
  scoresRevealed: boolean("scores_revealed").default(false),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({ id: true });
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// Tests
export const testTypes = ["unit_test", "review_test", "quarterly", "half_yearly", "revision", "preparatory", "annual", "mock"] as const;
export type TestType = typeof testTypes[number];

// Workflow states for approval pipeline
export const workflowStates = [
  "draft",
  "submitted",
  "pending_hod",
  "hod_approved",
  "hod_rejected",
  "pending_principal",
  "principal_approved",
  "principal_rejected",
  "sent_to_committee",
  "locked"
] as const;
export type WorkflowState = typeof workflowStates[number];

export const tests = pgTable("tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  title: text("title").notNull(),
  type: text("type").$type<TestType>().notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  section: text("section"),
  chapterId: varchar("chapter_id"),
  duration: integer("duration").default(60),
  totalMarks: integer("total_marks").default(100),
  questionCount: integer("question_count").default(50),
  questionIds: jsonb("question_ids").$type<string[]>(),
  isActive: boolean("is_active").default(false),
  resultsRevealed: boolean("results_revealed").default(false),
  createdBy: varchar("created_by"),
  blueprintId: varchar("blueprint_id"),
  workflowState: text("workflow_state").$type<WorkflowState>().default("draft"),
  hodApprovedBy: varchar("hod_approved_by"),
  hodApprovedAt: timestamp("hod_approved_at"),
  hodComments: text("hod_comments"),
  principalApprovedBy: varchar("principal_approved_by"),
  principalApprovedAt: timestamp("principal_approved_at"),
  principalComments: text("principal_comments"),
  sentToCommitteeAt: timestamp("sent_to_committee_at"),
  isConfidential: boolean("is_confidential").default(false),
  printingReady: boolean("printing_ready").default(false),
  paperFormat: text("paper_format").default("A4"),
  generatedPaperUrl: text("generated_paper_url"),
  answerKeyUrl: text("answer_key_url"),
});

export const insertTestSchema = createInsertSchema(tests, {
  type: z.enum(testTypes),
  questionIds: z.array(z.string()).nullable().optional(),
  workflowState: z.enum(workflowStates).optional(),
}).omit({ id: true });
export type InsertTest = z.infer<typeof insertTestSchema>;
export type Test = typeof tests.$inferSelect;

// Question status in exam
export type QuestionStatus = "not_visited" | "answered" | "marked_review" | "unanswered";

// Exam state for session resume
export type ExamState = {
  currentIndex: number;
  answers: Record<string, string>;
  questionStatuses: Record<string, QuestionStatus>;
  markedForReview: string[];
  timeRemaining: number;
  startedAt: string;
  lastUpdated: string;
};

// Attempts
export const attemptStatuses = ["in_progress", "submitted", "absent", "marked"] as const;
export type AttemptStatus = typeof attemptStatuses[number];

export const attempts = pgTable("attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  testId: varchar("test_id").notNull(),
  studentId: varchar("student_id").notNull(),
  assignedQuestionIds: jsonb("assigned_question_ids").$type<string[]>(),
  answers: jsonb("answers").$type<Record<string, string>>(),
  questionStatuses: jsonb("question_statuses").$type<Record<string, QuestionStatus>>(),
  markedForReview: jsonb("marked_for_review").$type<string[]>(),
  score: integer("score"),
  totalMarks: integer("total_marks"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  status: text("status").$type<AttemptStatus>().default("in_progress"),
  timeRemaining: integer("time_remaining"),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  teacherRemarks: text("teacher_remarks"),
  manualScores: jsonb("manual_scores").$type<Record<string, number>>(),
});

const questionStatusEnum = z.enum(["not_visited", "answered", "marked_review", "unanswered"]);
export const insertAttemptSchema = createInsertSchema(attempts, {
  assignedQuestionIds: z.array(z.string()).nullable().optional(),
  answers: z.record(z.string()).nullable().optional(),
  questionStatuses: z.record(questionStatusEnum).nullable().optional(),
  markedForReview: z.array(z.string()).nullable().optional(),
  manualScores: z.record(z.number()).nullable().optional(),
}).omit({ id: true });
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
export type Attempt = typeof attempts.$inferSelect;

// Practice sessions
export const practiceSessions = pgTable("practice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  subject: text("subject").notNull(),
  chapter: text("chapter"),
  topic: text("topic"),
  questionsAttempted: integer("questions_attempted").default(0),
  correctAnswers: integer("correct_answers").default(0),
  status: text("status").default("active"),
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions).omit({ id: true });
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
export type PracticeSession = typeof practiceSessions.$inferSelect;

// Portions (Syllabus planning)
export const portions = pgTable("portions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  testType: text("test_type").$type<TestType>().notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  chapterIds: jsonb("chapter_ids").$type<string[]>(),
});

export const insertPortionSchema = createInsertSchema(portions).omit({ id: true });
export type InsertPortion = z.infer<typeof insertPortionSchema>;
export type Portion = typeof portions.$inferSelect;

// Exam configuration
export const examConfig = pgTable("exam_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  key: text("key").notNull(),
  value: text("value"),
});

export const insertExamConfigSchema = createInsertSchema(examConfig).omit({ id: true });
export type InsertExamConfig = z.infer<typeof insertExamConfigSchema>;
export type ExamConfig = typeof examConfig.$inferSelect;

// Upload tracking for Word/Sheets imports
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  filename: text("filename").notNull(),
  source: text("source").notNull(),
  subject: text("subject"),
  grade: text("grade"),
  questionCount: integer("question_count").default(0),
  uploadedBy: varchar("uploaded_by"),
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true });
export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type Upload = typeof uploads.$inferSelect;

// Grades/Results
export const grades = pgTable("grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  studentId: varchar("student_id").notNull(),
  studentName: text("student_name"),
  testId: varchar("test_id"),
  subject: text("subject").notNull(),
  grade: text("grade"),
  score: integer("score").default(0),
  totalMarks: integer("total_marks"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  gradedAt: timestamp("graded_at").default(sql`now()`),
});

export const insertGradeSchema = createInsertSchema(grades).omit({ id: true });
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;

// Auth session type
export type AuthUser = {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  role: UserRole;
  grade?: string;
  avatar: string | null;
};

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Timer calculation helper
export function calculateExamDuration(totalMarks: number): number {
  if (totalMarks <= 40) return 90;
  if (totalMarks <= 80) return 180;
  return Math.ceil(totalMarks * 2.25);
}

// Blueprints for exam paper structure
export const blueprints = pgTable("blueprints", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  totalMarks: integer("total_marks").notNull(),
  sections: jsonb("sections").$type<BlueprintSection[]>(),
  createdBy: varchar("created_by"),
  approvedBy: varchar("approved_by"),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export type BlueprintSection = {
  name: string;
  marks: number;
  questionCount: number;
  questionType: QuestionType;
  difficulty?: DifficultyLevel;
  chapters?: string[];
  instructions?: string;
};

export const insertBlueprintSchema = createInsertSchema(blueprints).omit({ id: true });
export type InsertBlueprint = z.infer<typeof insertBlueprintSchema>;
export type Blueprint = typeof blueprints.$inferSelect;

// Activity logs for audit trail
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(),
  userId: varchar("user_id").notNull(),
  userName: text("user_name"),
  userRole: text("user_role"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  details: jsonb("details").$type<Record<string, any>>(),
  previousState: text("previous_state"),
  newState: text("new_state"),
  comments: text("comments"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// Question approval status for HOD review
export const questionApprovalStatuses = ["pending", "approved", "rejected"] as const;
export type QuestionApprovalStatus = typeof questionApprovalStatuses[number];

// Question review table
export const questionReviews = pgTable("question_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull(),
  reviewerId: varchar("reviewer_id").notNull(),
  status: text("status").$type<QuestionApprovalStatus>().default("pending"),
  comments: text("comments"),
  reviewedAt: timestamp("reviewed_at").default(sql`now()`),
});

export const insertQuestionReviewSchema = createInsertSchema(questionReviews).omit({ id: true });
export type InsertQuestionReview = z.infer<typeof insertQuestionReviewSchema>;
export type QuestionReview = typeof questionReviews.$inferSelect;

// All subjects list
export const allSubjects = [
  "Tamil", "English", "Hindi", "Sanskrit", "French",
  "Mathematics", "Science", "Physics", "Chemistry", "Biology",
  "Computer Science", "AI",
  "Economics", "Commerce", "Business Studies", "History", "Geography", "Civics",
  "EVS", "Social Science"
] as const;
export type Subject = typeof allSubjects[number];
