
import { GoogleGenAI } from "@google/genai";
import type { User, AttendanceRecord } from '../types';

// IMPORTANT: Do NOT configure an API key here.
// The environment is expected to have process.env.API_KEY already set.
let ai: GoogleGenAI;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch(e) {
  console.error("Failed to initialize GoogleGenAI. Is API_KEY set?", e);
}


export const generateAttendanceSummary = async (
  employees: User[], 
  attendance: AttendanceRecord[]
): Promise<string> => {
  if (!ai) {
    return "Gemini API not initialized. Please ensure your API key is configured in the environment.";
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === today);

  const presentUsernames = new Set(todayAttendance.map(a => a.username));
  const presentCount = presentUsernames.size;
  const absentCount = employees.length - presentCount;
  const lateCount = todayAttendance.filter(a => a.checkInTime && a.checkInTime > "09:30:00").length;

  const prompt = `
    Generate a concise, professional summary of today's employee attendance.
    Today's Date: ${today}
    Total Employees: ${employees.length}
    Present: ${presentCount}
    Absent: ${absentCount}
    Late Arrivals (after 9:30 AM): ${lateCount}

    Based on this data, provide a brief overview. Mention the overall attendance rate.
    If there are late arrivals or a high number of absences, suggest a brief, friendly follow-up action for the administrator.
    Format the output as clean markdown. Start with a title "### Daily Attendance Summary".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    return "Error: Could not generate AI summary. Please check the console for details.";
  }
};

export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<{ address: string, uri?: string }> => {
  if (!ai) {
    return { address: "Gemini API not initialized." };
  }

  const prompt = `Provide a concise, single-line street address for the given GPS coordinates. If a precise street address isn't available, provide the name of the nearest known place or landmark.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }
      },
    });
    
    const address = response.text.trim();
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let uri: string | undefined = undefined;
    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        if ('maps' in chunk && chunk.maps.uri) {
          uri = chunk.maps.uri;
          break;
        }
      }
    }
    
    return { address, uri };

  } catch (error) {
    console.error("Error getting address from Gemini with Maps Grounding:", error);
    return { address: `Coords: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})` }; // Fallback
  }
};
