import { cookies } from "next/headers";

const THEME_COOKIE_NAME = "theme";
type TTheme = "light" | "dark";

export async function getTheme(): Promise<TTheme> {
  const cookieStore = await cookies();
  const theme = cookieStore.get(THEME_COOKIE_NAME)?.value as TTheme;
  
  if (theme !== "light" && theme !== "dark") {
    return "light"; // default
  }
  
  return theme;
}