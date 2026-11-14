"use server";

import { revalidatePath } from "next/cache";

// يحدّث الصفحة الرئيسية فوراً بعد أي تغيير في الهيرو
export async function refreshHome() {
  revalidatePath("/");
}
