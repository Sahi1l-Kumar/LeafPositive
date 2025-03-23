"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { toast } from "sonner";
import { z, ZodType } from "zod";

import { useTranslation } from "@/app/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";

interface AuthFormProps<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
  formType: "SIGN_IN" | "SIGN_UP";
  lng: string;
}

const AuthForm = <T extends FieldValues>({
  schema,
  defaultValues,
  formType,
  onSubmit,
  lng,
}: AuthFormProps<T>) => {
  const router = useRouter();
  const { t } = useTranslation(lng, "translation");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (result?.success) {
      toast.success(
        formType === "SIGN_IN"
          ? t("auth.signInSuccess")
          : t("auth.signUpSuccess")
      );

      router.push(ROUTES.HOME(lng));
    } else {
      toast.error(`${t("auth.error")} ${result?.status}`, {
        description: result?.error?.message,
      });
    }
  };

  const getFieldLabel = (fieldName: string) => {
    if (fieldName === "email") {
      return t("auth.emailAddress");
    }
    return t(`auth.${fieldName}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-10 space-y-6"
      >
        {Object.keys(defaultValues).map((field) => (
          <FormField
            key={field}
            control={form.control}
            name={field as Path<T>}
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="paragraph-medium text-dark400_light700">
                  {getFieldLabel(field.name)}
                </FormLabel>
                <FormControl>
                  <Input
                    required
                    type={field.name === "password" ? "password" : "text"}
                    {...field}
                    className="paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 no-focus min-h-12 rounded-1.5 border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          disabled={form.formState.isSubmitting}
          className="primary-gradient paragraph-medium min-h-12 w-full rounded-2 px-4 py-3 font-inter !text-light-900"
        >
          {form.formState.isSubmitting
            ? formType === "SIGN_IN"
              ? t("auth.signingIn")
              : t("auth.signingUp")
            : formType === "SIGN_IN"
              ? t("auth.signIn")
              : t("auth.signUp")}
        </Button>

        {formType === "SIGN_IN" ? (
          <p>
            {t("auth.noAccount")}{" "}
            <Link
              href={ROUTES.SIGN_UP(lng)}
              className="paragraph-semibold primary-text-gradient"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        ) : (
          <p>
            {t("auth.haveAccount")}{" "}
            <Link
              href={ROUTES.SIGN_IN(lng)}
              className="paragraph-semibold primary-text-gradient"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
