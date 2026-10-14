export const metadata = {
  title: "KMITL Marketplace",
  description: "ระบบซื้อขายและกระจายสินค้าสำหรับชาว สจล.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}