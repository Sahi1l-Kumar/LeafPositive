import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { question, content, detectedDisease } = await req.json();

  try {
    const validatedData = AIAnswerSchema.safeParse({ question, content });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    let prompt = "";

    if (detectedDisease) {
      prompt = `Generate a comprehensive markdown-formatted response about the plant disease: "${detectedDisease}".
      
      The user has uploaded an image of a plant with this disease. Please provide:
      1. A brief description of the disease
      2. Common symptoms and how to identify it
      3. What causes this disease
      4. Recommended treatments and remedies
      5. Prevention methods
      
      If the user has asked a specific question: "${question}", address it in the context of this plant disease.
      
      Additional context: ${content}
            
      Provide the final answer in markdown format with appropriate headings and structure.`;
    } else {
      prompt = `Generate a markdown-formatted response to the following question about plants: "${question}".
      
      Consider the provided context:
      **Context:** ${content}
            
      Focus only on plant-related information, particularly plant diseases, care, and remedies. If the question is not related to plants, politely inform the user that you can only provide information about plants and their diseases.
      
      Provide the final answer in markdown format with appropriate headings and structure.`;
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: prompt,
      system:
        "You are a specialized plant disease assistant that provides expert information on plant diseases, treatments, and care. Only answer questions related to plants and gardening. If asked about unrelated topics, politely redirect the conversation to plants. Use markdown formatting for clear, well-structured responses with appropriate headings, lists, and emphasis. Include scientific names where relevant and practical advice that gardeners can implement.",
    });

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
