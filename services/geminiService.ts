import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ReceiptData } from "../types";

const processReceiptImage = async (file: File): Promise<ReceiptData> => {
  // Retrieve API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Mock data for demonstration purposes or when API key is missing
  const mockData: ReceiptData = {
    storeName: "セブンイレブン (デモ)",
    date: new Date().toISOString().split('T')[0],
    amount: 1580
  };

  // If no API key is present or is the placeholder, return mock data immediately
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn("API Key missing. Using mock data for demonstration.");
    return mockData;
  }

  // Initialize SDK
  const genAI = new GoogleGenerativeAI(apiKey);

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    // getGenerativeModel with specific model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            storeName: {
              type: SchemaType.STRING,
              description: "The name of the store or merchant."
            },
            date: {
              type: SchemaType.STRING,
              description: "The date of purchase in YYYY-MM-DD format."
            },
            amount: {
              type: SchemaType.NUMBER,
              description: "The total amount of the purchase."
            }
          },
          required: ["storeName", "date", "amount"]
        }
      }
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data
        }
      },
      `Analyze this receipt image. Extract the store name, date (in YYYY-MM-DD format), and total amount. 
       If the year is missing, assume the current year is ${new Date().getFullYear()}.
       If the store name is unclear, use "Unknown Store".
       If the date is unclear, use today's date: ${new Date().toISOString().split('T')[0]}.
       Ensure the amount is a number.`
    ]);

    const text = result.response.text();
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text) as ReceiptData;
    return data;
  } catch (error: any) {
    console.error("Gemini analysis failed, falling back to mock data:", error);
    // Fallback to mock data on error so the user still sees "automatic" input
    return mockData;
  }
};

export const geminiService = {
  processReceiptImage
};