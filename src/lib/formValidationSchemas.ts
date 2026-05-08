import { z } from "zod";

// =============================================================================
// Teacher Schema
// =============================================================================
export const teacherSchema = z.object({
  id: z.string().optional(),
  teacherId: z.string().min(1, { message: "Teacher ID is required!" }),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().optional(),
  emergencyContact: z.string().min(1, { message: "Emergency Contact is required!" }),
  photo: z.any().optional(),
  subjects: z.array(z.string()).min(1, { message: "At least one subject is required!" }),
  classes: z.array(z.string()).min(1, { message: "At least one class is required!" }),
});
export type TeacherSchema = z.infer<typeof teacherSchema>;

// =============================================================================
// Student Schema
// =============================================================================
export const studentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  emergencyContact: z.string().min(1, { message: "Emergency Contact is required!" }),
  photo: z.any().optional(),
  grade: z.coerce.number().min(1, { message: "Grade is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
});
export type StudentSchema = {
  id?: string;
  studentId: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  bloodType: string;
  emergencyContact: string;
  photo?: any;
  grade: number;
  class: string;
};

// =============================================================================
// Parent Schema
// =============================================================================
export const parentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  students: z.array(z.string()).optional(),
});
export type ParentSchema = z.infer<typeof parentSchema>;

// =============================================================================
// Subject Schema
// =============================================================================
export const subjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).optional(),
});
export type SubjectSchema = z.infer<typeof subjectSchema>;

// =============================================================================
// Class Schema
// =============================================================================
export const classSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  grade: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisor: z.string().min(1, { message: "Supervisor name is required!" }),
});
export type ClassSchema = z.infer<typeof classSchema>;

// =============================================================================
// Lesson Schema
// =============================================================================
export const lessonSchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
  teacher: z.string().min(1, { message: "Teacher is required!" }),
  day: z.string().min(1, { message: "Day is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
});
export type LessonSchema = z.infer<typeof lessonSchema>;

// =============================================================================
// Exam Schema
// =============================================================================
export const examSchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
  teacher: z.string().min(1, { message: "Teacher is required!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});
export type ExamSchema = z.infer<typeof examSchema>;

// =============================================================================
// Assignment Schema
// =============================================================================
export const assignmentSchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
  teacher: z.string().min(1, { message: "Teacher is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().optional(),
});
export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// =============================================================================
// Result Schema
// =============================================================================
export const resultSchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required!" }),
  student: z.string().min(1, { message: "Student name is required!" }),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
  studentEmail: z.string().optional(),
  class: z.string().min(1, { message: "Class is required!" }),
  teacher: z.string().optional(),
  type: z.enum(["exam", "assignment"], { message: "Type must be exam or assignment!" }),
  date: z.string().min(1, { message: "Date is required!" }),
  score: z.coerce.number().min(0).max(100, { message: "Score must be 0-100!" }),
  grade: z.string().optional(),
});
export type ResultSchema = z.infer<typeof resultSchema>;

// =============================================================================
// Attendance Schema
// =============================================================================
export const attendanceSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
  studentName: z.string().optional(),
  date: z.string().min(1, { message: "Date is required!" }),
  status: z.enum(["Present", "Absent", "Late"], { message: "Status is required!" }),
  class: z.string().optional(),
});
export type AttendanceSchema = z.infer<typeof attendanceSchema>;

// =============================================================================
// Event Schema
// =============================================================================
export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  class: z.string().optional(),
  date: z.string().min(1, { message: "Date is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }),
  endTime: z.string().min(1, { message: "End time is required!" }),
  description: z.string().optional(),
});
export type EventSchema = z.infer<typeof eventSchema>;

// =============================================================================
// Announcement Schema
// =============================================================================
export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  class: z.string().optional(),
  date: z.string().min(1, { message: "Date is required!" }),
});
export type AnnouncementSchema = z.infer<typeof announcementSchema>;
