
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "سؤال باللغة العربية يطلب إكمال جملة ألمانية أو الإجابة على سؤال متعلق بها. يجب أن تحتوي الجملة الألمانية على فراغ '___'.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "أربع خيارات باللغة الألمانية.",
    },
    correctAnswer: {
      type: Type.STRING,
      description: "الإجابة الصحيحة من الخيارات الأربعة.",
    },
  },
  required: ["question", "options", "correctAnswer"],
};

export const generateQuestions = async (count: number, existingQuestions: string[]): Promise<Question[]> => {
  try {
    const prompt = `
    أنت خبير في تدريس اللغة الألمانية للناطقين بالعربية. مهمتك هي إنشاء أسئلة اختبار فريدة للمستوى B1.
    أنشئ مصفوفة JSON تحتوي على ${count} سؤال فريد.
    تجنب تكرار هذه الأسئلة: ${JSON.stringify(existingQuestions)}.
    
    القواعد:
    1.  يجب أن يكون المحتوى الألماني في مستوى B1 CEFR بدقة.
    2.  يجب أن يكون حقل "question" عبارة عن تعليمات باللغة العربية، تليها الجملة الألمانية. مثال: "اختر الكلمة الصحيحة لإكمال الجملة: Ich möchte ___ Supermarkt gehen."
    3.  يجب أن تحتوي مصفوفة "options" على أربعة خيارات باللغة الألمانية.
    4.  يجب أن يكون خيار واحد هو "correctAnswer".
    5.  يجب أن يكون اثنان من الخيارات الثلاثة الأخرى خيارات مضللة ومحتملة ولكنها غير صحيحة (على سبيل المثال، حالة إعرابية خاطئة، معنى مشابه ولكن سياق خاطئ).
    6.  يمكن أن يكون الخيار غير الصحيح الأخير خاطئًا بشكل أكثر وضوحًا.
    7.  لا تقم بتضمين الإجابة الصحيحة في الفراغ '___' في السؤال.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: questionSchema,
            },
          },
        },
      },
    });
    
    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((q: Omit<Question, 'id'>) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options.sort(() => Math.random() - 0.5) // Shuffle options
      }));
    } else {
      throw new Error("Invalid JSON structure received from API.");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    // Fallback to dummy data in case of API error
    return Array.from({ length: count }, (_, i) => ({
      id: `fallback-${i}-${Date.now()}`,
      question: "Fallback Question: Welches Wort passt? Ich gehe ___ die Schule.",
      options: ["in", "an", "auf", "zu"],
      correctAnswer: "in",
    }));
  }
};
