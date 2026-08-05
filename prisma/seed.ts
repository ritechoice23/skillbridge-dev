import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { hashPassword } from "../lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SKILLS = [
  "Web Development",
  "UI/UX Design",
  "Public Speaking",
  "Data Analysis",
  "Mobile Development",
  "Graphic Design",
  "Copywriting",
  "Photography",
  "Video Editing",
  "Project Management",
  "Career Coaching",
  "Sales Skills",
];

const DEMO_PASSWORD = "password123";

const MENTORS = [
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    bio: "Nine years building web apps for startups and enterprises. I mentor developers who want to level up their frontend craft.",
    experienceYears: 9,
    skills: ["Web Development", "UI/UX Design"],
  },
  {
    name: "James Okafor",
    email: "james@example.com",
    bio: "I help designers and product people build portfolios, sharpen visual skills, and ship better interfaces.",
    experienceYears: 7,
    skills: ["UI/UX Design", "Graphic Design"],
  },
  {
    name: "Amara Johnson",
    email: "amara@example.com",
    bio: "From spreadsheets to dashboards — I teach practical data analysis and career moves for analysts.",
    experienceYears: 6,
    skills: ["Data Analysis", "Career Coaching"],
  },
  {
    name: "Tunde Bakare",
    email: "tunde@example.com",
    bio: "I coach professionals on public speaking, presentation skills, and selling with confidence.",
    experienceYears: 11,
    skills: ["Public Speaking", "Sales Skills", "Career Coaching"],
  },
];

async function main() {
  const result = await prisma.$transaction(async (tx) => {
    for (const name of SKILLS) {
      await tx.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }

    const skills = await tx.skill.findMany();
    const skillIdByName = new Map(skills.map((s) => [s.name, s.id]));

    for (const mentor of MENTORS) {
      const user = await tx.user.upsert({
        where: { email: mentor.email },
        update: { name: mentor.name },
        create: {
          email: mentor.email,
          name: mentor.name,
        },
      });

      const passwordHash = await hashPassword(DEMO_PASSWORD);

      await tx.account.deleteMany({ where: { userId: user.id } });
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });

      const profile = await tx.mentorProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: mentor.bio,
          experienceYears: mentor.experienceYears,
        },
        create: {
          userId: user.id,
          bio: mentor.bio,
          experienceYears: mentor.experienceYears,
        },
      });

      await tx.mentorSkill.deleteMany({ where: { mentorProfileId: profile.id } });
      await tx.mentorSkill.createMany({
        data: mentor.skills.map((name) => ({
          mentorProfileId: profile.id,
          skillId: skillIdByName.get(name)!,
        })),
      });
    }

    return {
      users: await tx.user.count(),
      profiles: await tx.mentorProfile.count(),
      skills: await tx.skill.count(),
      mentorSkills: await tx.mentorSkill.count(),
      accounts: await tx.account.count(),
    };
  });

  console.log("Seed complete:", result);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
