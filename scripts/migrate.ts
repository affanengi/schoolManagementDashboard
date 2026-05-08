import { db } from '../src/lib/firebase';
import { setDoc, doc } from 'firebase/firestore';
import {
  teachersData,
  studentsData,
  parentsData,
  subjectsData,
  classesData,
  lessonsData,
  examsData,
  assignmentsData,
  resultsData,
  eventsData,
  announcementsData
} from '../src/lib/data';

async function migrate() {
  try {
    console.log("Starting Firebase migration...");
    
    // Helper to upload array
    const uploadData = async (collectionName: string, dataArray: any[]) => {
      console.log(`Uploading ${collectionName}...`);
      let count = 0;
      for (const item of dataArray) {
        // Use custom id if available, or let firestore generate
        const id = item.id ? item.id.toString() : count.toString();
        // Remove undefined values to prevent Firestore errors
        const cleanItem = JSON.parse(JSON.stringify(item));
        await setDoc(doc(db, collectionName, id), cleanItem);
        count++;
      }
      console.log(`Finished ${collectionName}: ${count} records.`);
    };

    await uploadData("teachers", teachersData);
    await uploadData("students", studentsData);
    await uploadData("parents", parentsData);
    await uploadData("subjects", subjectsData);
    await uploadData("classes", classesData);
    await uploadData("lessons", lessonsData);
    await uploadData("exams", examsData);
    await uploadData("assignments", assignmentsData);
    await uploadData("results", resultsData);
    await uploadData("events", eventsData);
    await uploadData("announcements", announcementsData);

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error: any) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
