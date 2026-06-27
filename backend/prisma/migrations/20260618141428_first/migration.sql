-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "teacher" BOOLEAN NOT NULL DEFAULT false,
    "teacher_code" TEXT NOT NULL,
    "time_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "fluency" DOUBLE PRECISION,
    "completeness" DOUBLE PRECISION,
    "pronunciation" DOUBLE PRECISION,
    "error" TEXT,
    "words" TEXT,
    "analysis" TEXT,
    "time_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentStudent" (
    "id" TEXT NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "fluency" DOUBLE PRECISION,
    "completeness" DOUBLE PRECISION,
    "pronunciation" DOUBLE PRECISION,
    "error" TEXT,
    "words" TEXT,
    "analysis" TEXT,
    "time_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,

    CONSTRAINT "AssessmentStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roll_number" TEXT NOT NULL DEFAULT '',
    "code" TEXT NOT NULL,
    "time_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_teacher_code_key" ON "User"("teacher_code");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentStudent" ADD CONSTRAINT "AssessmentStudent_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_code_fkey" FOREIGN KEY ("code") REFERENCES "User"("teacher_code") ON DELETE RESTRICT ON UPDATE CASCADE;
