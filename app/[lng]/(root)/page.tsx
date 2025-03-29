"use client";

import Image from "next/image";
import { useRouter } from "next/navigation"; // Correct import for App Router
import React, { useState, useRef, useEffect, useTransition } from "react";

// --- Server Action & Helpers ---
import { createChat } from "@/lib/actions/chat.action"; // Adjust path as needed
import { CROP_OPTIONS } from "@/constants";

const Home: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // State for Server Action loading

  // --- Event Handlers ---

  const handleCropSelect = (cropValue: string) => {
    setSelectedCrop(cropValue);
    setFile(null); // Reset file when crop changes
    setPreview(null); // Reset preview
    setError(null); // Clear errors
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Basic Validation
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size exceeds 10MB limit.");
        setFile(null);
        setPreview(null);
        e.target.value = ""; // Clear the file input
        return;
      }
      if (!selectedFile.type.startsWith("image/")) {
        // Check MIME type
        setError(
          "Please upload a valid image file (PNG, JPG, JPEG, WEBP, etc.)."
        );
        setFile(null);
        setPreview(null);
        e.target.value = ""; // Clear the file input
        return;
      }

      setFile(selectedFile);
      // Create and manage preview URL
      if (preview) {
        URL.revokeObjectURL(preview); // Revoke previous preview URL
      }
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setError(null); // Clear previous errors
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Optional: Add visual feedback for drag over
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null); // Clear error on drop

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      // Apply same validation as handleFileChange
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
    // Also clear the file input visually if possible (though tricky)
    const fileInput = document.getElementById(
      "file-upload-input"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    // Validation before submitting
    if (!selectedCrop) {
      setError("Please select a crop first.");
      return;
    }
    // Modify this check if image becomes truly optional
    if (!file) {
      setError("Please upload an image to analyze.");
      return;
    }
    setError(null); // Clear previous errors

    // Use startTransition for the Server Action call
    startTransition(async () => {
      try {
        let imageUrl: string | undefined = undefined;

        // 1. Upload Image (Simulated Step - Replace with actual implementation)
        // This step is crucial if your backend needs the image URL stored
        console.log("Attempting image upload simulation for:", file.name);
        // const uploadResult = await uploadImage(file);
        // if (!uploadResult.success || !uploadResult.data?.url) {
        //   throw new Error(
        //     uploadResult.error?.message || "Image upload failed."
        //   );
        // }
        // imageUrl = uploadResult.data.url;
        console.log("Simulated Image URL obtained:", imageUrl);
        // --- End Simulation ---

        // 2. Prepare parameters for the createChat Server Action
        const initialContent = `Analyze the uploaded image for ${selectedCrop}. Image URL: ${imageUrl}`;
        const params = {
          // title: `${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Analysis Request`, // Example title
          message: {
            sender: "user" as const, // Important literal type
            content: initialContent,
            imageUrl: imageUrl, // Pass the URL obtained from upload
          },
          // Optionally pass crop type if your action/schema supports it
          // cropType: selectedCrop,
        };

        console.log("Calling createChat Server Action with params:", params);

        // 3. Call the Server Action
        const result = await createChat(params);
        console.log("Server Action createChat result:", result);

        // 4. Handle the Server Action result
        if (!result.success || !result.data?._id) {
          // Check for success and data._id
          throw new Error(
            result.error?.message || "Failed to initialize chat session."
          );
        }

        // 5. Navigate to the newly created chat page on success
        const newChatId = result.data._id;
        console.log(
          "Successfully created chat. Navigating to chat ID:",
          newChatId
        );
        router.push(`en/chat/${newChatId}`); // Navigate using the ID from the response
      } catch (err: any) {
        console.error("Submission process failed:", err);
        setError(
          err.message || "An unexpected error occurred during submission."
        );
        // isPending automatically becomes false after the transition completes or errors
      }
    });
  };

  // --- Effect for cleaning up preview URL ---
  useEffect(() => {
    // This function runs when the component unmounts or when `preview` changes.
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
        console.log("Revoked preview URL:", preview);
      }
    };
  }, [preview]); // Dependency array ensures cleanup runs when `preview` changes

  // --- JSX Rendering ---
  return (
    // Apply base background and ensure min height covers screen
    <div className="background-light850_dark100 min-h-screen flex flex-col">
      {/* Centered container */}
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col items-center">
        {/* Main Title */}
        <h1 className="h1-bold text-dark100_light900 text-center mb-8">
          Leaf Positive
        </h1>

        {/* Card Wrapper for content */}
        <div className="card-wrapper rounded-lg p-6 md:p-8 max-w-3xl w-full">
          {/* Step 1: Crop Selection UI */}
          {!selectedCrop && (
            <div className="flex flex-col items-center animate-fade-in">
              {" "}
              {/* Added simple animation */}
              <h2 className="h3-bold text-dark300_light900 mb-6">
                1. Select Your Crop
              </h2>
              {/* Grid layout for crop options */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-md">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop.value}
                    onClick={() => handleCropSelect(crop.value)}
                    className="flex flex-col items-center p-4 border light-border rounded-lg hover:bg-light-700/50 dark:hover:bg-dark-400/50 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-100"
                  >
                    {/* Crop Icon */}
                    <Image
                      src={crop.icon}
                      alt="" // Alt text decorative here as label is below
                      width={48}
                      height={48}
                      className="mb-2 h-12 w-12 object-contain" // Ensure consistent size
                      // Basic error handling for icons
                      onError={(e) => {
                        e.currentTarget.src = "/images/default-logo.svg";
                        e.currentTarget.alt = "Placeholder icon";
                      }}
                    />
                    {/* Crop Label */}
                    <span className="paragraph-semibold text-dark400_light700 text-center">
                      {crop.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Image Upload UI (Conditional) */}
          {selectedCrop && (
            <div className="flex flex-col items-center animate-fade-in">
              {" "}
              {/* Added simple animation */}
              {/* Header for Step 2 with option to change crop */}
              <div className="flex justify-between w-full items-center mb-4 md:mb-6">
                <h2 className="h3-bold text-dark300_light900">
                  2. Upload Plant Image
                </h2>
                <button
                  onClick={() => handleCropSelect(null)} // Reset selection
                  className="text-sm text-primary-500 hover:underline focus:outline-none"
                  aria-label={`Change selected crop from ${CROP_OPTIONS.find((c) => c.value === selectedCrop)?.label || "current selection"}`}
                >
                  Change Crop (
                  {CROP_OPTIONS.find((c) => c.value === selectedCrop)?.label})
                </button>
              </div>
              {/* Image Upload Area */}
              <div className="w-full max-w-md">
                {/* Conditional rendering: Show dropzone or preview */}
                {!preview ? (
                  // Dropzone Label
                  <label
                    htmlFor="file-upload-input" // Associate label with input
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed light-border rounded-lg cursor-pointer background-light800_dark300 hover:bg-light-700/30 dark:hover:bg-dark-300/50 transition-colors"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                      {/* Upload Icon */}
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
                      {/* Upload Text */}
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
                    {/* Hidden File Input */}
                    <input
                      id="file-upload-input" // ID for label association
                      type="file"
                      className="hidden"
                      accept="image/*" // Accept all image types
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  // Image Preview Area
                  <div className="relative h-64 w-full overflow-hidden rounded-lg border light-border group">
                    <Image
                      src={preview} // Use the state variable for the preview URL
                      alt="Plant image preview"
                      layout="fill" // Fill the container
                      objectFit="cover" // Cover the area, might crop
                    />
                    {/* Clear Preview Button */}
                    <button
                      onClick={handleClearPreview}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white opacity-70 group-hover:opacity-100 transition-opacity"
                      aria-label="Clear image preview"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {/* File Details and Submit Button Area (Conditional) */}
                {/* Show this section only when a crop is selected */}
                <div className="mt-4 w-full space-y-2">
                  {/* Display file info if a file is selected */}
                  {preview && file && (
                    <div className="flex items-center justify-between text-xs px-1">
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
                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    // Disable button if a Server Action is pending, no crop is selected, or no file is selected
                    disabled={isPending || !selectedCrop || !file}
                    className="w-full primary-gradient text-light-900 py-3 px-6 rounded-lg flex items-center justify-center disabled:opacity-60 transition-opacity h-[48px]" // Added fixed height for consistency
                  >
                    {isPending ? (
                      // Loading State
                      <>
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
                      </>
                    ) : (
                      // Default State
                      <div className="flex items-center paragraph-semibold">
                        Start Analysis
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

                {/* Error Message Display */}
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
