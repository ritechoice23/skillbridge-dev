-- CreateTable
CREATE TABLE "mentorship_request_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "request_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentorship_request_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mentorship_request_skills_request_id_skill_id_key" ON "mentorship_request_skills"("request_id", "skill_id");

-- CreateIndex
CREATE INDEX "mentorship_request_skills_skill_id_idx" ON "mentorship_request_skills"("skill_id");

-- AddForeignKey
ALTER TABLE "mentorship_request_skills" ADD CONSTRAINT "mentorship_request_skills_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "mentorship_requests"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mentorship_request_skills" ADD CONSTRAINT "mentorship_request_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- Backfill existing single-skill requests
INSERT INTO "mentorship_request_skills" ("id", "request_id", "skill_id")
SELECT gen_random_uuid(), "id", "skill_id" FROM "mentorship_requests" WHERE "skill_id" IS NOT NULL;

-- Drop single-skill column (requests now target many skills via the join table)
ALTER TABLE "mentorship_requests" DROP CONSTRAINT "mentorship_requests_skill_id_fkey";
ALTER TABLE "mentorship_requests" DROP COLUMN "skill_id";
