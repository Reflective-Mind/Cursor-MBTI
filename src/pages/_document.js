import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Unreal Engine Mesh Generator Tool" />
        <link rel="icon" href="/favicon.ico" />
        {/* External scripts for Three.js, etc. with crossorigin attribute */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/OBJExporter.js" crossOrigin="anonymous"></script>
        {/* CodeMirror scripts and styles */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/codemirror.min.js" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/mode/javascript/javascript.min.js" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/addon/edit/matchbrackets.min.js" crossOrigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/theme/monokai.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.3/codemirror.min.css" />
        {/* Meta tags for better embedding */}
        <meta property="og:title" content="Unreal Engine Mesh Generator" />
        <meta property="og:description" content="Create and export 3D meshes compatible with Unreal Engine" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 