"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useTransition } from "react";

import { addMessage, createChat } from "@/lib/actions/chat.action";
import { CROP_OPTIONS } from "@/constants";
import { LoadingSpinner } from "@/components/Loader";
import { api } from "@/lib/api";
import { useTranslation } from "@/app/i18n/client";

const Home: React.FC = () => {
  const params = useParams<{ lng: string }>();
  const lng = params.lng;
  const { t } = useTranslation(lng, "translation");
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCropSelect = (cropValue: string) => {
    setSelectedCrop(cropValue);
    setFile(null);
    setPreview(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        setFile(null);
        setPreview(null);
        e.target.value = "";
        return;
      }
      if (!selectedFile.type.startsWith("image/")) {
        setError(
          "Please upload a valid image file (PNG, JPG, JPEG, WEBP, etc.)."
        );
        setFile(null);
        setPreview(null);
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        setFile(null);
        setPreview(null);
        return;
      }
      if (!droppedFile.type.startsWith("image/")) {
        setError(
          "Please drop a valid image file (PNG, JPG, JPEG, WEBP, etc.)."
        );
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(droppedFile);
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const previewUrl = URL.createObjectURL(droppedFile);
      setPreview(previewUrl);
    }
  };

  const handleClearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    const fileInput = document.getElementById(
      "file-upload-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    if (!selectedCrop) {
      setError("Please select a crop first.");
      return;
    }
    if (!file) {
      setError("Please upload an image to analyze.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const uploadResponse = await api.uploadImage(file);

        if (!uploadResponse.success || !uploadResponse.imageUrl) {
          throw new Error("Failed to upload image to storage.");
        }

        const imageUrl = uploadResponse.imageUrl;
        const detectionResponse = await api.detectDisease(file, selectedCrop);

        if (!detectionResponse.success || !detectionResponse.category) {
          throw new Error("Failed to detect disease.");
        }
        const detectedDisease = detectionResponse.category;

        const initialContent = `${selectedCrop}`;
        const createChatParams = {
          title: `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Analysis`,
          message: {
            sender: "user" as const,
            content: initialContent,
            imageUrl: imageUrl,
          },
        };

        const result = await createChat(createChatParams);

        if (!result.success || !result.data?._id) {
          throw new Error(result.error?.message || "Failed to create chat.");
        }

        const newChatId = result.data._id;

        const aiResult = await api.ai.getAnswer("", "", detectedDisease);
        if (!aiResult.success || !aiResult.data) {
          console.error("Failed to get AI analysis:", aiResult.error);
        } else {
          await addMessage({
            chatId: newChatId,
            message: {
              sender: "ai",
              content: aiResult.data,
              detectedDisease: detectedDisease,
            },
          });
        }
        router.push(`en/chat/${newChatId}`);
      } catch (err: any) {
        console.error("Submission process failed:", err);
        setError(
          err.message || "An unexpected error occurred during submission."
        );
      }
    });
  };

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="background-light850_dark100 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 pt-6 pb-8 flex-grow flex flex-col items-center">
        <div className="w-full text-center mb-6">
          <h1 className="h1-bold text-dark100_light900 mb-4">
            {t("home.title")}
          </h1>
          <p className="paragraph-medium text-dark400_light700 max-w-xl mx-auto">
            {t("home.subtitle")}
          </p>
        </div>

        <div className="card-wrapper rounded-lg p-6 md:p-8 max-w-3xl w-full shadow-light200_dark100">
          {!selectedCrop && (
            <div className="flex flex-col items-center animate-fade-in">
              <h2 className="h2-bold text-dark300_light900 mb-6 text-center">
                {t("home.selectCrop")}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full max-w-2xl mx-auto">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop.value}
                    onClick={() => handleCropSelect(crop.value)}
                    className="flex flex-col items-center p-4 border light-border rounded-lg hover:bg-light-700/50 dark:hover:bg-dark-400/50 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-100"
                  >
                    <Image
                      src={crop.icon}
                      alt=""
                      width={48}
                      height={48}
                      className="mb-2 h-12 w-12 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-logo.svg";
                        e.currentTarget.alt = "Placeholder icon";
                      }}
                    />
                    <span className="paragraph-semibold text-dark400_light700 text-center">
                      {t(crop.labelKey)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8 w-full">
                <h3 className="h3-semibold text-dark300_light900 mb-4 text-center">
                  {t("home.howItWorks")}
                </h3>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 flex flex-col items-center p-4 background-light800_dark300 rounded-lg">
                    <div className="w-10 h-10 rounded-full primary-gradient flex-center mb-3">
                      <span className="text-light-900 font-bold">1</span>
                    </div>
                    <h4 className="paragraph-semibold mb-2">
                      {t("home.step1Title")}
                    </h4>
                    <p className="text-dark400_light700 text-center text-sm">
                      {t("home.step1Description")}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center p-4 background-light800_dark300 rounded-lg">
                    <div className="w-10 h-10 rounded-full primary-gradient flex-center mb-3">
                      <span className="text-light-900 font-bold">2</span>
                    </div>
                    <h4 className="paragraph-semibold mb-2">
                      {t("home.step2Title")}
                    </h4>
                    <p className="text-dark400_light700 text-center text-sm">
                      {t("home.step2Description")}
                    </p>
                  </div>

                  <div className="flex-1 flex flex-col items-center p-4 background-light800_dark300 rounded-lg">
                    <div className="w-10 h-10 rounded-full primary-gradient flex-center mb-3">
                      <span className="text-light-900 font-bold">3</span>
                    </div>
                    <h4 className="paragraph-semibold mb-2">
                      {t("home.step3Title")}
                    </h4>
                    <p className="text-dark400_light700 text-center text-sm">
                      {t("home.step3Description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCrop && (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="flex justify-between w-full items-center mb-6">
                <h2 className="h2-bold text-dark300_light900">
                  {t("home.uploadImage")}
                </h2>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="text-sm text-dark100_light900 hover:underline focus:outline-none flex items-center gap-1"
                >
                  <Image
                    src="/icons/arrow-left.svg"
                    alt={t("common.arrowLeft")}
                    width={18}
                    height={18}
                    className="invert-colors"
                  />
                  {t("home.changeCrop")} (
                  {t(
                    CROP_OPTIONS.find((c) => c.value === selectedCrop)
                      ?.labelKey || ""
                  )}
                  )
                </button>
              </div>

              <div className="w-full max-w-md">
                {!preview ? (
                  <label
                    htmlFor="file-upload-input"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed light-border rounded-lg cursor-pointer background-light800_dark300 hover:bg-light-700/30 dark:hover:bg-dark-300/50 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      <div className="w-16 h-16 mb-3 flex-center rounded-full bg-primary-100 dark:bg-dark-400">
                        <Image
                          src="icons/upload.svg"
                          alt="Upload Image"
                          width={18}
                          height={18}
                          className="invert-colors"
                        />
                      </div>
                      <p className="mb-2 text-sm text-dark400_light700">
                        <span className="font-semibold text-primary-500">
                          Click to upload
                        </span>{" "}
                        or drag & drop
                      </p>
                      <p className="text-xs text-dark500_light700">
                        PNG, JPG, WEBP, etc. (MAX 10MB)
                      </p>
                    </div>
                    <input
                      id="file-upload-input"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border light-border group shadow-light100_dark100">
                    <Image
                      src={preview}
                      alt="Plant image preview"
                      layout="fill"
                      objectFit="cover"
                    />
                    <button
                      onClick={handleClearPreview}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 dark:bg-white/40 text-white rounded-full hover:bg-black/60 dark:hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-white opacity-70 group-hover:opacity-100 transition-opacity"
                      aria-label="Clear image preview"
                    >
                      <Image
                        src="icons/close.svg"
                        alt="Remove Image"
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                )}

                <div className="mt-4 w-full space-y-2">
                  {preview && file && (
                    <div className="flex items-center justify-between text-xs px-1 background-light700_dark400 p-2 rounded">
                      <p
                        className="text-dark400_light700 truncate max-w-[70%]"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-dark500_light700 flex-shrink-0">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isPending || !selectedCrop || !file}
                    className="w-full primary-gradient text-light-900 py-3 px-6 rounded-lg flex items-center justify-center disabled:opacity-60 transition-all duration-300 h-[48px] shadow-light100_dark100 hover:shadow-lg"
                  >
                    {isPending ? (
                      <>
                        <LoadingSpinner className="mr-1" />
                        {t("home.processing")}
                      </>
                    ) : (
                      <div className="flex items-center paragraph-semibold">
                        {t("home.startAnalysis")}
                        <Image
                          src="icons/arrow-right.svg"
                          alt={t("common.arrowRight")}
                          width={18}
                          height={18}
                          className="ml-2"
                        />
                      </div>
                    )}
                  </button>
                </div>

                {error && (
                  <p
                    className="text-red-500 text-sm mt-4 text-center"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
