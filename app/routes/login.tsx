// import type { MetaFunction } from "@remix-run/node";
// import { Form, Link, useActionData, useNavigate } from "@remix-run/react";
// import { useEffect, useState } from "react";
// import { addUser, findUserByEmailPassword, User } from "../users"; // Usa un percorso relativo
// type ActionData = {
//   error?: string,
//   user?: User
// }
// import { Button } from "~/components/ui/button"
// import { Input } from "~/components/ui/input"
// import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
// import { Label } from "~/components/ui/label"
// import { z } from "zod";
// import { userSchema } from "~/validation/userSchemas";
// import { useForm } from "react-hook-form";

// // export const action = async ({request}: {request: Request}) => {
// //   const fromData = await request.formData();
// //   const name = fromData.get("name") as string;
// //   const email = fromData.get("email") as string;
// //   const password = fromData.get("password") as string;
// //   const result = userSchema.safeParse({ name, email, password });

// //   if (!result.success) {
// //     const errors = result.error.errors.map((err) => err.message).join(", ");
// //     return { error: errors };
// //   }
  
// //   if (!email || !password) {
// //     return Response.json({ error: "Email e password sono obbligatori" }, { status: 400 });
// //   }

// //   const existingUser = await findUserByEmailPassword(email, password);

// //   if (!existingUser) {
// //     const newUser = {
// //       name,
// //       email,
// //       password
// //     };
// //     await addUser(newUser);
// //     return Response.json({ user: newUser }, { status: 200 });
// //   }

// //   return Response.json({ user: existingUser }, { status: 200 });
// // };

// export const action = async ({ request }: { request: Request }) => {
//   const formData = await request.formData();
//   const name = formData.get("name") as string;
//   const email = formData.get("email") as string;
//   const password = formData.get("password") as string;

//   //Validazione campi zod ( passo i parametri name, email e password )
//   const result = userSchema.safeParse({ name, email, password });

//   if (!result.success) {
//     const errors = result.error.errors.map((err) => err.message).join(", ");
//     return { error: errors };
//   }

//   const existingUser = await findUserByEmailPassword(email, password);

//   if (!existingUser) {
//     try {
//       const newUser = {
//         name,
//         email,
//         password
//       };
//       await addUser(newUser);
//       return { user: newUser, message: "Registrazione effettuata con successo!" };
//     } catch (error: any) {
//       if (error?.code === 'P2002' && error?.meta.target.includes('email')) {
//         return { error: "L'email è già registrata. Per favore, usa un'altra email." };
//       }
//       throw error;
//     }
//   }

//   return { user: existingUser, message: "Login effettuato con successo!" };
// };

// export default function Index() {
//   const actionData = useActionData<ActionData>();
//   const navigate = useNavigate();
//   const [message, setMessage] = useState<string | null>(null);

//   // controllo che effettivamente sia loggato l'utente, in modo che possa essere reindirizzato alla sua pagina di profilo
//   useEffect(() => { 
//     const storedUser = localStorage.getItem("userLogged");
//     if (storedUser) {
//       const user = JSON.parse(storedUser);
//       location.pathname = `/profile/${user.id}`;
//     }
//     if (actionData?.user) {
//       localStorage.setItem("userLogged", JSON.stringify(actionData.user));
//       setMessage("Login Effettuato con successo");
//       setTimeout(() => {
//       navigate(`/profile/${actionData.user?.id}`);
//       }, 2000);
//     }
//   }, [actionData, navigate]);

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
//       <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
//         <h1 className="text-2xl font-bold text-center text-gray-800">Registrazione / Login</h1>
//         {actionData?.error && (
//           <Alert>
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{actionData.error}</AlertDescription>
//           </Alert>
//         )}
//         {message && (
//           <Alert>
//             <AlertDescription>{message}</AlertDescription>
//           </Alert>
//         )}
//         <Form method="post" className="space-y-6 mt-6">
//           <div>
//             <Label htmlFor="name">Nome</Label>
//             <Input type="text" name="name" id="name" />
//           </div>
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input type="email" name="email" id="email" />
//           </div>
//           <div>
//             <Label htmlFor="password">Password</Label>
//             <Input type="password" name="password" id="password" />
//           </div>
//           <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Login</Button>
//         </Form>
//       </div>
//     </div>
//   );
// }

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
    const validatedData = userSchema.parse(data);
    
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

    // Crea il nuovo utente
    const user = await addUser(validatedData);
    return { user };

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