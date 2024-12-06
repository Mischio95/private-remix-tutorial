import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, redirect } from "@remix-run/node";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useLoaderData, Form, useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { PrismaClient } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as LabelPrimitive from "@radix-ui/react-label";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  return isbot(request.headers.get("user-agent") || "") ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
  }
];
function App() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App,
  links
}, Symbol.toStringTag, { value: "Module" }));
const prisma = new PrismaClient();
const addUser = async (user) => {
  return await prisma.users.create({
    data: user
  });
};
const findUser = async (id) => {
  return await prisma.users.findUnique({
    where: { id }
  });
};
const findUserByEmailPassword = async (email, password) => {
  return await prisma.users.findFirst({
    where: { email, password }
  });
};
const findUserMail = async (email) => {
  return await prisma.users.findFirst({
    where: { email }
  });
};
const deleteUser = async (id) => {
  return await prisma.users.delete({
    where: { id }
  });
};
const loader = async ({ params }) => {
  const userId = params.id ? parseInt(params.id, 10) : NaN;
  if (isNaN(userId)) {
    return redirect("/");
  }
  const user = await findUser(userId);
  if (!user) {
    return redirect("/");
  }
  const headers = new Headers();
  headers.append("Set-Cookie", `userId=${userId}; Path=/; HttpOnly`);
  return new Response(JSON.stringify(user), {
    headers: {
      "Content-Type": "application/json",
      ...Object.fromEntries(headers)
    }
  });
};
const action$1 = async ({ params, request }) => {
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
  const user = useLoaderData();
  const handleClientSideLogout = (action2) => {
    if (action2 === "logout" || action2 === "delete") {
      localStorage.removeItem("userLogged");
    }
  };
  useForm();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col md:flex-row", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full md:w-1/2 bg-black p-4 flex items-center justify-center min-h-[200px] md:min-h-screen", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: user.imageUrl || "http://micheletrombone.netsons.org/wp-content/uploads/2024/12/image.png",
        alt: "Profilo immagine",
        className: "w-full max-w-[300px] md:max-w-[50%] h-auto object-contain",
        onError: (e) => {
          e.currentTarget.src = "http://micheletrombone.netsons.org/wp-content/uploads/2024/12/image.png";
        }
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "w-full md:w-1/2 p-10 md:p-8 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 md:p-8 bg-white rounded-xl shadow-lg", children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6", children: [
        "Benvenuto, ",
        user.name,
        "!"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-gray-600 mb-6 md:mb-8", children: [
        "Email: ",
        user.email
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 md:space-y-4", children: [
        /* @__PURE__ */ jsxs(Form, { method: "post", onSubmit: () => handleClientSideLogout("logout"), children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", value: "logout" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors",
              children: "Logout"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Form, { method: "post", onSubmit: () => handleClientSideLogout("delete"), children: [
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "action", value: "delete" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors",
              children: "Delete Account"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Profile,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const userSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  imageUrl: z.string().nullable().optional().or(z.literal("")).transform((v) => v === "" ? null : v)
  // Converte stringa vuota in null
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  LabelPrimitive.Root,
  {
    ref,
    className: cn(labelVariants(), className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("mb-1 font-medium leading-none tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("text-sm [&_p]:leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";
const AuthForm = ({
  onSubmit,
  serverError,
  successMessage
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      imageUrl: ""
    }
  });
  const onSubmitForm = (data) => {
    const formData = {
      ...data,
      imageUrl: data.imageUrl || null
    };
    onSubmit(formData);
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmitForm), className: "space-y-6 mt-6", children: [
    serverError && /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
      /* @__PURE__ */ jsx(AlertTitle, { children: "Errore" }),
      /* @__PURE__ */ jsx(AlertDescription, { children: serverError })
    ] }),
    successMessage && /* @__PURE__ */ jsx(Alert, { children: /* @__PURE__ */ jsx(AlertDescription, { children: successMessage }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Username" }),
      /* @__PURE__ */ jsx(Input, { ...register("name"), id: "name", type: "text" }),
      errors.name && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: errors.name.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
      /* @__PURE__ */ jsx(Input, { ...register("email"), id: "email", type: "email" }),
      errors.email && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: errors.email.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
      /* @__PURE__ */ jsx(Input, { ...register("password"), id: "password", type: "password" }),
      errors.password && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: errors.password.message })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "imageUrl", children: "Immagine Profilo (opzionale)" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          ...register("imageUrl"),
          id: "imageUrl",
          type: "url",
          placeholder: "https://esempio.com/immagine.jpg"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Lascia vuoto se non vuoi aggiungere un'immagine" })
    ] }),
    /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", children: " Login" })
  ] });
};
const action = async ({ request }) => {
  const formData = await request.formData();
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    imageUrl: formData.get("imageUrl") || null
  };
  try {
    const validatedData = userSchema.parse(data);
    const existingUser = await findUserByEmailPassword(validatedData.email, validatedData.password);
    if (existingUser) {
      return { user: existingUser };
    }
    const emailExists = await findUserMail(validatedData.email);
    if (emailExists) {
      return { error: "Email già registrata" };
    }
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
function Index() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const [message, setMessage] = useState(void 0);
  const submit = useSubmit();
  useEffect(() => {
    if (actionData == null ? void 0 : actionData.user) {
      setMessage("Login Effettuato con successo");
      setTimeout(() => {
        var _a;
        navigate(`/profile/${(_a = actionData.user) == null ? void 0 : _a.id}`);
      }, 2e3);
    }
  }, [actionData, navigate]);
  const handleSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value.toString());
      }
    });
    submit(formData, { method: "post" });
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-gray-400 p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-8 pt-8", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      "img",
      {
        src: "https://micheletrombone.netsons.org/wp-content/uploads/2024/03/logoparticles.png",
        alt: "Logo",
        className: "w-[200px] h-[200px] object-contain rounded-lg"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md p-6 pb-30 bg-white rounded-lg shadow-md", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-center text-gray-800", children: "Registrazione / Login" }),
      /* @__PURE__ */ jsx(
        AuthForm,
        {
          onSubmit: handleSubmit,
          serverError: actionData == null ? void 0 : actionData.error,
          successMessage: message
        }
      )
    ] })
  ] }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-hJIWdqcJ.js", "imports": ["/assets/components-BgpHWJhA.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-DZTBwpbW.js", "imports": ["/assets/components-BgpHWJhA.js"], "css": ["/assets/root-CsQPkmXk.css"] }, "routes/profile.$id": { "id": "routes/profile.$id", "parentId": "root", "path": "profile/:id", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/profile._id-B8NOGizd.js", "imports": ["/assets/components-BgpHWJhA.js", "/assets/index.esm-Dbg1b2jO.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-I40VEUGk.js", "imports": ["/assets/components-BgpHWJhA.js", "/assets/index.esm-Dbg1b2jO.js"], "css": [] } }, "url": "/assets/manifest-b600e934.js", "version": "b600e934" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": true, "v3_relativeSplatPath": true, "v3_throwAbortReason": true, "v3_routeConfig": false, "v3_singleFetch": true, "v3_lazyRouteDiscovery": true, "unstable_optimizeDeps": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/profile.$id": {
    id: "routes/profile.$id",
    parentId: "root",
    path: "profile/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
