import { BrechasTeaser } from "@/components/home/BrechasTeaser";
import { EstadoPais } from "@/components/home/EstadoPais";
import { HomeHero } from "@/components/home/HomeHero";
import { IdeasHome } from "@/components/home/IdeasHome";

export default function HomePage() {
  return (
    <div>
      <HomeHero />
      <EstadoPais />
      <BrechasTeaser />
      <IdeasHome />
    </div>
  );
}
