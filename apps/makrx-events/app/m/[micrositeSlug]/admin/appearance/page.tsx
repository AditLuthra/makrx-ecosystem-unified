import { notFound } from "next/navigation";
import AppearanceClient from "./AppearanceClient";

interface MicrositeAppearancePageProps {
  params: {
    micrositeSlug: string;
  };
}

export default async function MicrositeAppearancePage({ params }: MicrositeAppearancePageProps) {
  const { micrositeSlug } = await params;

  if (!micrositeSlug) {
    notFound();
  }

  return <AppearanceClient micrositeSlug={micrositeSlug} />;
}