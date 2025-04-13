import { useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamic import of the MeshGenerator component with SSR disabled
// This is necessary because it uses browser-specific APIs like THREE.js
const MeshGenerator = dynamic(
  () => import('../components/MeshGenerator'),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Unreal Engine Mesh Generator</title>
        <meta name="description" content="Create and export 3D meshes compatible with Unreal Engine" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <MeshGenerator />
      </main>
    </>
  );
} 