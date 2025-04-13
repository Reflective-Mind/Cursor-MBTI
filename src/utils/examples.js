// Example code for different mesh types
export const examples = {
  cube: `// Create a basic cube mesh
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x00aaff,
    roughness: 0.4,
    metalness: 0.3
});
generatedMesh = new THREE.Mesh(geometry, material);

// Log information about the mesh
logStatus('Created a cube with 6 faces');`,

  sphere: `// Create a detailed sphere mesh
const geometry = new THREE.SphereGeometry(1, 64, 48);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xff5500,
    roughness: 0.2,
    metalness: 0.7
});
generatedMesh = new THREE.Mesh(geometry, material);

// Log information about the mesh
logStatus('Created a sphere with high detail');`,

  cylinder: `// Create a cylinder mesh
const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const material = new THREE.MeshStandardMaterial({ 
    color: 0x22cc22,
    roughness: 0.6,
    metalness: 0.1
});
generatedMesh = new THREE.Mesh(geometry, material);

// Log information about the mesh
logStatus('Created a cylinder with height 2 and radius 0.5');`,

  torus: `// Create a torus (donut) mesh
const geometry = new THREE.TorusGeometry(1, 0.4, 32, 100);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xffcc00,
    roughness: 0.5,
    metalness: 0.5
});
generatedMesh = new THREE.Mesh(geometry, material);

// Log information about the mesh
logStatus('Created a torus with radius 1 and tube radius 0.4');`
};

// Returns the appropriate example code for the specified type
export const loadExample = (type) => {
  if (examples[type]) {
    return examples[type];
  }
  
  // For more complex examples, we'll dynamically import them
  // This keeps the initial bundle size smaller
  return import(`./examples/${type}.js`)
    .then(module => module.default)
    .catch(() => {
      console.error(`Example '${type}' not found`);
      return examples.cube; // Return a default example as fallback
    });
};

// Generate AI prompt based on the mesh type
export const generateAiPrompt = (meshType) => {
  // The prompt template with exact text provided by the user
  return `
Create THREE.js code for a 3D mesh for my Unreal Engine mesh generator tool.

My specific request is for a ${meshType} mesh with interesting modifications or properties.

Key requirements:
- Ensure the mesh has appropriate detail for a game-ready asset
- Apply a suitable material with physically-based rendering properties
- Make any positioning or rotation adjustments needed
- Add any useful comments about the mesh's properties

The code MUST:
1. Create all necessary geometries for the different parts of the mesh
2. Define appropriate materials for each part (with different colors/finishes if needed)
3. Position and combine the parts properly
4. Assign the final combined mesh to a variable called "generatedMesh"

My tool supports the following methods and features:
- Standard THREE.js geometry creation functions (BoxGeometry, SphereGeometry, etc.)
- THREE.MeshStandardMaterial for creating materials with physically-based rendering
- A helper function called createMultiMaterialMesh(geometries, materials) for easily combining multiple geometries with different materials
- THREE.Group for grouping multiple mesh parts

The code will be evaluated in a context where THREE.js is already imported. Prevent z-fighting by using small offsets (0.001) on overlapping geometries.

Here's an example of proper code structure:
javascript
// Create materials with appropriate properties
const material1 = new THREE.MeshStandardMaterial({
    color: 0xRRGGBB,
    roughness: 0.5,
    metalness: 0.3
});

// Create geometries for different parts
const geometry1 = new THREE.BoxGeometry(1, 1, 1);

// For a single-material mesh:
generatedMesh = new THREE.Mesh(geometry1, material1);

// OR for multi-material meshes:
generatedMesh = createMultiMaterialMesh([geometry1, geometry2], [material1, material2]);

// Optionally position or rotate the final mesh
generatedMesh.rotation.x = Math.PI/2;

// Log info about what was created
logStatus('Created a [description of mesh]');`;
}; 