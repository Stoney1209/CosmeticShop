"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUsers(search?: string) {
  const where = search ? {
    OR: [
      { username: { contains: search, mode: "insensitive" as const } },
      { fullName: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
    ]
  } : undefined;

  return await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, fullName: true, email: true, role: true, isActive: true, createdAt: true }
  });
}

export async function createUser(data: any) {
  try {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: passwordHash,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        isActive: data.isActive
      }
    });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "El usuario ya existe" };
    return { success: false, error: "Error al crear usuario" };
  }
}

export async function updateUser(id: number, data: any) {
  try {
    let updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }
    
    await prisma.user.update({
      where: { id },
      data: updateData
    });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar" };
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/usuarios");
    return { success: true };
  } catch (error) {
    return { success: false, error: "No se puede eliminar (tiene registros asociados)" };
  }
}
