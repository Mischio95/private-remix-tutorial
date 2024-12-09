import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "~/validation/userSchemas";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

type UserFormData = z.infer<typeof userSchema>;

type UserFormProps = {
  onSubmit: SubmitHandler<UserFormData>;
  serverError?: string;
  successMessage?: string;
};

export const AuthForm = ({
  onSubmit,
  serverError,
  successMessage,
}: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
        imageUrl:""
    }
  });

  const onSubmitForm = (data: UserFormData) => {
    // Se imageUrl è vuoto, set a null prima di inviare
    const formData = {
      ...data,
      imageUrl: data.imageUrl || null
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 mt-6">
      {serverError && (
        <Alert variant="destructive">
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="name">Username</Label>
        <Input {...register("name")} id="name" type="text" />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input {...register("email")} id="email" type="email" />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input {...register("password")} id="password" type="password" />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="imageUrl">Immagine Profilo (opzionale)</Label>
        <Input
          {...register("imageUrl")
          }
          id="imageUrl"
          type="url"
          placeholder="https://esempio.com/immagine.jpg"
        />
        <p className="text-sm text-gray-500 mt-1">
          Lascia vuoto se non vuoi aggiungere un'immagine
        </p>
      </div>
      <Button type="submit" className="w-full"> Login
      </Button>
    </form>
  );
};


