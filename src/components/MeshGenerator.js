import { useEffect, useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import styles from '../styles/MeshGenerator.module.css';

// Import examples from separate files to keep this file manageable
import { loadExample } from '../utils/examples';

const MeshGenerator = () => {
  // Refs for DOM elements
  const viewerRef = useRef(null);
  const codeEditorRef = useRef(null);
  const statusLogRef = useRef(null);
  const meshInfoRef = useRef(null);
  const loadingIndicatorRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const sidebarRef = useRef(null);
  const aiPromptModalRef = useRef(null);
  const aiPromptContentRef = useRef(null);
  const copyTooltipRef = useRef(null);

  // State variables
  const [codeEditor, setCodeEditor] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [controls, setControls] = useState(null);
  const [mesh, setMesh] = useState(null);
  const [gridHelper, setGridHelper] = useState(null);
  const [axesHelper, setAxesHelper] = useState(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [transformControls, setTransformControls] = useState(null);
  const [activeTransformMode, setActiveTransformMode] = useState('translate');
  const [isLocalSpace, setIsLocalSpace] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [translationSnapValue] = useState(1);
  const [rotationSnapValue] = useState(15);
  const [scaleSnapValue] = useState(1);
  const [selectedPart, setSelectedPart] = useState(null);
  const [originalMaterials] = useState(new Map());

  // Initialize everything when the component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCodeEditor();
      initViewer();
      initResizeHandle();
      
      // Cleanup on unmount
      return () => {
        if (renderer) {
          renderer.dispose();
        }
        window.removeEventListener('resize', onWindowResize);
      };
    }
  }, []);

  // Initialize CodeMirror editor
  const initCodeEditor = () => {
    if (!codeEditorRef.current || typeof window === 'undefined' || !window.CodeMirror) return;
    
    const editor = window.CodeMirror.fromTextArea(codeEditorRef.current, {
      mode: "javascript",
      theme: "monokai",
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      indentWithTabs: false,
      autofocus: true,
      lineWrapping: true
    });
    
    setCodeEditor(editor);
    
    // Set a consistent dark theme for CodeMirror
    const cmElement = document.querySelector('.CodeMirror');
    if (cmElement) {
      cmElement.style.backgroundColor = '#1e1e1e';
    }
  };

  // Initialize the 3D viewer
  const initViewer = () => {
    if (!viewerRef.current || typeof window === 'undefined' || !window.THREE) return;

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x2d2d30);
    setScene(newScene);

    // Calculate proper aspect ratio
    const viewerEl = viewerRef.current;
    const aspectRatio = viewerEl.clientWidth / viewerEl.clientHeight;

    // Create camera
    const newCamera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    newCamera.position.set(5, 0, 5);
    newCamera.lookAt(0, 0, 0);
    setCamera(newCamera);

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(viewerEl.clientWidth, viewerEl.clientHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    newRenderer.shadowMap.enabled = true;
    newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewerEl.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Add orbit controls
    const newControls = new THREE.OrbitControls(newCamera, newRenderer.domElement);
    newControls.enableDamping = true;
    newControls.dampingFactor = 0.1;
    newControls.rotateSpeed = 0.7;
    newControls.zoomSpeed = 1.2;
    
    // Move orbiting from left mouse button to middle mouse button
    newControls.mouseButtons = {
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN
    };
    setControls(newControls);

    // Add lighting
    setupLighting(newScene);

    // Add grid helper
    const newGridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
    newGridHelper.rotation.x = Math.PI / 2; // Rotate to X-Y plane
    newGridHelper.visible = false;
    newScene.add(newGridHelper);
    setGridHelper(newGridHelper);

    // Add axes helper
    const newAxesHelper = new THREE.AxesHelper(5);
    newAxesHelper.visible = false;
    newScene.add(newAxesHelper);
    setAxesHelper(newAxesHelper);

    // Initialize transform controls
    initTransformControls(newScene, newCamera, newRenderer, newControls);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add event listeners for mesh selection
    viewerEl.addEventListener('click', onMeshClick);
    viewerEl.addEventListener('mousemove', onMouseMove);

    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (newControls) newControls.update();
      if (transformControls) transformControls.update();
      if (newRenderer && newScene && newCamera) {
        newRenderer.render(newScene, newCamera);
      }
    };
    animate();

    logStatus('Viewport initialized and ready', false);
  };

  // Window resize handler
  const onWindowResize = () => {
    if (!camera || !renderer || !viewerRef.current) return;

    const viewerEl = viewerRef.current;
    camera.aspect = viewerEl.clientWidth / viewerEl.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerEl.clientWidth, viewerEl.clientHeight);
  };

  // More functionality to be added here...

  return (
    <div className={styles.container}>
      <div className={styles.sidebar} ref={sidebarRef}>
        <h1 className={styles.title}>Unreal Engine Mesh Generator</h1>
        
        {/* More UI elements to be added here... */}
        
        <div className={styles.panelLabel}>
          <span>Mesh Code Editor</span>
          <div className={styles.exampleButtons}>
            <button onClick={() => handleLoadExample('cube')}>Cube</button>
            <button onClick={() => handleLoadExample('sphere')}>Sphere</button>
            <button onClick={() => handleLoadExample('cylinder')}>Cylinder</button>
            <button onClick={() => handleLoadExample('torus')}>Torus</button>
            <button onClick={() => handleLoadExample('yinyang')}>Yin-Yang</button>
            <button onClick={() => handleLoadExample('character')}>Character</button>
            <button onClick={() => handleLoadExample('dragon')}>Dragon</button>
            <button onClick={() => handleLoadExample('tree')}>Magical Tree</button>
            <button onClick={() => handleLoadExample('custom')}>Advanced</button>
          </div>
        </div>
        
        <div className={styles.codeEditorContainer}>
          <textarea ref={codeEditorRef} id="code-input"></textarea>
        </div>
        
        <div className={styles.controls}>
          <button id="generate-btn" className={`${styles.button} ${styles.primaryBtn}`} onClick={generateMesh}>Generate Mesh</button>
          <button id="export-btn" className={`${styles.button} ${styles.exportBtn}`} onClick={exportMesh}>Export for Unreal</button>
          <button id="copy-mesh-btn" className={`${styles.button} ${styles.exportBtn}`} onClick={copyMeshToClipboard} disabled={!mesh}>Copy to Clipboard</button>
          <button className={styles.button} onClick={resetEverything}>Reset</button>
          <button id="toggle-grid-btn" className={styles.button} onClick={toggleGrid}>{gridVisible ? 'Hide Grid' : 'Show Grid'}</button>
        </div>

        <div className={styles.exportOptions}>
          <label htmlFor="export-format">Export Format:</label>
          <select id="export-format" className={styles.exportFormat}>
            <option value="obj">OBJ (Standard)</option>
            <option value="objbin">OBJ (Binary)</option>
          </select>
          <label style={{ marginLeft: '15px' }}>
            <input type="checkbox" id="export-materials" defaultChecked />
            Export Materials
          </label>
        </div>
        
        <div className={styles.aiPromptContainer}>
          <button onClick={showAiPrompt} className={styles.copyPromptBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 16H5V5h2v2h10V5h2v14z"/>
            </svg>
            Perfect AI Prompt for Mesh Generation
          </button>
          <div className={styles.tooltip} ref={copyTooltipRef}>Prompt copied to clipboard!</div>
        </div>
        
        <div className={styles.panelLabel}>
          <span>Console Output</span>
          <button onClick={clearConsole} style={{ padding: '2px 8px', margin: 0 }}>Clear</button>
        </div>
        <div className={styles.statusContainer}>
          <div className={styles.status}>
            <pre ref={statusLogRef} className={styles.statusLog}>Ready to generate mesh...</pre>
          </div>
        </div>
      </div>
      
      <div className={styles.resizeHandle} ref={resizeHandleRef}></div>
      
      <div className={styles.viewport}>
        <div ref={viewerRef} id="viewer" className={styles.viewer}></div>
        <div className={styles.meshInfo} ref={meshInfoRef}>No mesh generated</div>
        <div className={styles.loadingIndicator} ref={loadingIndicatorRef}>Generating mesh...</div>
      </div>

      {/* AI Prompt Modal */}
      <div className={styles.modal} ref={aiPromptModalRef}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>Perfect AI Prompt for Mesh Generation</div>
            <button className={styles.modalClose} onClick={closeModal}>&times;</button>
          </div>
          <div className={styles.modalBody} ref={aiPromptContentRef}></div>
          <div className={styles.modalFooter}>
            <button onClick={copyPromptToClipboard} className={`${styles.button} ${styles.primaryBtn}`}>Copy to Clipboard</button>
            <button onClick={closeModal} style={{ marginLeft: '10px' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeshGenerator; 