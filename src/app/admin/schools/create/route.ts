import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const form = await request.formData();
  const name = form.get("name") as string;
  const city = (form.get("city") as string) || null;

  await prisma.school.create({
    data: { name, city }
  });

  redirect("/admin/schools");
}
