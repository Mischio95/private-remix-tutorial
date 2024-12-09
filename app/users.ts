import prisma from './db';
import { toast } from 'react-hot-toast';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  imageUrl?: string | null;
}

export const addUser = async (user: Omit<User, 'id'>) => {
  return await prisma.users.create({
    data: user,
  });
};

export const findUser = async (id: number) => {
  return await prisma.users.findUnique({
    where: { id },
  });
};

export const findUserByEmailPassword = async (email: string, password: string) => {
  return await prisma.users.findFirst({
    where: { email, password },
  });
};

//controllo se la mail è gia presente
export const findUserMail = async (email: string) => {
  return await prisma.users.findFirst({
    where: { email },
  });
}

export const deleteUser = async (id: number) => {
  return await prisma.users.delete({
    where: { id },
  });
};

export const findImage = async (imageUrl: string) => {
  return await prisma.users.findFirst({
    where: { imageUrl },
  });
}