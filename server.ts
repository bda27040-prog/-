import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Camera Frame / Incident Analyzer Endpoint
app.post("/api/ai-analyze", async (req, res) => {
  try {
    const { imageBase64, cameraName, location, prompt, mimeType } = req.body;

    const systemInstruction = `أنت نظام خبير تحليل الفيديو الأمني الذكي للكاميرات (AI Vision Security Guard).
مهمتك تحليل لقطة الكاميرا أو وصف الحدث الأمني بدقة وتقديم تقرير أمني محترف باللغة العربية.
تضمن التقرير:
1. تقييم مستوى الخطر (عادي / متوسط / عالي / حرج).
2. الأجسام والمركبات والأشخاص المكتشفين.
3. التوصية والإجراء المطلوب (تفعيل الإنذار، فتح الاتصال الصوتي، حفظ التسجيل، لا يوجد إجراء).
4. ملخص مباشر باللغة العربية الواضحة.`;

    const userPrompt = prompt || `حلل لقطة الكاميرا التالية المسماة "${cameraName || "كاميرا مراقبة"}" في موقع "${location || "الموقع الرئيسي"}" واكتشف أي حركات أو أجسام أو مخاطر أمنية.`;

    let contents: any;

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || "image/jpeg",
              data: cleanBase64,
            },
          },
          { text: `${userPrompt}\n\nبيانات الكاميرا: ${cameraName || "الكاميرا 1"} - ${location || "الموقع"}` },
        ],
      };
    } else {
      contents = `${userPrompt}\n\nبيانات الكاميرا: ${cameraName || "الكاميرا 1"} - ${location || "الموقع"}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      analysis: response.text,
      cameraName,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Camera Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "حدث خطأ أثناء تحليل لقطة الكاميرا بواسطة الذكاء الاصطناعي.",
    });
  }
});

// AI Daily Security Briefing Endpoint
app.post("/api/ai-summary", async (req, res) => {
  try {
    const { events, cameraCount, sitesCount } = req.body;

    const eventsList = (events || []).map((e: any) => `- [${e.time}] ${e.cameraName} (${e.location}): ${e.type} - ${e.description}`).join("\n");

    const prompt = `أنت حارس أمني ذكي. قم بصياغة ملخص أمني يومي ملهم وموجز وبشكل نقاط احترافية باللغة العربية بناءً على البيانات التالية:
عدد الكاميرات النشطة: ${cameraCount || 6}
عدد المواقع: ${sitesCount || 2}
سجل التنبيهات والأحداث اليومية:
${eventsList || "لا توجد حركات مشبوهة اليوم، جميع الكاميرات تعمل بشكل ممتاز."}

اجعل التقرير يشمل:
- النسبة المئوية لاستقرار النظام.
- ملخص التهديدات أو الانتهاكات إن وجدت.
- نصيحة أمنية سريعة.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      summary: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AI Summary Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "فشل توليد التقرير الأمني اليومي.",
    });
  }
});

async function startServer() {
  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CCTV Security Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
