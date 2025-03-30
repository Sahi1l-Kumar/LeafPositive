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
import { api } from "@/lib/api";

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
import { useTranslation } from "@/app/i18n/client";

interface Params {
  question?: Question;
  isEdit?: boolean;
  lng: string;
}

const QuestionForm = ({ question, isEdit = false, lng }: Params) => {
  const router = useRouter();
  const { t } = useTranslation(lng, "translation");

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
      try {
        let imageUrl;
        if (data.image instanceof File) {
          const uploadResponse = await api.uploadImage(data.image);

          if (!uploadResponse.success || !uploadResponse.imageUrl) {
            throw new Error("Failed to upload image to storage.");
          }

          imageUrl = uploadResponse.imageUrl;
        }

        const updatedData = {
          ...data,
          imageUrl: imageUrl,
        };

        if (isEdit && question) {
          const result = await editQuestion({
            questionId: question?._id,
            ...updatedData,
          });

          if (result.success) {
            toast("Success", {
              description: "Question updated successfully",
            });

            if (result.data)
              router.push(ROUTES.QUESTION(lng, result.data._id as string));
          } else {
            toast.error(`Error ${result.status}`, {
              description: result.error?.message || "Something went wrong",
            });
          }

          return;
        }

        const result = await createQuestion(updatedData);

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
      } catch (err: any) {
        toast.error("Error", {
          description: err.message || "Something went wrong",
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
                  {t("question.uploadImage")}
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
                        {t("question.chooseFile")}
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
                          {t("question.clear")}
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
                        {t("question.noFileChosen")}
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
                  {t("question.selectCropType")}
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
                        ? `${t("question.selected")}: ${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}`
                        : t("question.selectCrop")}
                    </Button>

                    {selectedCrop && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.setValue("crop", "")}
                        className="text-red-500"
                      >
                        {t("question.clear")}
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
                  {t("question.title")}
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[56px] border"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  {t("question.titleDescription")}
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
                  {t("question.detailedExplanation")}
                  <span className="text-primary-500">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="paragraph-regular background-light700_dark300 light-border-2 text-dark300_light700 no-focus min-h-[100px] max-h-[100px] resize-none border custom-scrollbar break-words"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  {t("question.contentDescription")}
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
                  <span>{t("question.submitting")}</span>
                </>
              ) : (
                <>{isEdit ? t("question.edit") : t("question.askQuestion")}</>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="background-light900_dark200 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-dark300_light900 h3-bold">
              {t("question.selectYourCrop")}
            </DialogTitle>
          </DialogHeader>
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
                    alt={t(option.labelKey)}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <Label className="paragraph-medium text-dark300_light900 mt-2 cursor-pointer">
                  {t(option.labelKey)}
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
