"use server";

import mongoose, { FilterQuery } from "mongoose";
import { revalidatePath } from "next/cache";

import ROUTES from "@/constants/routes";
import Chat from "@/database/chat.model";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  AddMessageSchema,
  CreateChatSchema,
  GetChatSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import getLanguageFromCookie from "../cookies";

export async function createChat(
  params: CreateChatParams
): Promise<ActionResponse<Chat>> {
  const lng = await getLanguageFromCookie();

  const validationResult = await action({
    params,
    schema: CreateChatSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, message } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [newChat] = await Chat.create(
      [
        {
          author: userId,
          title: title || "New Chat",
          messages: [
            {
              sender: message.sender,
              content: message.content,
              timestamp: new Date(),
              imageUrl: message.imageUrl,
            },
          ],
        },
      ],
      { session }
    );

    if (!newChat) throw new Error("Failed to create chat");

    await session.commitTransaction();

    revalidatePath(ROUTES.CHAT(lng, newChat._id));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newChat)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getChat(
  params: GetChatParams
): Promise<ActionResponse<Chat>> {
  const validationResult = await action({
    params,
    schema: GetChatSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { chatId } = validationResult.params!;

  try {
    const chat = await Chat.findById(chatId).populate(
      "author",
      "_id name image"
    );

    if (!chat) {
      throw new Error("Chat not found");
    }

    return { success: true, data: JSON.parse(JSON.stringify(chat)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getChats(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ chats: Chat[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<typeof Chat> = {};

  if (filter === "recommended") {
    return { success: true, data: { chats: [], isNext: false } };
  }

  if (query) {
    filterQuery.$or = [{ title: { $regex: new RegExp(query, "i") } }];
  }

  try {
    const totalChats = await Chat.countDocuments(filterQuery);

    const chats = await Chat.find(filterQuery)
      .populate("title")
      .sort({ createdAt: -1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const isNext = totalChats > skip + chats.length;

    return {
      success: true,
      data: { chats: JSON.parse(JSON.stringify(chats)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function addMessage(
  params: AddMessageParams
): Promise<ActionResponse<Chat>> {
  const lng = await getLanguageFromCookie();

  const validationResult = await action({
    params,
    schema: AddMessageSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { chatId, message } = validationResult.params!;
  const userId = validationResult?.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) throw new Error("Chat not found");

    if (chat.author.toString() !== userId) {
      throw new Error(
        "Unauthorized: You can only add messages to your own chats"
      );
    }

    chat.messages.push({
      sender: message.sender,
      content: message.content,
      timestamp: new Date(),
      imageUrl: message.imageUrl,
      detectedDisease: message.detectedDisease,
    });

    await chat.save({ session });

    await session.commitTransaction();

    revalidatePath(ROUTES.CHAT(lng, chatId));

    return {
      success: true,
      data: JSON.parse(JSON.stringify(chat)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getMessages(params: { chatId: string }): Promise<
  ActionResponse<
    Array<{
      sender: string;
      content: string;
      timestamp: Date;
      imageUrl?: string;
      detectedDisease?: string;
    }>
  >
> {
  const validationResult = await action({
    params,
    schema: GetChatSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { chatId } = validationResult.params!;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(chat.messages)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
