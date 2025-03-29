"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import React, { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";

import ROUTES from "@/constants/routes";
import { toast } from "sonner";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { AskQuestionSchema } from "@/lib/validations";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { CROP_OPTIONS } from "@/constants";

interface Params {
  question?: Question;
  isEdit?: boolean;
  lng: string;
}

const QuestionForm = ({ question, isEdit = false, lng }: Params) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof AskQuestionSchema>>({
    resolver: zodResolver(AskQuestionSchema),
    defaultValues: {
      title: question?.title || "",
      content: question?.content || "",
      crop: question?.crop || "",
    },
  });

  const selectedCrop = form.watch("crop");

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

  const handleCreateQuestion = async (
    data: z.infer<typeof AskQuestionSchema>
  ) => {
    startTransition(async () => {
      if (isEdit && question) {
        const result = await editQuestion({
          questionId: question?._id,
          ...data,
        });

        if (result.success) {
          toast("Success", {
            description: "Question updated successfully",
          });

          if (result.data) router.push(ROUTES.QUESTION(lng, result.data._id));
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong",
          });
        }

        return;
      }

      const result = await createQuestion(data);

      if (result.success) {
        toast("Success", {
          description: "Question created successfully",
        });

        if (result.data) router.push(ROUTES.QUESTION(lng, result.data._id));
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong",
        });
      }
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex w-full flex-col gap-10"
          onSubmit={form.handleSubmit(handleCreateQuestion)}
        >
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
            name="crop"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Select Crop Type (Optional)
                </FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(true)}
                      className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700"
                    >
                      {selectedCrop
                        ? `Selected: ${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}`
                        : "Select Crop"}
                    </Button>

                    {selectedCrop && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.setValue("crop", "")}
                        className="text-red-500"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Question Title <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Be specific and imagine you&apos;re asking a question to
                  another person.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Detailed explanation of your problem{" "}
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[100px] max-h-[100px] resize-none border custom-scrollbar break-words"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Introduce the problem and expand on what you&apos;ve put in
                  the title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-16 flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="primary-gradient w-fit !text-light-900"
            >
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                <>{isEdit ? "Edit" : "Ask a Question"}</>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="background-light900_dark200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-dark300_light900 h3-bold">
              Select your crop
            </DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Search"
            className="paragraph-regular background-light800_dark400 text-dark300_light700 mb-4"
          />
          <div className="grid grid-cols-3 gap-4">
            {CROP_OPTIONS.map((option) => (
              <div
                key={option.value}
                className="flex flex-col items-center"
                onClick={() => {
                  form.setValue("crop", option.value);
                  setIsModalOpen(false);
                }}
              >
                <div className="relative h-20 w-20 rounded-full bg-light-800 dark:bg-dark-400 flex-center">
                  <Image
                    src={option.icon}
                    alt={option.label}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <Label className="paragraph-medium text-dark300_light900 mt-2 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionForm;
