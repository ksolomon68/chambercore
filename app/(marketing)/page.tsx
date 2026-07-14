import { Hero } from "@/components/marketing/Hero";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { ModuleShowcase } from "@/components/marketing/ModuleShowcase";
import { PricingSection } from "@/components/marketing/PricingSection";
import { ClosingSection } from "@/components/marketing/ClosingSection";

export default function MarketingHomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FeatureGrid />
      <ModuleShowcase />
      <PricingSection />
      <ClosingSection />
    </>
  );
}
