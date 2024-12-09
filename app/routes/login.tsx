import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { addUser, findUserByEmailPassword, findUserMail, User } from "../users";
import { AuthForm } from '~/components/ui/AuthForm';
import { z } from "zod";
import { userSchema } from "~/validation/userSchemas";

type UserFormData = z.infer<typeof userSchema>; // Tipo derivato dallo schema Zod

// Tipo per i dati restituiti dall'action
export type ActionData = {
  error?: string;
  user?: User;
};

export const action: ActionFunction = async ({ request }) => {
  // Estrazione dati dal form
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    imageUrl: formData.get("imageUrl") as string || null
  };

  try {
    const validatedData = userSchema.parse(data); // verifico che i dati restuiti siano corretti
    
    // Verifica se l'utente esiste già
    const existingUser = await findUserByEmailPassword(validatedData.email, validatedData.password);
    
    if (existingUser) {
      return { user: existingUser };
    }

    // Se l'utente non esiste, verifica se l'email è già registrata
    const emailExists = await findUserMail(validatedData.email);
    if (emailExists) {
      return { error: "Email già registrata" };
    }
    
    const user = await addUser(validatedData);
    return { user, setMessage: "Utente registrato con successo" };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    console.error("Errore durante la registrazione:", error);
    return { error: "Errore durante la registrazione" };
  }
};

export default function Login() {
  const actionData = useActionData<ActionData>(); // Dati restituiti dall'action
  const navigate = useNavigate(); // Hook per la navigazione
  const [message, setMessage] = useState<string | undefined>(undefined);
  const submit = useSubmit(); // Hook per l'invio del form

  useEffect(() => {
    if (actionData?.user) {
      setMessage("Login Effettuato con successo");
      setTimeout(() => {
        navigate(`/profile/${actionData.user?.id}`);
      }, 2000);
    }
  }, [actionData, navigate]);


  // Gestione del submit del form con React Hook Form
  const handleSubmit = (data: UserFormData) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value.toString());
      }
    });
    submit(formData, { method: "post" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-gray-400 p-4">   
      {/* Container principale con padding e flex column */}
      <div className="flex flex-col items-center space-y-8 pt-8">
        {/* Immagine superiore centrata e responsive */}
        <div>
          <img 
            src="https://micheletrombone.netsons.org/wp-content/uploads/2024/03/logoparticles.png"
            alt="Logo"
            className="w-[200px] h-[200px] object-contain rounded-lg"
            />
        </div> 
        
        {/* Form container con stile a scheda */}
        <div className="w-full max-w-md p-6 pb-30 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-800">Registrazione / Login</h1>
          <AuthForm 
            onSubmit={handleSubmit}
            serverError={actionData?.error}
            successMessage={message}
          />
        </div>
      </div>
    </div>
  );
}