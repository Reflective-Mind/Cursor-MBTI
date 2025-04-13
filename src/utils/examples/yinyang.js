// Yin-Yang example
export default `// Create a proper Yin-Yang symbol with distinct black and white parts
// Designed for clean import into Unreal Engine with proper material slots

// Create materials with unique names and proper properties for Unreal Engine
const whiteMaterial = new THREE.MeshStandardMaterial({ 
    name: "white_material",
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.FrontSide,       // Use FrontSide to avoid overlap
    transparent: false           // Ensure it's not transparent
});

const blackMaterial = new THREE.MeshStandardMaterial({ 
    name: "black_material",
    color: 0x000000,
    roughness: 0.2,
    metalness: 0.1,
    side: THREE.FrontSide,       // Use FrontSide to avoid overlap
    transparent: false           // Ensure it's not transparent
});

// The main group to hold all parts
generatedMesh = new THREE.Group();

// Dimensions for the yin-yang
const radius = 1;
const segments = 64;
const thickness = 0.3;  // Thickness that works well in Unreal Engine
const circleProtrusion = 0.03; // How much the small circles protrude

// Helper function to create a cylinder segment
function createCylinderSegment(radius, height, segments, startAngle, endAngle) {
    const geometry = new THREE.CylinderGeometry(
        radius, radius, height, segments, 1, false, startAngle, endAngle
    );
    geometry.rotateX(Math.PI/2);
    return geometry;
}

// Helper function to prevent z-fighting by adding a tiny gap
function applyTinyAngleGap(geometry, isFirst) {
    const angleGap = 0.01; // Tiny angle gap
    const positions = geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Only adjust points at the dividing line (where y ≈ 0)
        if (Math.abs(y) < 0.01) {
            // Move the point slightly away from the center line
            if (isFirst) {
                positions[i + 1] += angleGap;
            } else {
                positions[i + 1] -= angleGap;
            }
        }
    }
    
    geometry.attributes.position.needsUpdate = true;
    return geometry;
}

// ===== CREATE THE MAIN DISC =====

// 1. Create the white half of the main disc
const whiteHalfGeometry = createCylinderSegment(radius, thickness, segments, 0, Math.PI);
whiteHalfGeometry.rotateY(Math.PI);
// Apply tiny gap to prevent overlap
applyTinyAngleGap(whiteHalfGeometry, true);
const whiteHalf = new THREE.Mesh(whiteHalfGeometry, whiteMaterial);
whiteHalf.name = "white_half";
generatedMesh.add(whiteHalf);

// 2. Create the black half of the main disc
const blackHalfGeometry = createCylinderSegment(radius, thickness, segments, 0, Math.PI);
// Apply tiny gap to prevent overlap
applyTinyAngleGap(blackHalfGeometry, false);
const blackHalf = new THREE.Mesh(blackHalfGeometry, blackMaterial);
blackHalf.name = "black_half";
generatedMesh.add(blackHalf);

// ===== CREATE THE INNER SEMICIRCLES =====

// 3. Create the white inner semicircle (in the black half)
const innerRadius = radius * 0.5;
const whiteInnerGeometry = createCylinderSegment(
    innerRadius, thickness + 0.001, segments, 0, Math.PI 
);
// Position in the black half
whiteInnerGeometry.translate(0, radius/2, 0);
// Apply tiny gap to prevent overlap
applyTinyAngleGap(whiteInnerGeometry, true);
const whiteInner = new THREE.Mesh(whiteInnerGeometry, whiteMaterial);
whiteInner.name = "white_inner";
generatedMesh.add(whiteInner);

// 4. Create the black inner semicircle (in the white half)
const blackInnerGeometry = createCylinderSegment(
    innerRadius, thickness + 0.001, segments, 0, Math.PI
);
blackInnerGeometry.rotateY(Math.PI);
// Position in the white half
blackInnerGeometry.translate(0, -radius/2, 0);
// Apply tiny gap to prevent overlap
applyTinyAngleGap(blackInnerGeometry, false);
const blackInner = new THREE.Mesh(blackInnerGeometry, blackMaterial);
blackInner.name = "black_inner";
generatedMesh.add(blackInner);

// ===== CREATE THE SMALL DOTS =====

// 5. Create the white dot (in the black inner semicircle)
const dotRadius = radius * 0.15;
// Make the dots protrude slightly on both sides
const dotHeight = thickness + (circleProtrusion * 2);
const whiteDotGeometry = new THREE.CylinderGeometry(
    dotRadius, dotRadius, dotHeight, segments
);
whiteDotGeometry.rotateX(Math.PI/2);
// Position it in the black inner semicircle 
whiteDotGeometry.translate(0, -radius/2, 0);
const whiteDot = new THREE.Mesh(whiteDotGeometry, whiteMaterial);
whiteDot.name = "white_dot";
generatedMesh.add(whiteDot);

// 6. Create the black dot (in the white inner semicircle)
const blackDotGeometry = new THREE.CylinderGeometry(
    dotRadius, dotRadius, dotHeight, segments
);
blackDotGeometry.rotateX(Math.PI/2);
// Position it in the white inner semicircle
blackDotGeometry.translate(0, radius/2, 0);
const blackDot = new THREE.Mesh(blackDotGeometry, blackMaterial);
blackDot.name = "black_dot";
generatedMesh.add(blackDot);

// ===== FINAL ADJUSTMENTS =====

// Make sure shadow casting works properly for all parts
generatedMesh.children.forEach(part => {
    part.castShadow = true;
    part.receiveShadow = true;
});

// Final orientation adjustments to show the classic yin-yang orientation
generatedMesh.rotation.z = Math.PI/2;

// Log creation information
logStatus('Created a proper Yin-Yang symbol with 2 material slots (black and white) optimized for Unreal Engine');`; 