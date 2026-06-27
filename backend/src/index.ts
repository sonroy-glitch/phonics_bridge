import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { withAccelerate } from "@prisma/extension-accelerate"
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import cron from 'node-cron'
import nodemailer from "nodemailer";
import fs from 'fs';
import Groq from "groq-sdk";
import multer from "multer";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();
const client = new Groq({apiKey: process.env.GROQ_API_KEY})
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL || "",
}).$extends(withAccelerate())
const app = express();
//nodemailer initialization 
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    },
});

//multer initialization
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => { 
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

app.use(cors())
app.use(express.json())
//routes - signin , signup , pronounciation api(azure/sppechace), analytics  
function generateTeacherCode(): string {
  return `TC${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

app.post('/signin',async(req:Request,res:Response):Promise<any>=>{
    const user_data:{email:string,password:string,teacher?:boolean}=req.body;
    try {
      const response=await prisma.user.findFirst({
        where:{email:user_data.email}
      })
      if (response){
      //signin
      const password_check= await bcrypt.compare(user_data.password,response.password)
      if (password_check){
        return res.status(200).json({
          "id":response.id,
          "email":response.email,
          "teacher_code":response.teacher_code,
          "teacher":response.teacher,
          "msg":"You have signed in"
        })
      }
      else{
        return res.status(404).json({"msg":"password is incorrect"})
      }
      }
      else{
        const hashedPassword=await bcrypt.hash(user_data.password,10)
        
        let teacherCode = generateTeacherCode();
        let existingUser = await prisma.user.findUnique({ where: { teacher_code: teacherCode } });
        while (existingUser) {
          teacherCode = generateTeacherCode();
          existingUser = await prisma.user.findUnique({ where: { teacher_code: teacherCode } });
        }

        const response=await prisma.user.create({
          data:{
            email:user_data.email,
            password:hashedPassword,
            teacher_code:teacherCode,
            teacher:user_data.teacher ?? false
          }
        })
        return res.status(200).json({
          "id":response.id,
          "email":response.email,
          "teacher_code":response.teacher_code,
          "teacher":response.teacher,
          "msg":"User created"
        })
        //signup

      }
    } catch (error) {
      //returns the error 
      return res.status(500).json({"msg":"Something's up with the server",error})
    }
})

app.post('/student-register', async (req: Request, res: Response): Promise<any> => {
  const { name, roleNumber, teacherCode } = req.body;
  if (!name || !teacherCode ) {
    return res.status(400).json({ msg: "name and teacherCode are required" });
  }

  try {
    const teacher = await prisma.user.findUnique({
      where: { teacher_code: teacherCode }
    });
    if (!teacher) {
      return res.status(400).json({ msg: "Invalid teacher code. Teacher not found." });
    }

    const student = await prisma.student.create({
      data: {
        name,
        roll_number: roleNumber || "",
        code: teacherCode
      }
    });

    return res.status(200).json({
      id: student.id,
      name: student.name,
      role_number: student.roll_number,
      teacher_code: student.code,
      msg: "Student registered successfully"
    });
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong during student registration", error });
  }
});

app.get('/find-student', async (req: Request, res: Response): Promise<any> => {
  const rollNumber = req.query.rollNumber as string;
  const teacherCode = req.query.teacherCode as string;

  if (!rollNumber || !teacherCode) {
    return res.status(400).json({ msg: "rollNumber and teacherCode query params are required" });
  }
  try {
    const student = await prisma.student.findFirst({
      where: {
        roll_number: {
          equals: rollNumber,
          mode: 'insensitive'
        },
        code: teacherCode
      }
    });

    if (!student) {
      return res.status(404).json({ msg: "Student not found. Please check your roll number and teacher code." });
    }

    return res.status(200).json({
      id: student.id,
      name: student.name,
      role_number: student.roll_number,
      teacher_code: student.code
    });
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong", error });
  }
});

app.get('/teacher-students', async (req: Request, res: Response): Promise<any> => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ msg: "userId query param is required" });
  }

  try {
    const teacher = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!teacher) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    const students: any = await prisma.student.findMany({
      where: { code: teacher.teacher_code },
      include: {
        assessment: {
          orderBy: { time_created: 'desc' }
        }
      }
    });

    const result = students.map((s: any) => {
      const sessionCount = s.assessment.length;
      const lastSessionTime = sessionCount > 0 ? s.assessment[0].time_created : null;
      return {
        id: s.id,
        name: s.name,
        roleNumber: s.roll_number,
        teacherId: s.code,
        practiceStreak: 0,
        totalPracticeDays: new Set(s.assessment.map((a: any) => a.time_created.toISOString().split('T')[0])).size,
        totalPracticeSessions: sessionCount,
        lastSessionTime,
        createdAt: s.time_created.toISOString()
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ msg: "Something went wrong fetching teacher students", error });
  }
})
//three practice sets 
//user-likely paragrpah generation()
//empty text box (by default a text)
function sysIns(context:string){
  const systemInstructions=`
  You are a paragraph generator for a phonics app, in which your paragraph would be read by users and the phonics would be analyzed with that voice.
  Output should be in this format-
  {
    "text1": "this is the first paragraph",
    "focus_words_1":[],
    "text2": "this is the second paragraph",  
    "focus_words_2":[],
    "text3": "this is the third paragraph",   
    "focus_words_3":[], 
  }
  No markdown in the output.Also provide focus words for each text paragraph. Focus Words are the words that the users needs to focus more on during 
  dictation.Also there is a user choice for the paragraph generation , if it empty string, then dont consider it.Each paragraph must be of 20 words.
  Each paragraph should contain two sentences.
  ${context}
  `
  return systemInstructions
}
app.post("/generate-sentence",async(req:Request,res:Response)=>{
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    const {choice}=req.body;
    const instruction=sysIns(choice)
    const completion =await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:instruction,
      },
    ],
    temperature: 1,
    max_completion_tokens: 200,
    top_p: 1,
    stream: true,
    stop: null,
  });
  
  for await (const chunk of completion){
    res.write(chunk.choices[0]?.delta?.content)
  }
 res.end()
})

function pronounciationSysIns(azure_output:any){
  const sysIns=`
  You are Phonics Bridge Engine, an AI phonics assessment system.
  You receive structured pronunciation assessment output from an upstream pronunciation service after a student reads aloud.
  Your task is to analyze pronunciation errors and return a simplified phonics assessment.
  You must output ONLY:
  {
    "error_words": [],
    "error_types": [],
    "analysis": ""
  }
  INPUT FORMAT
  Input comes in this structure:
  {
  "success": true,
  "recognizedText": "...",
  "scores": {
    "accuracy": 97,
    "fluency": 92,
    "completeness": 98,
    "pronunciation": 94.2
  },
  "words":[
    {
        "word":"Curiosity",

        "accuracyScore":42,

        "errorType":"Mispronunciation",

        "phonemes":[
          {
            "phoneme":"",
            "accuracyScore":47
          }
        ]
    }
  ]
  }
  Use:
  -overall scores
  -per-word accuracy
  -error labels
  -phoneme scores
  -to determine phonics difficulties.

  Output Rules-
  -No extra text.
  -No markdown.
  -No explanation outside JSON.

  FIELD RULES
    1. error_words
    Include words where pronunciation difficulty exists.

    Add a word if:

    errorType != "None"
    OR

    accuracyScore < 80
    Ignore words with score ≥ 80 unless explicitly marked as errors.

    Example:

    "error_words":[
      "Curiosity",
      "resilient"
    ]
    2. error_types
    Convert pronunciation issues into child-friendly phonics categories.

    Use ONLY these categories:

    V/W Confusion
    TH Sounds
    Long vs Short Vowels
    Blends and Clusters
    Silent Letters
    R Sounds
    L/R Confusion
    Stress in Long Words
    Ending Sounds
    Missing Sounds
    Extra Sounds
    Vowel Sounds
    Multi-Syllable Words
    Consonant Sounds
    Word Stress
    
    Mapping examples:

    1.Low score on long words:
    Examples:
    curiosity
    resilient
    experimentation
    Multi-Syllable Words
    Word Stress
    Stress in Long Words

    2.Missing ending sounds
    Ending Sounds
    Missing Sounds

    3.Blend simplification
    Examples:
    school → cool
    stop → top
    Blends and Clusters

    4.TH substitutions
    Examples:
    the → de
    think → tink
    TH Sounds

    5.V/W substitutions
    Examples:
    vine ↔ wine
    V/W Confusion

    6.Vowel substitutions
    Examples:
    sit → seat
    bed → bad
    Long vs Short Vowels
    Vowel Sounds
  3. analysis
  Write feedback for a 4th grade student.

  Rules:
  -Maximum 2–3 sentences
  -Simple vocabulary
  -Encouraging tone
  -Never mention scores
  -Never say “failure”, “poor”, “weak”
  -Focus on practice
  
  Good example:
  You read most words very well. Some longer words were harder because they have many parts and tricky stress patterns. Practice saying long words slowly and breaking them into smaller parts.
  Bad example:

  ❌ Student shows multisyllabic articulation deficit.

  ❌ Stress transfer issue detected.


  Response from pronounciation service-
  ${azure_output}

  `
  return sysIns
}
//pronounciation-service
app.post("/pronounciation-service",upload.single('audio'),async(req:Request,res:Response):Promise<any>=>{
  const audio=req.file;
  console.log(audio)

  if(!audio){
    return res.status(400).json({"msg":"You should attach a file"})
  }
  const referenceText= req.header("referenceText")
  const language =req.header('language')
  const userId=req.header('userId')
  const studentId=req.header('studentId')

  if (!referenceText){
    fs.unlinkSync(audio.path)
    return res.status(401).json({"msg":"No reference text was provided"})
  }
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_KEY || "",
    process.env.AZURE_REGION || "centralindia"
  );
  speechConfig.speechRecognitionLanguage = language || "en-US";
  const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(audio.path));
  const pronunciationAssessmentConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true
    );
//webm
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationAssessmentConfig.applyTo(recognizer);
  try {
    const result = await new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          (result: sdk.SpeechRecognitionResult) => {
            recognizer.close();
            resolve(result);
          },
          (err: string) => {
            recognizer.close();
            reject(new Error(err));
          }
        );
      });
    fs.unlinkSync(audio.path)
    if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        const pronunciationResult = sdk.PronunciationAssessmentResult.fromResult(result);
        const detailResult = pronunciationResult.detailResult as any;
      const completion =await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:pronounciationSysIns({
          success: true,
          recognizedText: result.text,
          scores: {
            accuracy: pronunciationResult.accuracyScore,
            fluency: pronunciationResult.fluencyScore,
            completeness: pronunciationResult.completenessScore,
            pronunciation: pronunciationResult.pronunciationScore,
          },
          words: detailResult?.Words?.map((word: any) => ({
            word: word.Word,
            accuracyScore: word.PronunciationAssessment?.AccuracyScore,
            errorType: word.PronunciationAssessment?.ErrorType,
            phonemes: word.Phonemes?.map((p: any) => ({
              phoneme: p.Phoneme,
              accuracyScore: p.PronunciationAssessment?.AccuracyScore,
            })),
          })) ?? [],
        }),
        },
      ],
      temperature: 1,
      max_completion_tokens: 2000,
      top_p: 1,
      stream: false,
      stop: null,
      });

      const rawContent = completion.choices[0]?.message.content || "";
      let llmAnalysis = rawContent;
      let llmErrors = "";
      try {
        const parsedLLM = JSON.parse(rawContent);
        llmAnalysis = parsedLLM.analysis || rawContent;
        llmErrors = JSON.stringify(parsedLLM.error_types || []);
      } catch (e) {
        // Not JSON
      }

      const wordsJSON = JSON.stringify(
        detailResult?.Words?.map((word: any) => ({
          word: word.Word,
          accuracyScore: word.PronunciationAssessment?.AccuracyScore,
          errorType: word.PronunciationAssessment?.ErrorType,
          phonemes: word.Phonemes?.map((p: any) => ({
            phoneme: p.Phoneme,
            accuracyScore: p.PronunciationAssessment?.AccuracyScore,
          })),
        })) ?? []
      );

      if (studentId) {
        await prisma.assessmentStudent.create({
          data: {
            accuracy: pronunciationResult.accuracyScore,
            fluency: pronunciationResult.fluencyScore,
            completeness: pronunciationResult.completenessScore,
            pronunciation: pronunciationResult.pronunciationScore,
            words: wordsJSON,
            analysis: llmAnalysis,
            error: llmErrors,
            student_id: studentId
          }
        });
      } else {
        await prisma.assessment.create({
          data: {
            accuracy: pronunciationResult.accuracyScore,
            fluency: pronunciationResult.fluencyScore,
            completeness: pronunciationResult.completenessScore,
            pronunciation: pronunciationResult.pronunciationScore,
            words: wordsJSON,
            analysis: llmAnalysis,
            error: llmErrors,
            user_id: userId || ""
          }
        });
      }

      return res.status(200).json({
        "data": rawContent,
        "scores": {
          "accuracy": pronunciationResult.accuracyScore,
          "fluency": pronunciationResult.fluencyScore,
          "completeness": pronunciationResult.completenessScore,
          "pronunciation": pronunciationResult.pronunciationScore,
        },
        "words": detailResult?.Words?.map((word: any) => ({
          word: word.Word,
          accuracyScore: word.PronunciationAssessment?.AccuracyScore,
          errorType: word.PronunciationAssessment?.ErrorType,
        })) ?? []
      });
        
    }
    else{
      return res.status(422).json({
          success: false,
          reason: sdk.ResultReason[result.reason],
          details: result.errorDetails ?? 'Speech not recognized',
        });
    }
  } catch (error) {
    // fs.unlinkSync(audio.path)
    return res.status(505).json({"msg":"Something is up with the server",error})
  }
  
})
// GET /improved_words?userId=<id>
// Returns words the user has practiced and improved on across sessions.
// A word is considered "improved" if its latest accuracy is higher than its first recorded accuracy.
app.get("/improved_words", async (req: Request, res: Response): Promise<any> => {
  const userId = req.query.userId as string;
  const studentId = req.query.studentId as string;

  if (!userId && !studentId) {
    return res.status(400).json({ msg: "userId or studentId query param is required" });
  }

  try {
    let assessments;
    if (studentId) {
      assessments = await prisma.assessmentStudent.findMany({
        where: { student_id: studentId },
        orderBy: { time_created: "asc" },
      });
    } else {
      assessments = await prisma.assessment.findMany({
        where: { user_id: userId },
        orderBy: { time_created: "asc" },
      });
    }

    if (assessments.length === 0) {
      return res.status(200).json({ improved_words: [] });
    }

    // Build a map: word → [{accuracyScore, session_time_created}]
    const wordHistory: Record<string, { accuracyScore: number; time_created: Date }[]> = {};

    for (const assessment of assessments) {
      if (!assessment.words) continue;

      let parsedWords: any[];
      try {
        parsedWords = JSON.parse(assessment.words);
      } catch {
        continue; // skip malformed entries
      }

      for (const w of parsedWords) {
        const word: string = (w.word ?? "").toLowerCase().trim();
        const accuracyScore: number = w.accuracyScore ?? 0;
        const errorType: string = w.errorType ?? "None";

        if (!word) continue;
        // Only track words that have had at least one error at some point
        if (errorType === "None" && accuracyScore === 100) continue;

        if (!wordHistory[word]) wordHistory[word] = [];
        wordHistory[word].push({ accuracyScore, time_created: assessment.time_created });
      }
    }

    // A word is "improved" if its latest accuracy > its first recorded accuracy
    const improved_words = Object.entries(wordHistory)
      .filter(([, history]) => {
        if (history.length < 2) return false;
        const first = history[0]?.accuracyScore;
        const latest = history[history.length - 1]?.accuracyScore;
        return latest! > first!;
      })
      .map(([word, history]) => ({
        word,
        first_accuracy: Math.round(history[0]!.accuracyScore),
        latest_accuracy: Math.round(history[history.length - 1]!.accuracyScore),
        improvement: Math.round(history[history.length - 1]!.accuracyScore - history[0]!.accuracyScore),
        sessions_practiced: history.length,
        history: history.map((h) => ({
          accuracyScore: Math.round(h.accuracyScore),
          time_created: h.time_created,
        })),
      }))
      .sort((a, b) => b.improvement - a.improvement); // most improved first

    return res.status(200).json({ improved_words });
  } catch (error) {
    return res.status(500).json({ msg: "Something's up with the server", error });
  }
});

// GET /analytics?userId=<id>
// Returns per-session score history and aggregated stats for the progress dashboard.
app.get("/analytics", async (req: Request, res: Response): Promise<any> => {
  const userId = req.query.userId as string;
  const studentId = req.query.studentId as string;

  if (!userId && !studentId) {
    return res.status(400).json({ msg: "userId or studentId query param is required" });
  }

  try {
    let assessments;
    if (studentId) {
      assessments = await prisma.assessmentStudent.findMany({
        where: { student_id: studentId },
        orderBy: { time_created: "asc" },
      });
    } else {
      assessments = await prisma.assessment.findMany({
        where: { user_id: userId },
        orderBy: { time_created: "asc" },
      });
    }

    if (assessments.length === 0) {
      return res.status(200).json({
        total_sessions: 0,
        average_scores: { accuracy: 0, fluency: 0, completeness: 0, pronunciation: 0 },
        session_history: [],
        streak: 0,
        total_practice_days: 0,
      });
    }

    // Per-session history (for charts)
    const session_history = assessments.map((a, index) => ({
      session: index + 1,
      time_created: a.time_created,
      accuracy: a.accuracy ?? 0,
      fluency: a.fluency ?? 0,
      completeness: a.completeness ?? 0,
      pronunciation: a.pronunciation ?? 0,
    }));

    const total_sessions = assessments.length;

    // Aggregate averages
    const sum = assessments.reduce(
      (acc, a) => ({
        accuracy: acc.accuracy + (a.accuracy ?? 0),
        fluency: acc.fluency + (a.fluency ?? 0),
        completeness: acc.completeness + (a.completeness ?? 0),
        pronunciation: acc.pronunciation + (a.pronunciation ?? 0),
      }),
      { accuracy: 0, fluency: 0, completeness: 0, pronunciation: 0 }
    );

    const average_scores = {
      accuracy: Math.round((sum.accuracy / total_sessions) * 10) / 10,
      fluency: Math.round((sum.fluency / total_sessions) * 10) / 10,
      completeness: Math.round((sum.completeness / total_sessions) * 10) / 10,
      pronunciation: Math.round((sum.pronunciation / total_sessions) * 10) / 10,
    };

    // Unique practice days
    const uniqueDays = new Set(
      assessments.map((a) => new Date(a.time_created).toISOString().split("T")[0])
    );
    const total_practice_days = uniqueDays.size;

    // Current streak — count consecutive days up to today
    const sortedDays = Array.from(uniqueDays).sort();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = new Date(sortedDays[i]!);
      const diffDays = Math.round(
        (today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === sortedDays.length - 1 - i) {
        streak++;
      } else {
        break;
      }
    }

    // Best and latest scores
    const latest = session_history[session_history.length - 1];
    const best_pronunciation = Math.max(...assessments.map((a) => a.pronunciation ?? 0));

    const errorCounts: Record<string, number> = {};
    for (const a of assessments) {
      if (!a.error) continue;
      try {
        const errorTypes: string[] = JSON.parse(a.error);
        for (const type of errorTypes) {
          errorCounts[type] = (errorCounts[type] || 0) + 1;
        }
      } catch {
        // Skip malformed
      }
    }

    const weak_sounds = Object.entries(errorCounts).map(([name, count]) => {
      let description = `Practice distinguishing the ${name} sounds`;
      let status = count > 5 ? 'needs-work' : 'improving';
      return {
        id: name.toLowerCase().replace(/[^a-z]/g, ''),
        name,
        description,
        errorCount: count,
        lastSeen: 'Recently',
        status
      };
    }).sort((a, b) => b.errorCount - a.errorCount);

    return res.status(200).json({
      total_sessions,
      total_practice_days,
      streak,
      average_scores,
      best_pronunciation: Math.round(best_pronunciation * 10) / 10,
      latest_scores: {
        accuracy: latest?.accuracy,
        fluency: latest?.fluency,
        completeness: latest?.completeness,
        pronunciation: latest?.pronunciation,
      },
      session_history,
      weak_sounds,
    });
  } catch (error) {
    return res.status(500).json({ msg: "Something's up with the server", error });
  }
});

app.get("/sessions", async (req: Request, res: Response): Promise<any> => {
  const userId = req.query.userId as string;
  const studentId = req.query.studentId as string;

  if (!userId && !studentId) {
    return res.status(400).json({ msg: "userId or studentId query param is required" });
  }

  try {
    let sessions;
    if (studentId) {
      sessions = await prisma.assessmentStudent.findMany({
        where: { student_id: studentId },
        orderBy: { time_created: "desc" },
      });
    } else {
      sessions = await prisma.assessment.findMany({
        where: { user_id: userId },
        orderBy: { time_created: "desc" },
      });
    }

    return res.status(200).json({ sessions });
  } catch (error) {
    return res.status(500).json({ msg: "Failed to fetch sessions", error });
  }
});

app.post("/chat", async (req: Request, res: Response): Promise<any> => {
  const { messages, studentId, userId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ msg: "messages array is required" });
  }

  try {
    let performanceSummary = "";
    
    if (studentId || userId) {
      let assessments;
      if (studentId) {
        assessments = await prisma.assessmentStudent.findMany({
          where: { student_id: studentId },
          orderBy: { time_created: "desc" },
          take: 10,
        });
      } else {
        assessments = await prisma.assessment.findMany({
          where: { user_id: userId },
          orderBy: { time_created: "desc" },
          take: 10,
        });
      }

      if (assessments.length > 0) {
        const errorCounts: Record<string, number> = {};
        let totalAccuracy = 0;
        for (const a of assessments) {
          totalAccuracy += a.accuracy ?? 0;
          if (a.error) {
            try {
              const errorTypes: string[] = JSON.parse(a.error);
              for (const type of errorTypes) {
                errorCounts[type] = (errorCounts[type] || 0) + 1;
              }
            } catch {}
          }
        }
        const avgAcc = Math.round(totalAccuracy / assessments.length);
        const weakSounds = Object.entries(errorCounts)
          .map(([name, count]) => `${name} (${count} errors)`)
          .join(", ");

        performanceSummary = `
Here is the user's recent performance data from their last ${assessments.length} sessions:
- Average pronunciation accuracy: ${avgAcc}%
- Weak/troublesome sounds detected: ${weakSounds || "None detected yet"}
- Total practice sessions: ${assessments.length}
`;
      }
    }

    const systemPrompt = `You are Phonics Bridge Tutor, a friendly, encouraging AI phonics coach for students and teachers. 
Your goal is to help them understand their pronunciation errors, give tips on how to produce specific sounds, suggest words to practice, and keep them motivated.

Keep your answers relatively concise, warm, and easy to understand (especially if talking to a student). Use phonics notations like /sh/ or /th/ when referencing sounds.
${performanceSummary ? `\nUse this context about the user's performance to answer their questions:\n${performanceSummary}` : ""}
Always speak directly to the user. Provide practical pronunciation tips, mouth positioning guidance (e.g. "put your tongue between your teeth for the /th/ sound"), or encouragement.`;

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const stream = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      temperature: 0.7,
      max_completion_tokens: 1000,
      stream: true,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();

  } catch (error) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ msg: "Something went wrong in the chat service", error });
    }
    res.end();
  }
});
//[1,2,3,4]
//add a reminder cron_job
// mail + scheduler 
//rsounak55 gmail.com
cron.schedule("*/30 * * * *",async()=>{
  const response= await prisma.user.findMany({})
  response.map(async(item:any)=>{
    const name = item.email.split("@")[0]
    const info = await transporter.sendMail({
  from: '"Phonics Engine"',
  to:`${item.email}`,
  subject: `Reminder to take the assessment`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keep Building Strong Reading Skills!</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
        }

        table {
            border-spacing: 0;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }
    </style>
</head>

<body>

    <!-- Hidden Preview Text -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Keep practicing and continue building stronger reading skills every day.
    </div>

    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color:#f4f6f8;"
    >
        <tr>
            <td align="center" style="padding:40px 20px;">

                <!-- Main Container -->
                <table
                    role="presentation"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        background-color:#ffffff;
                        border-radius:10px;
                        overflow:hidden;
                    "
                >

                    <!-- Header -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background-color:#2563eb;
                                padding:32px;
                            "
                        >
                            <h1
                                style="
                                    margin:0;
                                    color:#ffffff;
                                    font-size:28px;
                                    font-weight:bold;
                                "
                            >
                                Keep Building Strong Reading Skills!
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding:40px;">

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                    margin-top:0;
                                "
                            >
                                Hello ${name},
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Every reading session is an opportunity to build stronger phonics skills, improve pronunciation, and grow confidence as a reader.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Regular practice helps reinforce sound-letter relationships, improve word recognition, and develop reading fluency over time. Even a few minutes of focused reading each day can make a meaningful difference.
                            </p>

                            <!-- Highlight Box -->
                            <table
                                role="presentation"
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    margin:30px 0;
                                "
                            >
                                <tr>
                                    <td
                                        style="
                                            background:#eff6ff;
                                            border-left:4px solid #2563eb;
                                            padding:20px;
                                        "
                                    >
                                        <p
                                            style="
                                                margin:0;
                                                color:#1e3a8a;
                                                font-size:15px;
                                                line-height:1.8;
                                            "
                                        >
                                            <strong>Why keep practicing?</strong>
                                            <br><br>
                                            • Strengthen phonics and decoding skills<br>
                                            • Improve pronunciation and word recognition<br>
                                            • Build confidence while reading aloud<br>
                                            • Track progress and celebrate growth over time
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                Consistent practice is one of the most effective ways to become a stronger reader. We encourage you to continue your learning journey and make reading a part of your daily routine.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                "
                            >
                                We look forward to seeing your progress continue and celebrating your reading achievements along the way.
                            </p>

                            <p
                                style="
                                    font-size:16px;
                                    line-height:1.7;
                                    color:#333333;
                                    margin-bottom:0;
                                "
                            >
                                Happy Learning,
                                <br>
                                <strong>The PhonicsFlow Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding:0 40px;">
                            <hr
                                style="
                                    border:none;
                                    border-top:1px solid #e5e7eb;
                                "
                            >
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            align="center"
                            style="
                                background:#fafafa;
                                padding:24px;
                            "
                        >
                            <p
                                style="
                                    margin:0;
                                    color:#6b7280;
                                    font-size:13px;
                                    line-height:1.6;
                                "
                            >
                                This is an automated reminder from the Phonics Bridge Engine.
                            </p>

                            <p
                                style="
                                    margin-top:8px;
                                    color:#9ca3af;
                                    font-size:12px;
                                "
                            >
                                © 2026 PhonicsFlow Engine. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>

</body>
</html>`
});

  })
})




const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
