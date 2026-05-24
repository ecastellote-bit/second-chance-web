import { redirect } from "next/navigation";
import HomeDevTools from "./HomeDevTools";

export default function HomePage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/fundador");
  }

  return <HomeDevTools />;
}
