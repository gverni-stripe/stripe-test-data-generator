import "./globals.css";

export const metadata = {
  title: "Stripe Test Scenario Creator",
  description: "Create test scenarios for Stripe integrations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">{children}</body>
    </html>
  );
}
