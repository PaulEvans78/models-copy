// src/ThreeScene.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#a0a0a0'); // Set background color

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Append the renderer to the mount reference
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Add light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Load STL file
    const loader = new STLLoader();
    loader.load('/cuboid.stl', function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: '#b6d9f0',
        transparent: true,
        opacity: 0.5
      }); // Set cube color and transparency
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Adjust the position and scale of the mesh if needed
      mesh.position.set(0, 0, 0);
      mesh.scale.set(1, 1, 1);

      // Rotate the mesh to have the 16cm x 24cm sides on the bottom and top
      mesh.rotation.x = Math.PI / 2; // Rotate 90 degrees around the X-axis
    }, undefined, function (error) {
      console.error('Error loading STL file:', error);
    });

    // Set up the camera position
    camera.position.set(0, 0, 100);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} />; // Return a div to mount the Three.js renderer
};

export default ThreeScene;
