"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createAnswer } from "@/lib/actions/answer.action";
import { AnswerSchema } from "@/lib/validations";
import { api } from "@/lib/api";

interface Props {
  questionId: string;
}

const AnswerForm = ({ questionId }: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const session = useSession();

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue("image", undefined);
    setPreviewImage(null);
    // Reset the file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    if (session.status !== "authenticated") {
      return toast("Please log in", {
        description: "You need to be logged to be able to answer",
      });
    }

    startAnsweringTransition(async () => {
      let imageUrl;
      if (values.image instanceof File) {
        const formData = new FormData();
        formData.append("file", values.image);

        try {
          const uploadResponse = await api.uploadImage(values.image);

          if (!uploadResponse.success || !uploadResponse.imageUrl) {
            throw new Error("Failed to upload image to storage.");
          }

          imageUrl = uploadResponse.imageUrl;
        } catch (error) {
          toast.error("Error", {
            description: "Failed to upload image. Please try again.",
          });
        }
      }

      const result = await createAnswer({
        questionId,
        content: values.content,
        imageUrl: imageUrl,
      });

      if (result.success) {
        form.reset();
        setPreviewImage(null);

        toast("Success", {
          description: "Your answer has been posted successfully",
        });
      } else {
        toast.error("Error", {
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full flex-col gap-10"
        >
          {/* Image Upload Field */}
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Upload Image (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                        className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 flex gap-2 items-center"
                      >
                        <Image
                          src="/icons/upload.svg"
                          width={18}
                          height={18}
                          alt="Upload"
                          className="invert-colors"
                        />
                        Choose File
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                      {previewImage && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={clearImage}
                          className="text-red-500"
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {previewImage ? (
                      <div className="relative h-60 w-60 overflow-hidden rounded-md border border-gray-300 shadow-light100_dark100">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <p className="body-regular text-light-400">
                        No file chosen
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Your Answer <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Textarea
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[100px] max-h-[100px] resize-none border custom-scrollbar break-words"
                    {...field}
                    placeholder="Write your answer here"
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Explain your solution clearly and in detail to help the person
                  who asked the question.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit !text-light-900"
              disabled={isAnswering}
            >
              {isAnswering ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Answer"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
