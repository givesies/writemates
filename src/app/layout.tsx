import type { Metadata } from "next";
import { Source_Serif_4, Work_Sans } from "next/font/google";
import "./globals.css";
import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Writemates",
  description: "Track your writing progress with fellow writers",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Writemates",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? null
  }

  return (
    <html lang="en" className={`${sourceSerif.variable} ${workSans.variable}`}>
      <body className="min-h-full flex flex-col">
        <NavBar username={username} />
        {children}
      </body>
    </html>
  );
}