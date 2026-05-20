import "./globals.css";
import { startCronJobs } from "./lib/cron"; 

startCronJobs();

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
