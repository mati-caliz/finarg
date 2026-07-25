import { CountryStatus } from "@/components/home/CountryStatus";
import { GapsTeaser } from "@/components/home/GapsTeaser";
import { HomeHero } from "@/components/home/HomeHero";
import { IdeasHome } from "@/components/home/IdeasHome";

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <CountryStatus />
      <GapsTeaser />
      <IdeasHome />
    </div>
  );
}
