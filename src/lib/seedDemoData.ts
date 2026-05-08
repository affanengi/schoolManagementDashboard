/**
 * SCHOOL DATA SEEDER
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides two exported functions:
 *   1. seedDemoLessons()       — Only seeds lesson schedule data
 *   2. resetAndSeedAllData()   — Clears teachers/students/parents/lessons
 *                                then seeds all fresh data from this file
 *
 * Use the buttons on the Admin Dashboard to trigger these functions.
 */

import { db } from "@/lib/firebase";
import { setDoc, doc, getDocs, collection, deleteDoc } from "firebase/firestore";

// ── HELPERS ────────────────────────────────────────────────────────────────

async function clearCollection(name: string) {
  const snap = await getDocs(collection(db, name));
  await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
}

// ── TEACHER DATA ───────────────────────────────────────────────────────────

const teachers = [
  {
    id: "teacher-affan",
    teacherId: "1234567",
    name: "Affan",
    email: "affan@gmail.com",
    phone: "+91 9876541001",
    address: "12 Jubilee Hills, Hyderabad",
    subjects: ["Math", "Physics"],
    classes: ["5A", "4A"],
    photo: "",
    bloodType: "O+",
    emergencyContact: "+91 9988776601",
  },
  {
    id: "teacher-abdullah",
    teacherId: "1234657",
    name: "Abdullah",
    email: "abdullah@gmail.com",
    phone: "+91 9876541002",
    address: "34 Banjara Hills, Hyderabad",
    subjects: ["English", "History"],
    classes: ["4B", "5B"],
    photo: "",
    bloodType: "A+",
    emergencyContact: "+91 9988776602",
  },
  {
    id: "teacher-chand",
    teacherId: "1243567",
    name: "Chand",
    email: "chand@gmail.com",
    phone: "+91 9876541003",
    address: "56 Madhapur, Hyderabad",
    subjects: ["Chemistry", "Biology"],
    classes: ["3A", "3B"],
    photo: "",
    bloodType: "B+",
    emergencyContact: "+91 9988776603",
  },
  {
    id: "teacher-sameer",
    teacherId: "1324567",
    name: "Sameer",
    email: "sameer@gmail.com",
    phone: "+91 9876541004",
    address: "78 Kondapur, Hyderabad",
    subjects: ["Science"],
    classes: ["2A", "2B"],
    photo: "",
    bloodType: "AB+",
    emergencyContact: "+91 9988776604",
  },
  {
    id: "teacher-dhanunjaya",
    teacherId: "2134567",
    name: "Dhanunjaya",
    email: "dhanu@gmail.com",
    phone: "+91 9876541005",
    address: "90 Gachibowli, Hyderabad",
    subjects: ["Art", "Music"],
    classes: ["1A", "1B"],
    photo: "",
    bloodType: "O-",
    emergencyContact: "+91 9988776605",
  },
  {
    id: "teacher-waleed",
    teacherId: "1234576",
    name: "Waleed",
    email: "waleed@gmail.com",
    phone: "+91 9876541006",
    address: "11 Tolichowki, Hyderabad",
    subjects: ["Social Studies", "Geography"],
    classes: ["6A", "6B"],
    photo: "",
    bloodType: "A-",
    emergencyContact: "+91 9988776606",
  },
];

// ── STUDENT DATA ───────────────────────────────────────────────────────────

const students = [
  {
    id: "student-saffan",
    studentId: "2345678",
    name: "Saffan",
    email: "saffan@gmail.com",
    phone: "+91 9123456701",
    address: "12 Jubilee Hills, Hyderabad",
    grade: 5,
    class: "5A",
    photo: "",
    bloodType: "O+",
    emergencyContact: "+91 1234567890",
    sex: "male",
  },
  {
    id: "student-zaid",
    studentId: "2345687",
    name: "Zaid",
    email: "zaid@gmail.com",
    phone: "+91 9123456702",
    address: "34 Banjara Hills, Hyderabad",
    grade: 4,
    class: "4B",
    photo: "",
    bloodType: "A+",
    emergencyContact: "+91 1234567809",
    sex: "male",
  },
  {
    id: "student-amaan",
    studentId: "2345768",
    name: "Amaan",
    email: "amaan@gmail.com",
    phone: "+91 9123456703",
    address: "56 Madhapur, Hyderabad",
    grade: 3,
    class: "3A",
    photo: "",
    bloodType: "B+",
    emergencyContact: "+91 1234567980",
    sex: "male",
  },
  {
    id: "student-daniya",
    studentId: "2346578",
    name: "Daniya",
    email: "daniya@gmail.com",
    phone: "+91 9123456704",
    address: "78 Kondapur, Hyderabad",
    grade: 6,
    class: "6A",
    photo: "",
    bloodType: "AB+",
    emergencyContact: "+91 1234568790",
    sex: "female",
  },
  {
    id: "student-danish",
    studentId: "2354678",
    name: "Danish",
    email: "danish@gmail.com",
    phone: "+91 9123456705",
    address: "90 Gachibowli, Hyderabad",
    grade: 2,
    class: "2B",
    photo: "",
    bloodType: "O-",
    emergencyContact: "+91 1234576890",
    sex: "male",
  },
  {
    id: "student-neha",
    studentId: "3245678",
    name: "Neha",
    email: "neha@gmail.com",
    phone: "+91 9123456706",
    address: "11 Tolichowki, Hyderabad",
    grade: 1,
    class: "1A",
    photo: "",
    bloodType: "A-",
    emergencyContact: "+91 1234657890",
    sex: "female",
  },
];

// ── PARENT DATA ────────────────────────────────────────────────────────────

const parents = [
  {
    id: "parent-quddus",
    name: "Quddus",
    email: "quddus@gmail.com",
    phone: "1234567890",
    address: "12 Jubilee Hills, Hyderabad",
    students: ["Saffan"],
  },
  {
    id: "parent-abdulkareem",
    name: "Abdul Kareem",
    email: "abdulkareem@gmail.com",
    phone: "1234567809",
    address: "34 Banjara Hills, Hyderabad",
    students: ["Zaid"],
  },
  {
    id: "parent-abdulraheem",
    name: "Abdul Raheem",
    email: "abdulraheem@gmail.com",
    phone: "1234567980",
    address: "56 Madhapur, Hyderabad",
    students: ["Amaan"],
  },
  {
    id: "parent-sameerahmed",
    name: "Sameer Ahmed",
    email: "sameerahmed@gmail.com",
    phone: "1234568790",
    address: "78 Kondapur, Hyderabad",
    students: ["Daniya"],
  },
  {
    id: "parent-waleeddastagir",
    name: "Waleed Dastagir",
    email: "waleeddastagir@gmail.com",
    phone: "1234576890",
    address: "90 Gachibowli, Hyderabad",
    students: ["Danish"],
  },
  {
    id: "parent-mohdabdullah",
    name: "Mohd Abdullah",
    email: "mohdabdullah@gmail.com",
    phone: "1234657890",
    address: "11 Tolichowki, Hyderabad",
    students: ["Neha"],
  },
];

// ── LESSONS (uses new teacher names) ──────────────────────────────────────

const demoLessons = [
  // Affan — classes 5A, 4A (Math, Physics)
  { id: "lesson-5a-mon-math",  subject: "Math",          class: "5A", teacher: "Affan",       day: "Monday",    startTime: "08:00", endTime: "09:00" },
  { id: "lesson-5a-mon-phys",  subject: "Physics",       class: "5A", teacher: "Affan",       day: "Monday",    startTime: "09:00", endTime: "10:00" },
  { id: "lesson-5a-wed-math",  subject: "Math",          class: "5A", teacher: "Affan",       day: "Wednesday", startTime: "08:00", endTime: "09:00" },
  { id: "lesson-5a-fri-phys",  subject: "Physics",       class: "5A", teacher: "Affan",       day: "Friday",    startTime: "08:00", endTime: "09:00" },
  { id: "lesson-4a-tue-math",  subject: "Math",          class: "4A", teacher: "Affan",       day: "Tuesday",   startTime: "09:00", endTime: "10:00" },
  { id: "lesson-4a-thu-phys",  subject: "Physics",       class: "4A", teacher: "Affan",       day: "Thursday",  startTime: "10:00", endTime: "11:00" },

  // Abdullah — classes 4B, 5B (English, History)
  { id: "lesson-4b-mon-eng",   subject: "English",       class: "4B", teacher: "Abdullah",    day: "Monday",    startTime: "10:00", endTime: "11:00" },
  { id: "lesson-4b-wed-hist",  subject: "History",       class: "4B", teacher: "Abdullah",    day: "Wednesday", startTime: "11:00", endTime: "12:00" },
  { id: "lesson-5b-tue-eng",   subject: "English",       class: "5B", teacher: "Abdullah",    day: "Tuesday",   startTime: "08:00", endTime: "09:00" },
  { id: "lesson-5b-fri-hist",  subject: "History",       class: "5B", teacher: "Abdullah",    day: "Friday",    startTime: "10:00", endTime: "11:00" },

  // Chand — classes 3A, 3B (Chemistry, Biology)
  { id: "lesson-3a-tue-chem",  subject: "Chemistry",     class: "3A", teacher: "Chand",       day: "Tuesday",   startTime: "10:00", endTime: "11:30" },
  { id: "lesson-3a-fri-bio",   subject: "Biology",       class: "3A", teacher: "Chand",       day: "Friday",    startTime: "11:00", endTime: "12:30" },
  { id: "lesson-3b-mon-chem",  subject: "Chemistry",     class: "3B", teacher: "Chand",       day: "Monday",    startTime: "13:00", endTime: "14:30" },
  { id: "lesson-3b-thu-bio",   subject: "Biology",       class: "3B", teacher: "Chand",       day: "Thursday",  startTime: "08:00", endTime: "09:30" },

  // Sameer — classes 2A, 2B (Science only)
  { id: "lesson-2a-wed-sci",   subject: "Science",       class: "2A", teacher: "Sameer",      day: "Wednesday", startTime: "09:00", endTime: "10:00" },
  { id: "lesson-2a-fri-sci",   subject: "Science",       class: "2A", teacher: "Sameer",      day: "Friday",    startTime: "13:00", endTime: "14:00" },
  { id: "lesson-2b-thu-sci",   subject: "Science",       class: "2B", teacher: "Sameer",      day: "Thursday",  startTime: "11:00", endTime: "12:00" },
  { id: "lesson-2b-mon-sci",   subject: "Science",       class: "2B", teacher: "Sameer",      day: "Monday",    startTime: "11:00", endTime: "12:00" },

  // Dhanunjaya — classes 1A, 1B (Art, Music)
  { id: "lesson-1a-fri-art",   subject: "Art",           class: "1A", teacher: "Dhanunjaya",  day: "Friday",    startTime: "13:00", endTime: "14:00" },
  { id: "lesson-1a-wed-music", subject: "Music",         class: "1A", teacher: "Dhanunjaya",  day: "Wednesday", startTime: "14:00", endTime: "15:00" },
  { id: "lesson-1b-tue-music", subject: "Music",         class: "1B", teacher: "Dhanunjaya",  day: "Tuesday",   startTime: "13:00", endTime: "14:00" },
  { id: "lesson-1b-thu-art",   subject: "Art",           class: "1B", teacher: "Dhanunjaya",  day: "Thursday",  startTime: "13:00", endTime: "14:00" },

  // Waleed — classes 6A, 6B (Social Studies, Geography)
  { id: "lesson-6a-mon-ss",    subject: "Social Studies", class: "6A", teacher: "Waleed",     day: "Monday",    startTime: "11:00", endTime: "12:00" },
  { id: "lesson-6a-wed-geo",   subject: "Geography",     class: "6A", teacher: "Waleed",      day: "Wednesday", startTime: "13:00", endTime: "14:00" },
  { id: "lesson-6b-fri-ss",    subject: "Social Studies", class: "6B", teacher: "Waleed",     day: "Friday",    startTime: "11:00", endTime: "12:00" },
  { id: "lesson-6b-tue-geo",   subject: "Geography",     class: "6B", teacher: "Waleed",      day: "Tuesday",   startTime: "11:00", endTime: "12:00" },
];

// ── SUBJECTS DATA ──────────────────────────────────────────────────────────

const demoSubjects = [
  { id: "subj-math",          name: "Math",          teachers: ["Affan"] },
  { id: "subj-physics",       name: "Physics",       teachers: ["Affan"] },
  { id: "subj-english",       name: "English",       teachers: ["Abdullah"] },
  { id: "subj-history",       name: "History",       teachers: ["Abdullah"] },
  { id: "subj-chemistry",     name: "Chemistry",     teachers: ["Chand"] },
  { id: "subj-biology",       name: "Biology",       teachers: ["Chand"] },
  { id: "subj-science",       name: "Science",       teachers: ["Sameer"] },
  { id: "subj-art",           name: "Art",           teachers: ["Dhanunjaya"] },
  { id: "subj-music",         name: "Music",         teachers: ["Dhanunjaya"] },
  { id: "subj-socialstudies", name: "Social Studies",teachers: ["Waleed"] },
  { id: "subj-geography",     name: "Geography",     teachers: ["Waleed"] },
];

// ── CLASSES DATA ───────────────────────────────────────────────────────────

const demoClasses = [
  { id: "class-1a", name: "1A", grade: 1, capacity: 20, supervisor: "Dhanunjaya" },
  { id: "class-1b", name: "1B", grade: 1, capacity: 20, supervisor: "Dhanunjaya" },
  { id: "class-2a", name: "2A", grade: 2, capacity: 22, supervisor: "Sameer" },
  { id: "class-2b", name: "2B", grade: 2, capacity: 22, supervisor: "Sameer" },
  { id: "class-3a", name: "3A", grade: 3, capacity: 20, supervisor: "Chand" },
  { id: "class-3b", name: "3B", grade: 3, capacity: 20, supervisor: "Chand" },
  { id: "class-4a", name: "4A", grade: 4, capacity: 22, supervisor: "Affan" },
  { id: "class-4b", name: "4B", grade: 4, capacity: 22, supervisor: "Abdullah" },
  { id: "class-5a", name: "5A", grade: 5, capacity: 20, supervisor: "Affan" },
  { id: "class-5b", name: "5B", grade: 5, capacity: 20, supervisor: "Abdullah" },
  { id: "class-6a", name: "6A", grade: 6, capacity: 22, supervisor: "Waleed" },
  { id: "class-6b", name: "6B", grade: 6, capacity: 20, supervisor: "Waleed" },
];

// ── EXAMS DATA ─────────────────────────────────────────────────────────────

const demoExams = [
  { id: "exam-math-5a",   subject: "Math",          class: "5A", teacher: "Affan",      date: "2026-06-10" },
  { id: "exam-phys-5a",   subject: "Physics",       class: "5A", teacher: "Affan",      date: "2026-06-12" },
  { id: "exam-eng-4b",    subject: "English",       class: "4B", teacher: "Abdullah",   date: "2026-06-11" },
  { id: "exam-hist-4b",   subject: "History",       class: "4B", teacher: "Abdullah",   date: "2026-06-13" },
  { id: "exam-chem-3a",   subject: "Chemistry",     class: "3A", teacher: "Chand",      date: "2026-06-10" },
  { id: "exam-bio-3a",    subject: "Biology",       class: "3A", teacher: "Chand",      date: "2026-06-14" },
  { id: "exam-sci-2a",    subject: "Science",       class: "2A", teacher: "Sameer",     date: "2026-06-11" },
  { id: "exam-art-1a",    subject: "Art",           class: "1A", teacher: "Dhanunjaya", date: "2026-06-12" },
  { id: "exam-music-1b",  subject: "Music",         class: "1B", teacher: "Dhanunjaya", date: "2026-06-13" },
  { id: "exam-ss-6a",     subject: "Social Studies",class: "6A", teacher: "Waleed",     date: "2026-06-10" },
  { id: "exam-geo-6b",    subject: "Geography",     class: "6B", teacher: "Waleed",     date: "2026-06-15" },
];

// ── ASSIGNMENTS DATA ────────────────────────────────────────────────────────

const demoAssignments = [
  { id: "asgn-math-5a",   title: "Chapter 5 Problem Set",       subject: "Math",          class: "5A", teacher: "Affan",      dueDate: "2026-05-20" },
  { id: "asgn-phys-5a",   title: "Motion & Forces Quiz Prep",   subject: "Physics",       class: "5A", teacher: "Affan",      dueDate: "2026-05-22" },
  { id: "asgn-eng-4b",    title: "Essay Writing Practice",      subject: "English",       class: "4B", teacher: "Abdullah",   dueDate: "2026-05-21" },
  { id: "asgn-hist-4b",   title: "Ancient Civilizations Review",subject: "History",       class: "4B", teacher: "Abdullah",   dueDate: "2026-05-23" },
  { id: "asgn-chem-3a",   title: "Periodic Table Lab Report",   subject: "Chemistry",     class: "3A", teacher: "Chand",      dueDate: "2026-05-20" },
  { id: "asgn-bio-3b",    title: "Cell Structure Diagram",      subject: "Biology",       class: "3B", teacher: "Chand",      dueDate: "2026-05-24" },
  { id: "asgn-sci-2a",    title: "Scientific Method Project",   subject: "Science",       class: "2A", teacher: "Sameer",     dueDate: "2026-05-21" },
  { id: "asgn-art-1a",    title: "Still Life Sketching",        subject: "Art",           class: "1A", teacher: "Dhanunjaya", dueDate: "2026-05-22" },
  { id: "asgn-music-1b",  title: "Rhythm & Notation Sheet",     subject: "Music",         class: "1B", teacher: "Dhanunjaya", dueDate: "2026-05-23" },
  { id: "asgn-ss-6a",     title: "World Cultures Presentation", subject: "Social Studies",class: "6A", teacher: "Waleed",     dueDate: "2026-05-20" },
  { id: "asgn-geo-6b",    title: "Map Reading Exercise",        subject: "Geography",     class: "6B", teacher: "Waleed",     dueDate: "2026-05-25" },
];

// ── RESULTS DATA — every student × every subject (66 records) ──────────────

const demoResults = [
  // ── SAFFAN (5A) ──────────────────────────────────────────────────────────
  { id: "r-saffan-math",  studentId: "2345678", student: "Saffan", subject: "Math",          class: "5A", score: 92, grade: "A",  teacher: "Affan" },
  { id: "r-saffan-phys",  studentId: "2345678", student: "Saffan", subject: "Physics",       class: "5A", score: 88, grade: "A",  teacher: "Affan" },
  { id: "r-saffan-eng",   studentId: "2345678", student: "Saffan", subject: "English",       class: "5A", score: 75, grade: "B",  teacher: "Abdullah" },
  { id: "r-saffan-hist",  studentId: "2345678", student: "Saffan", subject: "History",       class: "5A", score: 70, grade: "B",  teacher: "Abdullah" },
  { id: "r-saffan-chem",  studentId: "2345678", student: "Saffan", subject: "Chemistry",     class: "5A", score: 68, grade: "C+", teacher: "Chand" },
  { id: "r-saffan-bio",   studentId: "2345678", student: "Saffan", subject: "Biology",       class: "5A", score: 72, grade: "B",  teacher: "Chand" },
  { id: "r-saffan-sci",   studentId: "2345678", student: "Saffan", subject: "Science",       class: "5A", score: 80, grade: "B+", teacher: "Sameer" },
  { id: "r-saffan-art",   studentId: "2345678", student: "Saffan", subject: "Art",           class: "5A", score: 65, grade: "C+", teacher: "Dhanunjaya" },
  { id: "r-saffan-music", studentId: "2345678", student: "Saffan", subject: "Music",         class: "5A", score: 60, grade: "C",  teacher: "Dhanunjaya" },
  { id: "r-saffan-ss",    studentId: "2345678", student: "Saffan", subject: "Social Studies",class: "5A", score: 74, grade: "B",  teacher: "Waleed" },
  { id: "r-saffan-geo",   studentId: "2345678", student: "Saffan", subject: "Geography",     class: "5A", score: 71, grade: "B",  teacher: "Waleed" },

  // ── ZAID (4B) ────────────────────────────────────────────────────────────
  { id: "r-zaid-math",    studentId: "2345687", student: "Zaid",   subject: "Math",          class: "4B", score: 70, grade: "B",  teacher: "Affan" },
  { id: "r-zaid-phys",    studentId: "2345687", student: "Zaid",   subject: "Physics",       class: "4B", score: 65, grade: "C+", teacher: "Affan" },
  { id: "r-zaid-eng",     studentId: "2345687", student: "Zaid",   subject: "English",       class: "4B", score: 90, grade: "A",  teacher: "Abdullah" },
  { id: "r-zaid-hist",    studentId: "2345687", student: "Zaid",   subject: "History",       class: "4B", score: 85, grade: "A",  teacher: "Abdullah" },
  { id: "r-zaid-chem",    studentId: "2345687", student: "Zaid",   subject: "Chemistry",     class: "4B", score: 75, grade: "B",  teacher: "Chand" },
  { id: "r-zaid-bio",     studentId: "2345687", student: "Zaid",   subject: "Biology",       class: "4B", score: 78, grade: "B",  teacher: "Chand" },
  { id: "r-zaid-sci",     studentId: "2345687", student: "Zaid",   subject: "Science",       class: "4B", score: 72, grade: "B",  teacher: "Sameer" },
  { id: "r-zaid-art",     studentId: "2345687", student: "Zaid",   subject: "Art",           class: "4B", score: 82, grade: "B+", teacher: "Dhanunjaya" },
  { id: "r-zaid-music",   studentId: "2345687", student: "Zaid",   subject: "Music",         class: "4B", score: 79, grade: "B",  teacher: "Dhanunjaya" },
  { id: "r-zaid-ss",      studentId: "2345687", student: "Zaid",   subject: "Social Studies",class: "4B", score: 68, grade: "C+", teacher: "Waleed" },
  { id: "r-zaid-geo",     studentId: "2345687", student: "Zaid",   subject: "Geography",     class: "4B", score: 73, grade: "B",  teacher: "Waleed" },

  // ── AMAAN (3A) ───────────────────────────────────────────────────────────
  { id: "r-amaan-math",   studentId: "2345768", student: "Amaan",  subject: "Math",          class: "3A", score: 78, grade: "B",  teacher: "Affan" },
  { id: "r-amaan-phys",   studentId: "2345768", student: "Amaan",  subject: "Physics",       class: "3A", score: 74, grade: "B",  teacher: "Affan" },
  { id: "r-amaan-eng",    studentId: "2345768", student: "Amaan",  subject: "English",       class: "3A", score: 80, grade: "B+", teacher: "Abdullah" },
  { id: "r-amaan-hist",   studentId: "2345768", student: "Amaan",  subject: "History",       class: "3A", score: 76, grade: "B",  teacher: "Abdullah" },
  { id: "r-amaan-chem",   studentId: "2345768", student: "Amaan",  subject: "Chemistry",     class: "3A", score: 95, grade: "A+", teacher: "Chand" },
  { id: "r-amaan-bio",    studentId: "2345768", student: "Amaan",  subject: "Biology",       class: "3A", score: 91, grade: "A",  teacher: "Chand" },
  { id: "r-amaan-sci",    studentId: "2345768", student: "Amaan",  subject: "Science",       class: "3A", score: 85, grade: "A",  teacher: "Sameer" },
  { id: "r-amaan-art",    studentId: "2345768", student: "Amaan",  subject: "Art",           class: "3A", score: 70, grade: "B",  teacher: "Dhanunjaya" },
  { id: "r-amaan-music",  studentId: "2345768", student: "Amaan",  subject: "Music",         class: "3A", score: 66, grade: "C+", teacher: "Dhanunjaya" },
  { id: "r-amaan-ss",     studentId: "2345768", student: "Amaan",  subject: "Social Studies",class: "3A", score: 79, grade: "B",  teacher: "Waleed" },
  { id: "r-amaan-geo",    studentId: "2345768", student: "Amaan",  subject: "Geography",     class: "3A", score: 83, grade: "B+", teacher: "Waleed" },

  // ── DANIYA (6A) ──────────────────────────────────────────────────────────
  { id: "r-daniya-math",  studentId: "2346578", student: "Daniya", subject: "Math",          class: "6A", score: 82, grade: "B+", teacher: "Affan" },
  { id: "r-daniya-phys",  studentId: "2346578", student: "Daniya", subject: "Physics",       class: "6A", score: 79, grade: "B",  teacher: "Affan" },
  { id: "r-daniya-eng",   studentId: "2346578", student: "Daniya", subject: "English",       class: "6A", score: 88, grade: "A",  teacher: "Abdullah" },
  { id: "r-daniya-hist",  studentId: "2346578", student: "Daniya", subject: "History",       class: "6A", score: 86, grade: "A",  teacher: "Abdullah" },
  { id: "r-daniya-chem",  studentId: "2346578", student: "Daniya", subject: "Chemistry",     class: "6A", score: 77, grade: "B",  teacher: "Chand" },
  { id: "r-daniya-bio",   studentId: "2346578", student: "Daniya", subject: "Biology",       class: "6A", score: 80, grade: "B+", teacher: "Chand" },
  { id: "r-daniya-sci",   studentId: "2346578", student: "Daniya", subject: "Science",       class: "6A", score: 74, grade: "B",  teacher: "Sameer" },
  { id: "r-daniya-art",   studentId: "2346578", student: "Daniya", subject: "Art",           class: "6A", score: 90, grade: "A",  teacher: "Dhanunjaya" },
  { id: "r-daniya-music", studentId: "2346578", student: "Daniya", subject: "Music",         class: "6A", score: 87, grade: "A",  teacher: "Dhanunjaya" },
  { id: "r-daniya-ss",    studentId: "2346578", student: "Daniya", subject: "Social Studies",class: "6A", score: 94, grade: "A",  teacher: "Waleed" },
  { id: "r-daniya-geo",   studentId: "2346578", student: "Daniya", subject: "Geography",     class: "6A", score: 91, grade: "A",  teacher: "Waleed" },

  // ── DANISH (2B) ──────────────────────────────────────────────────────────
  { id: "r-danish-math",  studentId: "2354678", student: "Danish", subject: "Math",          class: "2B", score: 62, grade: "C",  teacher: "Affan" },
  { id: "r-danish-phys",  studentId: "2354678", student: "Danish", subject: "Physics",       class: "2B", score: 58, grade: "C",  teacher: "Affan" },
  { id: "r-danish-eng",   studentId: "2354678", student: "Danish", subject: "English",       class: "2B", score: 69, grade: "C+", teacher: "Abdullah" },
  { id: "r-danish-hist",  studentId: "2354678", student: "Danish", subject: "History",       class: "2B", score: 65, grade: "C+", teacher: "Abdullah" },
  { id: "r-danish-chem",  studentId: "2354678", student: "Danish", subject: "Chemistry",     class: "2B", score: 70, grade: "B",  teacher: "Chand" },
  { id: "r-danish-bio",   studentId: "2354678", student: "Danish", subject: "Biology",       class: "2B", score: 67, grade: "C+", teacher: "Chand" },
  { id: "r-danish-sci",   studentId: "2354678", student: "Danish", subject: "Science",       class: "2B", score: 75, grade: "B",  teacher: "Sameer" },
  { id: "r-danish-art",   studentId: "2354678", student: "Danish", subject: "Art",           class: "2B", score: 78, grade: "B",  teacher: "Dhanunjaya" },
  { id: "r-danish-music", studentId: "2354678", student: "Danish", subject: "Music",         class: "2B", score: 74, grade: "B",  teacher: "Dhanunjaya" },
  { id: "r-danish-ss",    studentId: "2354678", student: "Danish", subject: "Social Studies",class: "2B", score: 63, grade: "C",  teacher: "Waleed" },
  { id: "r-danish-geo",   studentId: "2354678", student: "Danish", subject: "Geography",     class: "2B", score: 61, grade: "C",  teacher: "Waleed" },

  // ── NEHA (1A) ────────────────────────────────────────────────────────────
  { id: "r-neha-math",    studentId: "3245678", student: "Neha",   subject: "Math",          class: "1A", score: 85, grade: "A",  teacher: "Affan" },
  { id: "r-neha-phys",    studentId: "3245678", student: "Neha",   subject: "Physics",       class: "1A", score: 82, grade: "B+", teacher: "Affan" },
  { id: "r-neha-eng",     studentId: "3245678", student: "Neha",   subject: "English",       class: "1A", score: 91, grade: "A",  teacher: "Abdullah" },
  { id: "r-neha-hist",    studentId: "3245678", student: "Neha",   subject: "History",       class: "1A", score: 88, grade: "A",  teacher: "Abdullah" },
  { id: "r-neha-chem",    studentId: "3245678", student: "Neha",   subject: "Chemistry",     class: "1A", score: 79, grade: "B",  teacher: "Chand" },
  { id: "r-neha-bio",     studentId: "3245678", student: "Neha",   subject: "Biology",       class: "1A", score: 84, grade: "A",  teacher: "Chand" },
  { id: "r-neha-sci",     studentId: "3245678", student: "Neha",   subject: "Science",       class: "1A", score: 77, grade: "B",  teacher: "Sameer" },
  { id: "r-neha-art",     studentId: "3245678", student: "Neha",   subject: "Art",           class: "1A", score: 98, grade: "A+", teacher: "Dhanunjaya" },
  { id: "r-neha-music",   studentId: "3245678", student: "Neha",   subject: "Music",         class: "1A", score: 96, grade: "A+", teacher: "Dhanunjaya" },
  { id: "r-neha-ss",      studentId: "3245678", student: "Neha",   subject: "Social Studies",class: "1A", score: 89, grade: "A",  teacher: "Waleed" },
  { id: "r-neha-geo",     studentId: "3245678", student: "Neha",   subject: "Geography",     class: "1A", score: 86, grade: "A",  teacher: "Waleed" },
];

// ── EVENTS DATA ─────────────────────────────────────────────────────────────

const demoEvents = [
  { id: "event-lake-trip",      title: "Lake Trip",         class: "1A", date: "2026-06-05", startTime: "09:00", endTime: "14:00" },
  { id: "event-beach-trip",     title: "Beach Trip",        class: "3A", date: "2026-06-07", startTime: "08:00", endTime: "17:00" },
  { id: "event-art-exhibition", title: "Art Exhibition",    class: "4B", date: "2026-06-10", startTime: "10:00", endTime: "12:00" },
  { id: "event-sports-tourney", title: "Sports Tournament", class: "5B", date: "2026-06-12", startTime: "09:00", endTime: "16:00" },
  { id: "event-music-concert",  title: "Music Concert",     class: "5A", date: "2026-06-14", startTime: "17:00", endTime: "19:00" },
  { id: "event-picnic",         title: "Picnic",            class: "2A", date: "2026-06-15", startTime: "10:00", endTime: "14:00" },
  { id: "event-museum-trip",    title: "Museum Trip",       class: "4A", date: "2026-06-18", startTime: "09:00", endTime: "15:00" },
  { id: "event-magician-show",  title: "Magician Show",     class: "1B", date: "2026-06-20", startTime: "11:00", endTime: "12:30" },
];

// ── ANNOUNCEMENTS DATA ─────────────────────────────────────────────────────

const demoAnnouncements = [
  { id: "ann-math-test",     title: "About Math Test",        class: "3C",  date: "2026-06-01", description: "Math test scheduled for next Monday. Chapters 1-5." },
  { id: "ann-english-essay", title: "English Essay Deadline", class: "4B",  date: "2026-06-03", description: "Essay submission deadline extended to Friday." },
  { id: "ann-holiday",       title: "Summer Holiday Notice",  class: "All", date: "2026-06-06", description: "School will be closed from June 20 to July 5." },
  { id: "ann-pta-meeting",   title: "PTA Meeting",            class: "All", date: "2026-06-09", description: "Parent-Teacher meeting scheduled for June 15, 4PM." },
  { id: "ann-chemistry-lab", title: "Chemistry Lab Safety",   class: "3A",  date: "2026-06-11", description: "All students must bring lab coats for practical sessions." },
  { id: "ann-sports-day",    title: "Annual Sports Day",      class: "All", date: "2026-06-13", description: "Annual sports day on June 25. Register for events." },
  { id: "ann-library-books", title: "Library Books Due",      class: "All", date: "2026-06-16", description: "All borrowed library books must be returned by June 30." },
  { id: "ann-science-fair",  title: "Science Fair Projects",  class: "5A",  date: "2026-06-19", description: "Science fair on July 5. Submit project abstracts by June 25." },
];

// ── PUBLIC EXPORTS ─────────────────────────────────────────────────────────

export async function seedDemoLessons() {
  for (const lesson of demoLessons) {
    const { id, ...data } = lesson;
    await setDoc(doc(db, "lessons", id), { ...data, createdAt: new Date() });
  }
  return `Seeded ${demoLessons.length} lessons`;
}

export async function resetAndSeedAllData(): Promise<{
  teachers: number;
  students: number;
  parents: number;
  subjects: number;
  classes: number;
  lessons: number;
  exams: number;
  assignments: number;
  results: number;
  events: number;
  announcements: number;
}> {
  // Step 1 — Clear ALL stale collections
  await Promise.all([
    clearCollection("teachers"),
    clearCollection("students"),
    clearCollection("parents"),
    clearCollection("subjects"),
    clearCollection("classes"),
    clearCollection("lessons"),
    clearCollection("exams"),
    clearCollection("assignments"),
    clearCollection("results"),
    clearCollection("events"),
    clearCollection("announcements"),
  ]);

  // Step 2 — Seed teachers
  for (const t of teachers) {
    const { id, ...data } = t;
    await setDoc(doc(db, "teachers", id), { ...data, createdAt: new Date() });
  }

  // Step 3 — Seed students
  for (const s of students) {
    const { id, ...data } = s;
    await setDoc(doc(db, "students", id), { ...data, createdAt: new Date() });
  }

  // Step 4 — Seed parents
  for (const p of parents) {
    const { id, ...data } = p;
    await setDoc(doc(db, "parents", id), { ...data, createdAt: new Date() });
  }

  // Step 5 — Seed subjects
  for (const s of demoSubjects) {
    const { id, ...data } = s;
    await setDoc(doc(db, "subjects", id), { ...data, createdAt: new Date() });
  }

  // Step 6 — Seed classes
  for (const c of demoClasses) {
    const { id, ...data } = c;
    await setDoc(doc(db, "classes", id), { ...data, createdAt: new Date() });
  }

  // Step 7 — Seed lessons
  await seedDemoLessons();

  // Step 8 — Seed exams
  for (const e of demoExams) {
    const { id, ...data } = e;
    await setDoc(doc(db, "exams", id), { ...data, createdAt: new Date() });
  }

  // Step 9 — Seed assignments
  for (const a of demoAssignments) {
    const { id, ...data } = a;
    await setDoc(doc(db, "assignments", id), { ...data, createdAt: new Date() });
  }

  // Step 10 — Seed results
  for (const r of demoResults) {
    const { id, ...data } = r;
    await setDoc(doc(db, "results", id), { ...data, createdAt: new Date() });
  }

  // Step 11 — Seed events
  for (const e of demoEvents) {
    const { id, ...data } = e;
    await setDoc(doc(db, "events", id), { ...data, createdAt: new Date() });
  }

  // Step 12 — Seed announcements
  for (const a of demoAnnouncements) {
    const { id, ...data } = a;
    await setDoc(doc(db, "announcements", id), { ...data, createdAt: new Date() });
  }

  return {
    teachers: teachers.length,
    students: students.length,
    parents: parents.length,
    subjects: demoSubjects.length,
    classes: demoClasses.length,
    lessons: demoLessons.length,
    exams: demoExams.length,
    assignments: demoAssignments.length,
    results: demoResults.length,
    events: demoEvents.length,
    announcements: demoAnnouncements.length,
  };
}
