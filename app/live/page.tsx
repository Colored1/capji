import type { Metadata } from "next";
import LiveCenter from "@/components/live/LiveCenter";
import Footer from "@/components/Footer";
import { getLiveMatches } from "@/lib/live";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "البث المباشر والأرشيف",
  description: "شاهد المباريات المباشرة وأرشيف المباريات المسجّلة.",
  alternates: { canonical: "/live" },
};

export default async function LivePage() {
  const { matches, error } = await getLiveMatches();
  return (
    <>
      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-10 pt-28 md:px-8">
        <LiveCenter matches={matches} error={error} />
      </main>
      <Footer />
    </>
  );
}
