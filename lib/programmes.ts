import type { BlogCategory } from "./types";

export interface Programme {
  slug: string;
  title: string;
  area: "Education" | "Training" | "Community";
  summary: string;
  body?: string;
  highlights: { title: string; body: string }[];
  /** Blog category whose posts document this programme. */
  blogCategory?: BlogCategory;
  /** Photos from the original site (public/legacy/img): listing card and detail header. */
  listImage: string;
  image: string;
}

// Copy sourced from the original basefoundation.in pages (index, Education, School Visit, Madhyamik Sahayak).
export const PROGRAMMES: Programme[] = [
  {
    slug: "school-visit",
    listImage: "/legacy/img/lambapara-primary-school-7.jpg",
    image: "/legacy/img/kusumgachi-p-school-6.jpg",
    title: "School Visit",
    area: "Education",
    summary:
      "At Base Foundation, we are committed to ensuring every child in West Bengal has access to quality education. Through our School Visiting Program, we reach out to various villages, assessing school infrastructures and understanding the unique needs of each institution.",
    body:
      "Our dedicated team interacts with teachers and students and forms a strong connection with the local educational community.",
    highlights: [
      {
        title: "Infrastructure Assessment",
        body: "We meticulously evaluate the condition of school buildings, classrooms, sanitation facilities, and other essential amenities to identify areas that require improvement.",
      },
      {
        title: "Needs Analysis",
        body: "Understanding the specific needs of each school helps us to customize our support, whether it's through providing educational resources, enhancing facilities, or implementing specialized programs.",
      },
      {
        title: "Teacher and Student Engagement",
        body: "We believe in encouraging a supportive learning environment. Our team interacts with teachers and students to encourage a culture of active participation and continuous growth.",
      },
    ],
  },
  {
    slug: "madhyamik-sahayak",
    listImage: "/legacy/img/new/madhyamik-sahayok-class-3.jpg",
    image: "/legacy/img/new/madhyamik-sahayok-class-2.jpg",
    title: "Madhyamik Sahayak",
    area: "Education",
    summary:
      "A dedicated initiative designed for providing academic support to 10th-grade students. We understand the importance of this academic year in shaping a student's future, and we are here to assist them to handle it with confidence and excellence.",
    highlights: [
      {
        title: "Specially Designed Curriculum",
        body: "A curriculum covering the core subjects of 10th grade, with experienced tutors offering personalized guidance so students grasp concepts thoroughly.",
      },
      {
        title: "Interactive Sessions",
        body: "Engaging workshops, discussions, and hands-on activities create an interactive learning experience that goes beyond textbooks.",
      },
      {
        title: "Exam Preparation",
        body: "We equip students with effective study techniques, time-management skills, and resources to help them prepare for their board examinations.",
      },
    ],
  },
  {
    slug: "base-classroom",
    listImage: "/legacy/img/english4.jpg",
    image: "/legacy/img/project_1.jpg",
    title: "BASE Classrooms for Kids",
    area: "Education",
    summary:
      "Empowering rural children through structured learning that blends religious and material education, fostering critical thinking, literacy, and essential life skills for holistic growth.",
    body:
      "The first success of the Base Foundation was the inauguration of the Base Classroom Harharia Sub-Center. Each classroom gives children in the village a steady, structured place to learn.",
    highlights: [],
    blogCategory: "Base Classroom",
  },
  {
    slug: "teachcraft",
    listImage: "/legacy/img/Project_2.jpg",
    image: "/legacy/img/Project_2.jpg",
    title: "Project TeachCraft: Teachers' Training",
    area: "Training",
    summary:
      "Enhancing teaching quality through bi-monthly training sessions focused on modern pedagogy, classroom engagement, and subject-specific development for effective educational delivery.",
    body:
      "The BASE Foundation conducts teachers' training programs in different places to teach the pedagogy of effective teaching in and outside of the classes.",
    highlights: [],
    blogCategory: "Teachers' Training",
  },
  {
    slug: "english-academy",
    listImage: "/legacy/img/Project_4.jpg",
    image: "/legacy/img/Project_4.jpg",
    title: "BASE English Academy",
    area: "Education",
    summary:
      "Strengthening students' English proficiency through targeted coaching aligned with Board syllabi, improving comprehension, critical thinking, and exam performance.",
    highlights: [],
    blogCategory: "Language Mastery",
  },
  {
    slug: "computer-academy",
    listImage: "/legacy/img/Project_5.jpg",
    image: "/legacy/img/Project_5.jpg",
    title: "BASE Computer Academy",
    area: "Education",
    summary:
      "Equipping senior students with essential digital literacy and advanced computer skills to thrive in academic, professional, and research-oriented environments.",
    highlights: [],
  },
  {
    slug: "parenting",
    listImage: "/legacy/img/Project_3.jpg",
    image: "/legacy/img/Project_3.jpg",
    title: "Parenting Classes",
    area: "Community",
    summary:
      "Guiding parents on effective child development practices, emphasizing education, care, and home-based learning to reinforce the foundation built in BASE Classrooms.",
    body:
      "Through parenting workshops we raise awareness and share a newer, psychologically informed way for parents to nurture their children in modern times.",
    highlights: [],
  },
  {
    slug: "talent-hunt",
    listImage: "/legacy/img/new/motivation-class-at-rph-2.jpg",
    image: "/legacy/img/new/motivation-class-at-rph-2.jpg",
    title: "Talent Hunt",
    area: "Training",
    summary:
      "A project to connect with talented students of class 10th, 11th and 12th through a basic examination and certify them by BASE Foundation. As a prerequisite, a motivational class is run in selected schools.",
    highlights: [],
  },
];

export function getProgramme(slug: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.slug === slug);
}
