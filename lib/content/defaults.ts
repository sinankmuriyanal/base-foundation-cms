import type { HeroSlide, PageText, Program, Project, SiteSettings, TeamMember } from "./types";

// The content of the original basefoundation.in site. Used to seed Firestore (scripts/seed-content.ts)
// and as the fallback when Firestore is empty or not configured (e.g. CI builds).

type Draft<T> = Omit<T, "id" | "order" | "published"> & { published?: boolean };

const legacy = (path: string) => `/legacy/img/${path}`;

export const DEFAULT_PROJECTS: Draft<Project>[] = [
  {
    slug: "school-visit",
    title: "School Visit",
    area: "Education",
    summary:
      "At Base Foundation, we are committed to ensuring every child in West Bengal has access to quality education. Through our School Visiting Program, we reach out to various villages, assessing school infrastructures and understanding the unique needs of each institution.",
    body: "Our dedicated team interacts with teachers and students and forms a strong connection with the local educational community.",
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
    blogCategory: "",
    image: legacy("kusumgachi-p-school-6.jpg"),
    imagePublicId: null,
    listImage: legacy("lambapara-primary-school-7.jpg"),
    listImagePublicId: null,
    showOnHome: false,
  },
  {
    slug: "madhyamik-sahayak",
    title: "Madhyamik Sahayak",
    area: "Education",
    summary:
      "A dedicated initiative designed for providing academic support to 10th-grade students. We understand the importance of this academic year in shaping a student's future, and we are here to assist them to handle it with confidence and excellence.",
    body: "",
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
    blogCategory: "",
    image: legacy("new/madhyamik-sahayok-class-2.jpg"),
    imagePublicId: null,
    listImage: legacy("new/madhyamik-sahayok-class-3.jpg"),
    listImagePublicId: null,
    showOnHome: false,
  },
  {
    slug: "base-classroom",
    title: "BASE Classrooms for Kids",
    area: "Education",
    summary:
      "Empowering rural children through structured learning that blends religious and material education, fostering critical thinking, literacy, and essential life skills for holistic growth.",
    body: "The first success of the Base Foundation was the inauguration of the Base Classroom Harharia Sub-Center. Each classroom gives children in the village a steady, structured place to learn.",
    highlights: [],
    blogCategory: "Base Classroom",
    image: legacy("project_1.jpg"),
    imagePublicId: null,
    listImage: legacy("english4.jpg"),
    listImagePublicId: null,
    showOnHome: true,
  },
  {
    slug: "teachcraft",
    title: "Project TeachCraft: Teachers' Training",
    area: "Training",
    summary:
      "Enhancing teaching quality through bi-monthly training sessions focused on modern pedagogy, classroom engagement, and subject-specific development for effective educational delivery.",
    body: "The BASE Foundation conducts teachers' training programs in different places to teach the pedagogy of effective teaching in and outside of the classes.",
    highlights: [],
    blogCategory: "Teachers' Training",
    image: legacy("Project_2.jpg"),
    imagePublicId: null,
    listImage: "",
    listImagePublicId: null,
    showOnHome: true,
  },
  {
    slug: "parenting",
    title: "Parenting Classes",
    area: "Community",
    summary:
      "Guiding parents on effective child development practices, emphasizing education, care, and home-based learning to reinforce the foundation built in BASE Classrooms.",
    body: "Through parenting workshops we raise awareness and share a newer, psychologically informed way for parents to nurture their children in modern times.",
    highlights: [],
    blogCategory: "",
    image: legacy("Project_3.jpg"),
    imagePublicId: null,
    listImage: "",
    listImagePublicId: null,
    showOnHome: true,
  },
  {
    slug: "english-academy",
    title: "BASE English Academy",
    area: "Education",
    summary:
      "Strengthening students' English proficiency through targeted coaching aligned with Board syllabi, improving comprehension, critical thinking, and exam performance.",
    body: "",
    highlights: [],
    blogCategory: "Language Mastery",
    image: legacy("Project_4.jpg"),
    imagePublicId: null,
    listImage: "",
    listImagePublicId: null,
    showOnHome: true,
  },
  {
    slug: "computer-academy",
    title: "BASE Computer Academy",
    area: "Education",
    summary:
      "Equipping senior students with essential digital literacy and advanced computer skills to thrive in academic, professional, and research-oriented environments.",
    body: "",
    highlights: [],
    blogCategory: "",
    image: legacy("Project_5.jpg"),
    imagePublicId: null,
    listImage: "",
    listImagePublicId: null,
    showOnHome: true,
  },
  {
    slug: "talent-hunt",
    title: "Talent Hunt",
    area: "Training",
    summary:
      "A project to connect with talented students of class 10th, 11th and 12th through a basic examination and certify them by BASE Foundation. As a prerequisite, a motivational class is run in selected schools.",
    body: "",
    highlights: [],
    blogCategory: "",
    image: legacy("new/motivation-class-at-rph-2.jpg"),
    imagePublicId: null,
    listImage: "",
    listImagePublicId: null,
    showOnHome: false,
  },
];

export const DEFAULT_PROGRAMS: Draft<Program>[] = [
  {
    label: "Skill development",
    title: "TEACHERS' TRAINING",
    text: "The BASE Foundation conducts teachers' training programs in different places to teach them the pedagogy of effective teaching in and outside of the classes.",
    link: "/programmes/teachcraft",
    image: legacy("new/madhyamik-sahayok-class-2.jpg"),
    imagePublicId: null,
  },
  {
    label: "Skill development",
    title: "TALENT HUNT",
    text: "A project to connect with the talented students of class 10th, 11th and 12th through a basic examination and certify them by BASE Foundation. As a prerequisite, a motivational class will be run in fixed schools.",
    link: "/programmes/talent-hunt",
    image: legacy("new/motivation-class-at-rph-2.jpg"),
    imagePublicId: null,
  },
  {
    label: "Skill development",
    title: "79th Indian Independence Day Celebration",
    text: "It marked the 79th Indian Independence Day. Base Foundation, Darul Fouz Education Centre, and Al-Fouz English Medium collaborated with Paikar Police Camp in the patriotic celebration. We presented a parade by scouts, a flower dance performance, and a special talk by the Assistant Superintendent of Police on the significance of religious unity that led the freedom struggle to the successful attainment of Independence on 15 August 1947.",
    link: "",
    image: legacy("program_4.jpg"),
    imagePublicId: null,
  },
  {
    label: "Skill development",
    title: "PARENTING WORKSHOP",
    text: "A project through which parenting awareness will be generated among the people and they will be taught a new psychological way to treat with their children; how to nurture them in this modern time.",
    link: "/programmes/parenting",
    image: legacy("new/madhyamik-sahayok-launching-event-1.jpg"),
    imagePublicId: null,
  },
];

export const DEFAULT_HERO_SLIDES: Draft<HeroSlide>[] = [
  {
    titleLine1: "Empowering Rural Lives,",
    titleLine2: "Building a Strong Foundation",
    titleBreak: false,
    subtitle:
      "Join us in our mission to empower rural communities and create a strong foundation for lasting change through education, upliftment, and a wide range of impactful activities.",
    buttonLabel: "Discover",
    buttonLink: "#about",
    layout: "left",
    image: legacy("Promo_4.jpg"),
    imagePublicId: null,
  },
  {
    titleLine1: "Our Helping",
    titleLine2: "around the world.",
    titleBreak: true,
    subtitle:
      "Experience the transformative power of community development as we work towards empowering rural lives, building a solid foundation through education, upliftment, and various empowering initiatives.",
    buttonLabel: "Discover",
    buttonLink: "#about",
    layout: "left",
    image: legacy("promo_2.jpg"),
    imagePublicId: null,
  },
  {
    titleLine1: "BASE Volounteers",
    titleLine2: "Around the world.",
    titleBreak: true,
    subtitle:
      "Together, let's make a difference by empowering rural communities through education, upliftment, and a diverse range of activities, building a strong foundation for a brighter future.",
    buttonLabel: "Discover",
    buttonLink: "#about",
    layout: "center",
    image: legacy("promo_2-2.jpg"),
    imagePublicId: null,
  },
];

export const DEFAULT_TEAM: Draft<TeamMember>[] = [
  { name: "Dr Munkir Hossain", role: "President", photo: legacy("new/team1.jpg"), photoPublicId: null },
  { name: "Abdul Nafih Hudawi", role: "Secretary", photo: legacy("new/team2.jpg"), photoPublicId: null },
  { name: "Sidheekul Akbar Hudawi", role: "Treasurer", photo: legacy("new/team3.jpg"), photoPublicId: null },
];

export const DEFAULT_SITE: SiteSettings = {
  email: "basefoundationwb@gmail.com",
  phone1: "+91 74785 73368",
  phone2: "+91 83718 26110",
  address: "Bhimpur, Birbhum, Paikar, WestBengal, 731219",
  bankAccountName: "",
  bankAccountNumber: "41554536104",
  bankIfsc: "SBIN0014061",
  bankName: "State Bank of India",
  bankBranch: "Nandigram",
  upiId: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
};

export const DEFAULT_PAGES: PageText = {
  homeAboutHeading1: "BASE Mission is",
  homeAboutHeading2: "Give for People",
  homeAboutLead:
    "The Base Foundation is a non-governmental organization dedicated to rural development through education and social welfare situated in West Bengal, Birbhum district, West Bengal. Since its establishment, our organization has been committed to empowering rural communities, enhancing educational opportunities, and improving the overall well-being of rural residents.",
  homeAboutBody:
    "At Base Foundation, we strive to address various societal challenges such as poverty, education, healthcare, and environmental sustainability. Our team of dedicated professionals and volunteers work tirelessly to implement innovative and sustainable solutions that uplift the lives of marginalized individuals and communities.\n\nThrough our collaborative efforts, we aim to create lasting change by providing education, vocational training, and skill development programs to empower individuals and enhance their employability. We also focus on improving healthcare services, ensuring access to clean water and sanitation, and promoting sustainable practices to protect the environment for future generations.",
  programsIntro:
    "Enriching lives through a range of impactful programs that promote career development, motivation, teacher training, and artistic expression.",
  mission:
    "Our mission is to uplift the rural population of West Bengal by providing quality education, fostering sustainable development, and promoting social welfare initiatives. We strive to create a positive and enabling environment that enables individuals to reach their full potential and contribute to the development of their community.",
  vision:
    "We envision a future where every individual in West Bengal has access to quality education, enjoys a high standard of living, and actively participates in community growth. Through our efforts, we aim to build a strong foundation for sustainable rural development and empower the rural population to lead prosperous lives.",
  joinIntro:
    "Empowering rural communities through education, upliftment and a diverse range of activities takes many hands. Volunteers and interns are at the heart of every BASE programme.",
  donateIntro:
    "Every contribution goes into classrooms, teacher training, exam support and community programmes for rural families in Birbhum and beyond.",
};

export function withMeta<T>(drafts: Draft<T>[], prefix: string): T[] {
  return drafts.map((d, order) => ({ ...d, id: `${prefix}-${order + 1}`, order, published: d.published ?? true }) as T);
}
