import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import styled from 'styled-components';

// Styled-components for layout
const Container = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: var(--main-background-color);
  display: flex;
  flex-direction: column;
`;

const StyledWorkspace = styled.div`
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex: 1;
  align-items: center;
`;

const ControlSide = styled.div`
  width: 100%;
  height: 900px;
  flex: 1;
  background-color: #383838;
  color: var(--main-font-color);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  border-radius: 20px;
  border: 1px solid #adadad;
  margin: 0 20px 0 20px;
  padding: 20px;
`;

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  border-radius: 20px;
`;

const StyledTitleContainer = styled.div`
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledH1 = styled.h1`
  font-size: 3.2em;
  line-height: 1.1;
  color: var(--main-font-color);
`;

const ToggleLabel = styled.label`
  color: var(--main-font-color);
  font-size: 1.2em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  input {
    margin-right: 10px;
  }
`;

const SliderLabel = styled.label`
  color: var(--main-font-color);
  font-size: 1em;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  input {
    margin-left: 10px;
    flex: 1;
  }
`;

const StyledSnapShotContainer = styled.div`
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  border: 1px solid whitesmoke;
  border-radius: 10px;
  position: relative;
`;

const StyledSnapShotButton = styled.button`
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;

const App = () => {
  const [assetsVisibility, setAssetsVisibility] = useState({
    slash: true,
    house: true,
    chair: true,
  });
  const [assetsScale, setAssetsScale] = useState({
    slash: 0,
    house: 0,
    chair: 0,
  });
  const [controlsVisible, setControlsVisible] = useState(true);
  const [snapshot, setSnapshot] = useState(null);

  // Store loaded objects and transform controls
  const objectsRef = useRef({});
  const transformControlsRef = useRef({});
  const rendererRef = useRef();
  const canvasWrapperRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;

    const canvasWrapper = canvasWrapperRef.current;
    canvasWrapper.appendChild(renderer.domElement);

    const resizeRenderer = () => {
      const width = canvasWrapper.clientWidth;
      const height = canvasWrapper.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Function to handle Transform Controls
    const attachTransformControls = (object, key) => {
      const transformControls = new TransformControls(camera, renderer.domElement);
      transformControls.attach(object);
      scene.add(transformControls);
      transformControls.setMode('rotate');

      transformControls.addEventListener('mouseDown', () => {
        controls.enabled = false;
      });
      transformControls.addEventListener('mouseUp', () => {
        controls.enabled = true;
      });

      window.addEventListener('keydown', (event) => {
        if (event.key === 'r') transformControls.setMode('rotate');
        if (event.key === 't') transformControls.setMode('translate');
      });

      objectsRef.current[key] = object;
      transformControlsRef.current[key] = transformControls;
    };

    // Load Character Model
    const characterLoader = new FBXLoader();
    characterLoader.load(
      './src/models/slash/A_man_who_looks_like_slash_the_guitar_player_Full_body_0606154520_refine.fbx',
      (fbx) => {
        fbx.position.set(0, 0, 0);
        fbx.scale.set(0.01, 0.01, 0.01);
        attachTransformControls(fbx, 'slash');
        scene.add(fbx);
        console.log('Character model loaded');
      }
    );

    // Load Environment Model
    const environmentLoader = new FBXLoader();
    environmentLoader.load(
      './src/models/house/interior_white_square_box_straight_lines_windows_on_two_sid_0606191936_refine.fbx',
      (fbx) => {
        fbx.position.set(0, -0.05, 0);
        fbx.scale.set(0.05, 0.05, 0.05);
        scene.add(fbx);
        objectsRef.current.house = fbx;
        console.log('Environment model loaded');
      }
    );

    // Load Chair Model
    const chairLoader = new FBXLoader();
    chairLoader.load(
      './src/models/chair/Chair_0619085451.fbx', // Replace with your actual chair model path
      (fbx) => {
        fbx.position.set(0.5, 0, 0.5);  // Adjust the position as necessary
        fbx.scale.set(0.01, 0.01, 0.01);
        attachTransformControls(fbx, 'chair');
        scene.add(fbx);
        console.log('Chair model loaded');
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('An error happened while loading the chair model', error);
      }
    );

    camera.position.set(0, 2, 5);

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Add event listener for 'H' key
    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() === 'h') {
        setControlsVisible((prevVisible) => {
          const newVisible = !prevVisible;
          Object.values(transformControlsRef.current).forEach((control) => {
            control.visible = newVisible;
          });
          console.log(`Transform controls visibility toggled to: ${newVisible}`);
          return newVisible;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', resizeRenderer);
      window.removeEventListener('keydown', handleKeyDown);
      canvasWrapper.removeChild(renderer.domElement);
    };
  }, []);

  const toggleVisibility = (key) => {
    setAssetsVisibility((prevState) => {
      const newState = { ...prevState, [key]: !prevState[key] };
      if (objectsRef.current[key]) {
        objectsRef.current[key].visible = new


newState[key] && controlsVisible;
console.log(`${key} visibility toggled to: ${newState[key]}`);
}
return newState;
});
};

const handleScaleChange = (key, value) => {
setAssetsScale((prevState) => {
const newState = { ...prevState, [key]: value };
if (objectsRef.current[key]) {
let scaleFactor = 1; // Default scale factor
if (value !== 0) {
  scaleFactor = Math.pow(2, value / 10); // Calculate scale factor
}

objectsRef.current[key].scale.set(scaleFactor, scaleFactor, scaleFactor);
console.log(`${key} scale changed to: ${scaleFactor}`);
}
return newState;
});
};

const handleTakeSnapshot = () => {
// Create a canvas element for rendering
const canvas = document.createElement('canvas');
const width = canvasWrapperRef.current.clientWidth;
const height = canvasWrapperRef.current.clientHeight;
const aspectRatio = 16 / 9;
canvas.width = width;
canvas.height = width / aspectRatio;

const context = canvas.getContext('2d');
rendererRef.current.render(sceneRef.current, cameraRef.current);

// Draw renderer result on canvas
context.drawImage(rendererRef.current.domElement, 0, 0, width, height);

// Create an image element from the canvas data
const dataURL = canvas.toDataURL();
setSnapshot(dataURL);
};

return (
<Container>
<StyledTitleContainer>
<StyledH1>3D Model Viewer</StyledH1>
</StyledTitleContainer>
<StyledWorkspace>
<ControlSide>
  <h2>Assets</h2>
  <ToggleLabel>
    <input
      type="checkbox"
      checked={assetsVisibility.slash}
      onChange={() => toggleVisibility('slash')}
    />
    Slash
  </ToggleLabel>
  <SliderLabel>
    Scale:
    <input
      type="range"
      min="-10"
      max="10"
      value={assetsScale.slash}
      onChange={(e) => handleScaleChange('slash', parseInt(e.target.value))}
    />
  </SliderLabel>
  <ToggleLabel>
    <input
      type="checkbox"
      checked={assetsVisibility.house}
      onChange={() => toggleVisibility('house')}
    />
    House
  </ToggleLabel>
  <SliderLabel>
    Scale:
    <input
      type="range"
      min="-10"
      max="10"
      value={assetsScale.house}
      onChange={(e) => handleScaleChange('house', parseInt(e.target.value))}
    />
  </SliderLabel>
  <ToggleLabel>
    <input
      type="checkbox"
      checked={assetsVisibility.chair}
      onChange={() => toggleVisibility('chair')}
    />
    Chair
  </ToggleLabel>
  <SliderLabel>
    Scale:
    <input
      type="range"
      min="-10"
      max="10"
      value={assetsScale.chair}
      onChange={(e) => handleScaleChange('chair', parseInt(e.target.value))}
    />
  </SliderLabel>
 
</ControlSide>
<CanvasWrapper id="canvas-wrapper" ref={canvasWrapperRef}>
  {/* Placeholder for WebGL Canvas */}
</CanvasWrapper>
<ControlSide>
  <h2>Controls</h2>
  {/* Additional controls can be added here */}
  <StyledSnapShotContainer>
    {snapshot && <img src={snapshot} alt="Snapshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
  </StyledSnapShotContainer>
  <StyledSnapShotButton onClick={handleTakeSnapshot}>
    Take a Photo
  </StyledSnapShotButton>
</ControlSide>
</StyledWorkspace>
</Container>
);
};

export default App;
