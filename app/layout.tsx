import "./globals.css";

export const metadata = {
  title: "Silica Store",
  description: "Premium fashion drops by Silica.",
  icons: {
    icon: "/silica-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}