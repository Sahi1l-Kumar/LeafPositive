"use client";

import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { api } from "@/lib/api";
import { getChat, addMessage } from "@/lib/actions/chat.action";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

interface UIMessage {
  role: "user" | "ai";
  content: string;
  imageUrl?: string;
  detectedDisease?: string;
}

const ChatPage = () => {
  const params = useParams();
  const chatId = params.id as string;

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatData, setChatData] = useState<Chat | null>(null);
  const [currentCrop, setCurrentCrop] = useState<string | null>(null);
  const [detectedDisease, setDetectedDisease] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [diseaseContextUsed, setDiseaseContextUsed] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialAiFetchDone = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatAndAnalyze = useCallback(async () => {
    if (!chatId) return;

    setIsLoadingInitial(true);
    setError(null);
    setMessages([]);

    try {
      const chatResult = await getChat({ chatId });
      if (!chatResult.success || !chatResult.data) {
        throw new Error(chatResult.error?.message || "Failed to load chat.");
      }

      const fetchedChat = chatResult.data;
      setChatData(fetchedChat);

      const uiMessages: UIMessage[] = fetchedChat.messages.map((m) => ({
        role: m.sender,
        content: m.content,
        imageUrl: m.imageUrl,
        detectedDisease: m.detectedDisease,
      }));

      setMessages(uiMessages);

      const firstUserMessage = fetchedChat.messages.find(
        (m) => m.sender === "user"
      );
      setCurrentCrop(firstUserMessage?.content || "Plant");

      const aiMessageWithDisease = fetchedChat.messages.find(
        (m) => m.sender === "ai" && m.detectedDisease
      );
      if (aiMessageWithDisease?.detectedDisease) {
        setDetectedDisease(aiMessageWithDisease.detectedDisease);
        setDiseaseContextUsed(true);
      }

      setIsLoadingInitial(false);
      initialAiFetchDone.current = true;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load chat.");
      setIsLoadingInitial(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchChatAndAnalyze();
  }, [fetchChatAndAnalyze]);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentMessage.trim() || isTyping) return;

    const userMessage: UIMessage = { role: "user", content: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      await addMessage({
        chatId,
        message: { sender: "user", content: currentMessage },
      });

      const context =
        detectedDisease && diseaseContextUsed
          ? `Focus specifically on ${currentMessage} regarding ${detectedDisease} in ${currentCrop}`
          : `Provide ${detectedDisease ? "detailed " : ""}response for: ${currentMessage}`;

      const aiResult = await api.ai.getAnswer(
        currentMessage,
        context,
        diseaseContextUsed ? "" : detectedDisease || ""
      );

      if (!aiResult.success || !aiResult.data) {
        throw new Error(
          aiResult.error?.message || "Failed to get AI response."
        );
      }

      const aiMessage: UIMessage = {
        role: "ai",
        content: aiResult.data,
        detectedDisease: detectedDisease || undefined,
      };

      await addMessage({
        chatId,
        message: {
          sender: "ai",
          content: aiResult.data,
          detectedDisease: detectedDisease || undefined,
        },
      });

      setMessages((prev) => [...prev, aiMessage]);
      setDiseaseContextUsed(true);
    } catch (err) {
      console.error("Failed to get AI answer:", err);
      const errorMessage: UIMessage = {
        role: "ai",
        content: `Error: ${err instanceof Error ? err.message : "Please try again."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  if (isLoadingInitial && messages.length === 0) {
    return (
      <div className="flex-center min-h-screen background-light850_dark100">
        <p className="h3-bold text-dark400_light700 animate-pulse">
          Loading Chat...
        </p>
      </div>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="flex-center min-h-screen background-light850_dark100">
        <div className="text-center p-6 card-wrapper rounded-lg">
          <h2 className="h2-bold text-red-500 mb-4">Error Loading Chat</h2>
          <p className="text-dark400_light700 mb-4">{error}</p>
          <button
            onClick={() => {
              initialAiFetchDone.current = false;
              fetchChatAndAnalyze();
            }}
            className="primary-gradient text-light-900 py-2 px-4 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen background-light850_dark100">
      <header className="p-4 border-b light-border background-light900_dark200 shadow-light100_dark100 sticky top-0 z-10">
        <div className="container mx-auto flex-between">
          <h1 className="h3-bold text-dark100_light900">
            {detectedDisease || chatData?.title || "Chat"}
            {currentCrop && (
              <span className="text-sm font-normal text-dark400_light700 ml-2">
                ({currentCrop})
              </span>
            )}
          </h1>
        </div>
      </header>

      <div className="p-4 container mx-auto space-y-4 mb-4 flex-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl lg:max-w-3xl rounded-lg p-3 shadow-sm overflow-hidden break-words ${
                msg.role === "user"
                  ? "primary-gradient text-light-900 rounded-br-none"
                  : "background-light800_dark400 text-dark300_light900 rounded-bl-none border light-border"
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-2 relative w-full max-xs:max-w-full">
                  <Image
                    src={msg.imageUrl}
                    alt="Uploaded plant image"
                    width={500}
                    height={300}
                    className="rounded-lg"
                    style={{
                      objectFit: "contain",
                      maxHeight: "16rem",
                    }}
                    sizes="(max-width: 420px) 90vw, (max-width: 768px) 70vw, 500px"
                  />
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1
                      className="h1-bold primary-text-gradient mb-2"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="h2-bold text-dark300_light900 mt-4 mb-2"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="h3-bold text-dark300_light900 mt-3 mb-1"
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="paragraph-regular text-dark400_light700 my-2"
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a
                      className="text-primary-500 hover:underline"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 my-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 my-2" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-1" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary-500 pl-4 italic text-dark400_light500 my-3"
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong
                      className="font-bold text-dark300_light900"
                      {...props}
                    />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="italic" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <table
                      className="border-collapse border light-border my-3 w-full"
                      {...props}
                    />
                  ),
                  th: ({ node, ...props }) => (
                    <th
                      className="border light-border p-2 bg-light-700 dark:bg-dark-300"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border light-border p-2" {...props} />
                  ),
                  img: ({ node, ...props }) => (
                    <img
                      className="max-w-full h-auto rounded-lg my-2"
                      {...props}
                    />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="background-light800_dark400 rounded-lg rounded-bl-none p-3 border light-border shadow-sm">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-dark-400 dark:bg-light-700 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-dark-400 dark:bg-light-700 animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-dark-400 dark:bg-light-700 animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 w-full background-light900_dark200 border-t light-border shadow-dark-100 md:sticky rounded-lg">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
            <Textarea
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder={
                detectedDisease
                  ? `Ask about ${detectedDisease}...`
                  : "Ask a question..."
              }
              disabled={isTyping || isLoadingInitial}
              className="flex-1 min-h-[42px] max-h-[84px] p-3 rounded-lg background-light800_dark300 text-dark300_light900 placeholder border light-border-2 no-focus focus:ring-1 focus:ring-primary-500 max-xs:text-sm resize-none"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                const newHeight = Math.min(target.scrollHeight, 84);
                target.style.height = `${newHeight}px`;
              }}
            />
            <button
              type="submit"
              disabled={!currentMessage.trim() || isTyping || isLoadingInitial}
              className={`p-3 rounded-lg flex-center transition-opacity primary-gradient text-light-900 ${
                !currentMessage.trim() || isTyping || isLoadingInitial
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
            >
              <svg
                className="w-5 h-5 max-xs:w-4 max-xs:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
