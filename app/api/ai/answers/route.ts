import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validations";
import getLanguageFromCookie from "@/lib/cookies";

export async function POST(req: Request) {
  const { question, content, detectedDisease } = await req.json();

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const lng = await getLanguageFromCookie();
    let prompt = "";

    if (detectedDisease) {
      prompt = question.trim()
        ? `Answer this specific question about ${detectedDisease}: "${question}"
       Use this context: ${content}
       Focus exclusively on the question while referencing the known disease.
       Provide a concise markdown response without disease overview.`
        : `Provide concise markdown overview of ${detectedDisease} including:
       1. Brief description
       2. Key symptoms
       3. Treatments
       4. Prevention
       Context: ${content}`;
    } else {
      prompt = `Generate a concise markdown-formatted response to the following question about plants: "${question}".
      
      Context: ${content}
      
      Focus only on plant-related information (e.g., diseases, care, remedies). If unrelated, redirect politely to plant-related topics.
      
      Provide a brief and focused answer in markdown format.`;
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: prompt,
      system: `You are a specialized plant disease assistant that provides expert information on plant diseases, treatments, and care. Only answer questions related to plants and gardening. If asked about unrelated topics, politely redirect the conversation to plants. Use markdown formatting for clear, well-structured responses with appropriate headings, lists, and emphasis. Include scientific names where relevant and practical advice that gardeners can implement. Focus on the user's latest query. Only reference previously identified diseases if directly relevant to the current question. Please respond in ${lng} language.`,
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
