"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const Home = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [diseaseData, setDiseaseData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat appears
  useEffect(() => {
    if (diseaseData) {
      inputRef.current?.focus();
    }
  }, [diseaseData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setDiseaseData(null);
      setMessages([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.match("image.*")) {
        setFile(droppedFile);
        const previewUrl = URL.createObjectURL(droppedFile);
        setPreview(previewUrl);
        setDiseaseData(null);
        setMessages([]);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      // Simulate API call with dummy data
      setTimeout(() => {
        // Dummy disease data
        const dummyDiseaseData = {
          disease: "Leaf Blight",
          severity: "moderate",
          description:
            "Leaf blight is a common disease affecting various plants, characterized by rapid browning and death of leaves, stems, and flowers.",
          recommendations: [
            "Remove and destroy infected plant parts",
            "Apply appropriate fungicide",
            "Ensure proper spacing between plants for air circulation",
          ],
        };

        setDiseaseData(dummyDiseaseData);
        setIsUploading(false);

        // Add initial welcome message
        setMessages([
          {
            role: "assistant",
            content: `I've analyzed your plant image and identified **${dummyDiseaseData.disease}** with ${dummyDiseaseData.severity} severity. ${dummyDiseaseData.description} How can I help you treat this issue?`,
          },
        ]);
      }, 1500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage = { role: "user", content: currentMessage };
    setMessages([...messages, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    // Simulate API response with typing effect
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "I understand your concern about Leaf Blight. This disease typically spreads in humid conditions and can be challenging to manage. Here are some additional tips:\n\n1. Water at the base of plants rather than overhead to reduce leaf wetness\n2. Improve air circulation by proper spacing and pruning\n3. Apply copper-based fungicides as a preventative measure\n4. Consider resistant varieties for future plantings\n\nIs there anything specific about the treatment process you'd like me to explain in more detail?",
        },
      ]);
    }, 2000);
  };

  return (
    <div className="background-light850_dark100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="h1-bold text-dark100_light900 text-center mb-8">
          Leaf Positive
        </h1>

        {!diseaseData ? (
          <div className="card-wrapper rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <h2 className="h3-bold text-dark300_light900 mb-6">
                Upload a photo of your plant
              </h2>

              <div className="w-full max-w-md">
                {!preview ? (
                  <label
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed light-border rounded-lg cursor-pointer background-light800_dark300 hover:bg-opacity-80 transition-all"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-10 h-10 mb-3 text-dark400_light700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        ></path>
                      </svg>
                      <p className="mb-2 text-sm text-dark400_light700">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-dark500_light700">
                        PNG, JPG or JPEG (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border light-border">
                    <Image
                      src={preview}
                      alt="Plant preview"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}

                {preview && (
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-dark400_light700 truncate max-w-xs">
                        {file?.name || "Uploaded image"}
                      </p>
                      <p className="text-xs text-dark500_light700">
                        {file?.size
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full primary-gradient text-light-900 py-3 px-6 rounded-lg flex items-center justify-center"
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          Analyze Plant
                          <svg
                            className="ml-2 w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-1/3">
                <div className="relative h-64 w-full overflow-hidden rounded-lg border light-border sticky top-8">
                  <Image
                    src={preview}
                    alt="Plant image"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>

              <div className="md:w-2/3">
                <div
                  className={`p-4 rounded-lg mb-4 ${
                    diseaseData.severity === "mild"
                      ? "health-status-mild"
                      : diseaseData.severity === "moderate"
                        ? "health-status-moderate"
                        : diseaseData.severity === "severe"
                          ? "health-status-severe"
                          : "health-status-healthy"
                  }`}
                >
                  <h2 className="h2-bold text-dark200_light900 mb-2">
                    {diseaseData.disease}
                  </h2>
                  <p className="paragraph-medium text-dark400_light700">
                    Severity:{" "}
                    <span className="font-semibold capitalize">
                      {diseaseData.severity}
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <h3 className="h3-semibold text-dark300_light900 mb-2">
                    Description
                  </h3>
                  <p className="paragraph-regular text-dark500_light700">
                    {diseaseData.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="h3-semibold text-dark300_light900 mb-2">
                    Recommendations
                  </h3>
                  <ul className="list-disc pl-5">
                    {diseaseData.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="paragraph-regular text-dark500_light700 mb-1"
                      >
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-24">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      msg.role === "user"
                        ? "primary-gradient text-light-900 rounded-br-none"
                        : "background-light800_dark400 text-dark300_light900 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-line paragraph-regular">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="background-light800_dark400 text-dark300_light900 rounded-lg rounded-bl-none p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full background-light700_dark300 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full background-light700_dark300 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full background-light700_dark300 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {diseaseData && (
        <div className="sticky bottom-0 w-full background-light900_dark200 border-t light-border shadow-light100_dark100">
          <div className="container mx-auto px-4 py-4">
            <form
              onSubmit={sendMessage}
              className="flex gap-2 max-w-3xl mx-auto"
            >
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Ask about your plant disease..."
                className="flex-1 p-3 rounded-lg background-light800_dark300 text-dark300_light900 placeholder border-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!currentMessage.trim() || isTyping}
                className={`primary-gradient text-light-900 p-3 rounded-lg ${
                  !currentMessage.trim() || isTyping
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <svg
                  className="w-6 h-6"
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
      )}
    </div>
  );
};

export default Home;
