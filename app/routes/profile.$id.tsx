import { deleteUser, findUser, findUserMail, User } from "../users"; // Usa un percorso relativo
import { Form, useLoaderData } from "@remix-run/react";
import { LoaderFunction, ActionFunction,redirect} from "@remix-run/node";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

export const loader: LoaderFunction = async ({ params }) => {
  // Estrae e converte l'ID utente da stringa a numero
  // Se non esiste, imposta NaN
  const userId = params.id ? parseInt(params.id, 10) : NaN;

  if (isNaN(userId)) {
    return redirect("/");
  }

  // Cerca l'utente nel database usando l'ID
  const user = await findUser(userId);
  if (!user) {
    return redirect("/");
  }
  
  // Creazione degli headers della risposta
  const headers = new Headers();
  // Aggiunge un cookie di sessione con l'ID dell'utente
  // HttpOnly impedisce l'accesso via JavaScript per sicurezza
  headers.append("Set-Cookie", `userId=${userId}; Path=/; HttpOnly`);

  // Restituisce la risposta con:
  // - I dati dell'utente convertiti in JSON
  // - Headers per il tipo di contenuto
  // - Cookie di sessione
  return new Response(JSON.stringify(user), {
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(headers)
    }
  });
};

export const action: ActionFunction = async ({ params, request }) => {
  const formData = await request.formData();
  const actionType = formData.get("action");

  if (actionType === "logout") {
    return redirect("/");
  }

  if (actionType === "delete") {
    const userId = params.id ? parseInt(params.id, 10) : NaN;
    if (!isNaN(userId)) {
      await deleteUser(userId);
    }
    return redirect("/");
  }

  return redirect("/");
};

const Profile = () => {
  
  const user = useLoaderData<User>();

  const handleClientSideLogout = (action: string) => {
    if (action === "logout" || action === "delete") {
      localStorage.removeItem("userLogged");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Colonna immagine - occupa tutto lo spazio su mobile, metà su desktop */}
      <div className="w-full md:w-1/2 bg-black p-4 flex items-center justify-center min-h-[200px] md:min-h-screen">
        <img 
          src={user.imageUrl || "http://micheletrombone.netsons.org/wp-content/uploads/2024/12/image.png"}
          alt="Profilo immagine"
          className="w-full max-w-[300px] md:max-w-[50%] h-auto object-contain"
          onError={(e) => {
            e.currentTarget.src = "http://micheletrombone.netsons.org/wp-content/uploads/2024/12/image.png"
          }}
        />
      </div>
  
      {/* Colonna contenuto - occupa tutto lo spazio su mobile, metà su desktop */} 
      <div className="w-full md:w-1/2 p-10 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md p-6 md:p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            Benvenuto, {user.name}!
          </h1>
          
          <p className="text-gray-600 mb-6 md:mb-8">
            Email: {user.email}
          </p>
          
          <div className="space-y-3 md:space-y-4">
            <Form method="post" onSubmit={() => handleClientSideLogout("logout")}>
              <input type="hidden" name="action" value="logout" />
              <button type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Logout
              </button>
            </Form>
  
            <Form method="post" onSubmit={() => handleClientSideLogout("delete")}>
              <input type="hidden" name="action" value="delete" />
              <button type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Delete Account  
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;