import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const personalityTypes = [
  { 
    type: 'INTJ', 
    position: [2, 2, 2], 
    color: '#FF6B6B',
    description: 'The Architect: Imaginative and strategic thinkers with a plan for everything.'
  },
  { 
    type: 'INTP', 
    position: [2, 2, -2], 
    color: '#4ECDC4',
    description: 'The Logician: Innovative inventors with an unquenchable thirst for knowledge.'
  },
  { 
    type: 'ENTJ', 
    position: [2, -2, 2], 
    color: '#45B7D1',
    description: 'The Commander: Bold, imaginative and strong-willed leaders.'
  },
  { 
    type: 'ENTP', 
    position: [2, -2, -2], 
    color: '#96CEB4',
    description: 'The Debater: Smart and curious thinkers who cannot resist an intellectual challenge.'
  },
  { 
    type: 'INFJ', 
    position: [-2, 2, 2], 
    color: '#FF9F9F',
    description: 'The Advocate: Quiet and mystical, yet very inspiring and tireless idealists.'
  },
  { 
    type: 'INFP', 
    position: [-2, 2, -2], 
    color: '#88D8B0',
    description: 'The Mediator: Poetic, kind and altruistic people, always eager to help a good cause.'
  },
  { 
    type: 'ENFJ', 
    position: [-2, -2, 2], 
    color: '#6C5B7B',
    description: 'The Protagonist: Charismatic and inspiring leaders who can mesmerize their listeners.'
  },
  { 
    type: 'ENFP', 
    position: [-2, -2, -2], 
    color: '#C06C84',
    description: 'The Campaigner: Enthusiastic, creative and sociable free spirits.'
  },
  { 
    type: 'ISTJ', 
    position: [0, 3, 0], 
    color: '#F8B195',
    description: 'The Inspector: Practical and fact-minded individuals, whose reliability cannot be doubted.'
  },
  { 
    type: 'ISFJ', 
    position: [0, -3, 0], 
    color: '#F67280',
    description: 'The Protector: Very dedicated and warm protectors, always ready to defend their loved ones.'
  },
  { 
    type: 'ESTJ', 
    position: [3, 0, 0], 
    color: '#C06C84',
    description: 'The Executive: Excellent administrators, unsurpassed at managing things or people.'
  },
  { 
    type: 'ESFJ', 
    position: [-3, 0, 0], 
    color: '#6C5B7B',
    description: 'The Consul: Extraordinarily caring, social and popular people.'
  },
  { 
    type: 'ISTP', 
    position: [0, 0, 3], 
    color: '#355C7D',
    description: 'The Virtuoso: Bold and practical experimenters, masters of all kinds of tools.'
  },
  { 
    type: 'ISFP', 
    position: [0, 0, -3], 
    color: '#99B898',
    description: 'The Adventurer: Flexible and charming artists, always ready to explore and experience something new.'
  },
  { 
    type: 'ESTP', 
    position: [1.5, 1.5, 1.5], 
    color: '#FECEA8',
    description: 'The Entrepreneur: Smart, energetic and very perceptive people.'
  },
  { 
    type: 'ESFP', 
    position: [-1.5, -1.5, -1.5], 
    color: '#FF847C',
    description: 'The Entertainer: Spontaneous, energetic and enthusiastic people – life is never boring around them.'
  },
];

const WorldMap = () => {
  const meshRef = useRef();
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        texture: { 
          value: new THREE.TextureLoader().load('/world-map-dots.png') 
        }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D texture;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          vec4 texColor = texture2D(texture, vUv);
          
          // Enhanced pulsing effect
          float pulse = sin(time * 0.5) * 0.5 + 0.5;
          
          // Create latitude lines effect
          float latLines = abs(sin(vPosition.y * 20.0)) * 0.1;
          
          // Create longitude lines effect
          float lonLines = abs(sin(vPosition.x * 20.0)) * 0.1;
          
          // Combine effects
          float lineEffect = max(latLines, lonLines);
          
          // Create a more dramatic glow effect
          vec3 baseGlow = vec3(0.0, 0.3, 0.6);
          vec3 accentGlow = vec3(0.2, 0.5, 1.0);
          
          // Enhanced brightness for map points
          float mapBrightness = texColor.r * (1.0 + pulse * 0.5);
          
          // Create a more dramatic color mix
          vec3 finalColor = mix(baseGlow, accentGlow, mapBrightness);
          finalColor += vec3(lineEffect) * 0.3;
          
          // Add subtle color variations based on position
          finalColor += vec3(0.1, 0.2, 0.3) * sin(vPosition.x * 2.0 + time);
          
          // Enhance overall brightness
          finalColor *= 1.5;
          
          // Control transparency
          float alpha = texColor.r * 0.8 + lineEffect * 0.2;
          alpha = clamp(alpha, 0.0, 0.8);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.FrontSide,
    });
  }, []);

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    shaderMaterial.uniforms.time.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} scale={[16, 16, 16]}>
      <sphereGeometry args={[1, 128, 128]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};

const PersonalityNode = ({ position, color, type, description }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef(null);
  
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });

  const handleClick = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setClicked(true);

    // Set new timeout to hide description after 10 seconds
    timeoutRef.current = setTimeout(() => {
      setClicked(false);
    }, 10000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <sphereGeometry args={[hovered ? 0.25 : 0.2, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0}
        />
      </mesh>
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.2}
        color={hovered ? '#ffffff' : color}
        anchorX="center"
        anchorY="middle"
      >
        {type}
      </Text>
      {clicked && (
        <Html position={[0, 0.8, 0]} center style={{ width: '200px' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center',
            whiteSpace: 'normal',
            pointerEvents: 'none',
            animation: 'fadeInOut 10s forwards'
          }}>
            {description}
          </div>
        </Html>
      )}
    </group>
  );
};

const ConnectionLines = () => {
  const lines = useMemo(() => {
    const lineGeometries = [];
    for (let i = 0; i < personalityTypes.length; i++) {
      for (let j = i + 1; j < personalityTypes.length; j++) {
        const start = new THREE.Vector3(...personalityTypes[i].position);
        const end = new THREE.Vector3(...personalityTypes[j].position);
        const points = [start, end];
        lineGeometries.push(points);
      }
    }
    return lineGeometries;
  }, []);

  return (
    <group>
      {lines.map((points, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
};

const PersonalityGlobe = () => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', height: '80vh', position: 'relative' }}>
      {/* Static Header */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        zIndex: 1,
        color: '#fff',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '2.8rem',
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative',
          display: 'inline-block',
          filter: 'drop-shadow(0 0 30px rgba(33, 150, 243, 0.3))',
          textShadow: `
            0 0 42px rgba(33, 150, 243, 0.2),
            0 0 82px rgba(33, 150, 243, 0.2),
            0 0 92px rgba(33, 150, 243, 0.2),
            0 0 102px rgba(33, 150, 243, 0.2),
            0 0 151px rgba(33, 150, 243, 0.2)
          `
        }}>
          <span style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: 0.7,
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            zIndex: -1
          }}>
            Welcome to MBTI Insights
          </span>
          Welcome to MBTI Insights
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#fff',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
          opacity: 0.9,
          animation: 'pulse 2s infinite',
          marginTop: '-0.5rem',
          position: 'relative',
          zIndex: 2
        }}>
          Discover yourself through the power of personality insights
        </p>
      </div>

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
          }
        `}
      </style>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        style={{
          background: 'linear-gradient(180deg, #020818 0%, #000000 100%)',
        }}
      >
        {/* Reduced ambient light for more contrast */}
        <ambientLight intensity={0.1} />
        
        {/* Added multiple point lights for dramatic effect */}
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#4a6fff" />
        <pointLight position={[-10, -10, -10]} intensity={0.2} color="#0044ff" />
        
        {/* Adjusted spotlight for better highlights */}
        <spotLight
          position={[0, 10, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.3}
          color="#ffffff"
          castShadow
        />
        
        {/* Darker fog for more depth */}
        <fog attach="fog" args={['#020818', 20, 40]} />
        
        {/* World Map Background */}
        <WorldMap />
        
        {/* Enhanced glow effect */}
        <mesh scale={[20, 20, 20]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#020818" transparent opacity={0.15} />
        </mesh>
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          minDistance={12}
          maxDistance={12}
        />
        
        <ConnectionLines />
        {personalityTypes.map((type, index) => (
          <PersonalityNode
            key={index}
            position={type.position}
            color={type.color}
            type={type.type}
            description={type.description}
          />
        ))}
      </Canvas>

      {/* Static Button */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1
      }}>
        <button
          onClick={() => navigate('/assessment')}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          style={{
            padding: '1rem 2.5rem',
            fontSize: '1.2rem',
            borderRadius: '30px',
            background: 'linear-gradient(45deg, #2196f3, #64b5f6)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}
        >
          Take the Assessment
        </button>
      </div>
    </div>
  );
};

export default PersonalityGlobe; 