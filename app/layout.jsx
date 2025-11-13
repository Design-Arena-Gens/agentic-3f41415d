import './globals.css';

export const metadata = {
  title: 'Mindcraft 3D',
  description: 'Voxel sandbox in the browser',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
