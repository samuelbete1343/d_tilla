/**
 * lib/courseCatalogue.ts
 *
 * Static course catalogue — single source of truth for display metadata.
 * These are the frontend display records only.
 * Backend Course PKs are resolved at checkout time via /api/courses/ slug→pk map.
 *
 * Previously split across Courses.tsx and EntranceCourses.tsx (both deleted).
 * Now a standalone data module with no component code or routing logic.
 */

export interface CourseCatalogItem {
  id: string;       // frontend code e.g. 'FLEn-1011' — used for cart selection
  name: string;
  semester?: number;
  category: string;
  image: string;
  price?: number;
}

// ---------------------------------------------------------------------------
// Freshman / University courses
// ---------------------------------------------------------------------------

export const ALL_COURSES: CourseCatalogItem[] = [
  { id: 'FLEn-1011', name: 'Communicative English Skills I',  semester: 1, category: 'Common',         image: '/images/Courses-Profile/Communicative English Skills I.png' },
  { id: 'Phys-1011', name: 'General Physics',                  semester: 1, category: 'Natural Science', image: '/images/Courses-Profile/General Physics.png' },
  { id: 'Psyc-1011', name: 'General Psychology',               semester: 1, category: 'Common',         image: '/images/Courses-Profile/General Psychology.png' },
  { id: 'Math-1011', name: 'Mathematics for Natural Sciences',  semester: 1, category: 'Natural Science', image: '/images/Courses-Profile/Mathematics for Natural Sciences.png' },
  { id: 'LoCT-1011', name: 'Critical Thinking',                semester: 1, category: 'Common',         image: '/images/Courses-Profile/Critical Thinking.png' },
  { id: 'SpSc-1011', name: 'Physical Fitness',                 semester: 1, category: 'Common',         image: '/images/Courses-Profile/Physical Fitness.png' },
  { id: 'GeES-1011', name: 'Geography of Ethiopia',            semester: 1, category: 'Common',         image: '/images/Courses-Profile/Geography of Ethiopia.png' },
  { id: 'Hist-1023', name: 'History of Ethiopia',              semester: 2, category: 'Common',         image: '/images/Courses-Profile/History of Ethiopia.png' },
  { id: 'MCiE-1012', name: 'Moral and Civic Education',        semester: 2, category: 'Common',         image: '/images/Courses-Profile/Moral and Civic Education.png' },
  { id: 'FLEn-1012', name: 'Communicative English Skills II',  semester: 2, category: 'Common',         image: '/images/Courses-Profile/Communicative English Skills II.png' },
  { id: 'Anth-1012', name: 'Social Anthropology',              semester: 2, category: 'Common',         image: '/images/Courses-Profile/Social Anthropology.png' },
  { id: 'ECEg-1052', name: 'Computer Programming',             semester: 2, category: 'Engineering',    image: '/images/Courses-Profile/Computer Programming.png' },
  { id: 'Math-1041', name: 'Applied Mathematics I',            semester: 2, category: 'Engineering',    image: '/images/Courses-Profile/Applied Mathematics I.png' },
  { id: 'EmTe-1012', name: 'Emerging Technologies',            semester: 2, category: 'Common',         image: '/images/Courses-Profile/Emerging Technologies.png' },
  { id: 'MGMT-1012', name: 'Entrepreneurship',                 semester: 2, category: 'Common',         image: '/images/Courses-Profile/Entrepreneurship.png' },
  { id: 'ECON-2071', name: 'Introduction to Economics',        semester: 2, category: 'Social Science', image: '/images/Courses-Profile/Introduction to Economics.png' },
  { id: 'IRGT-2011', name: 'Global Trends',                    semester: 2, category: 'Common',         image: '/images/Courses-Profile/Global Trends.png' },
];

// ---------------------------------------------------------------------------
// Entrance exam courses
// ---------------------------------------------------------------------------

export const ENTRANCE_COURSES: CourseCatalogItem[] = [
  { id: 'ENT-PHYS',     name: 'Physics',                     category: 'Natural Science', image: '/images/Courses-Profile/General Physics.png' },
  { id: 'ENT-MATH-NAT', name: 'Mathematics',                 category: 'Natural Science', image: '/images/Courses-Profile/Mathematics for Natural Sciences.png' },
  { id: 'ENT-CHEM',     name: 'Chemistry',                   category: 'Natural Science', image: '/images/Courses-Profile/General Physics.png' },
  { id: 'ENT-BIOL',     name: 'Biology',                     category: 'Natural Science', image: '/images/Courses-Profile/General Physics.png' },
  { id: 'ENT-ENGL',     name: 'English',                     category: 'Common',          image: '/images/Courses-Profile/Communicative English Skills I.png' },
  { id: 'ENT-APT',      name: 'Scholastic Aptitude Test',    category: 'Common',          image: '/images/Courses-Profile/Critical Thinking.png' },
  { id: 'ENT-CIV',      name: 'Civics and Ethical Education',category: 'Common',          image: '/images/Courses-Profile/Moral and Civic Education.png' },
  { id: 'ENT-MATH-SOC', name: 'Mathematics',                 category: 'Social Science',  image: '/images/Courses-Profile/Mathematics for Natural Sciences.png' },
  { id: 'ENT-GEOG',     name: 'Geography',                   category: 'Social Science',  image: '/images/Courses-Profile/Geography of Ethiopia.png' },
  { id: 'ENT-HIST',     name: 'History',                     category: 'Social Science',  image: '/images/Courses-Profile/History of Ethiopia.png' },
  { id: 'ENT-ECON',     name: 'Economics',                   category: 'Social Science',  image: '/images/Courses-Profile/Introduction to Economics.png' },
];
