import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
  imageUrl: z.string().url("URL dell'immagine non valido").optional().nullable()
});