'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// This component renders a 3D animation of a node graph within a Matrix-style digital rain.
export function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      composer: EffectComposer,
      matrixPoints: THREE.Points,
      graphGroup: THREE.Group // To hold the nodes and lines

    const mouse = new THREE.Vector2()
    const clock = new THREE.Clock()

    // --- Shader Definitions for Matrix Rain ---
    const matrixVertexShader = `
      // Uniforms passed from JavaScript
      uniform float clockTime; // <-- FIX: Declared the missing uniform variable

      // Attributes from the buffer geometry
      attribute float size;
      attribute vec3 customColor;
      attribute float speed;

      // Varying sent to the fragment shader
      varying vec3 vColor;

      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Animate the rain falling using the clockTime uniform
        float newY = position.y - (speed * clockTime * 0.1);
        mvPosition.y = mod(newY, 40.0) - 20.0; // Wrap around effect

        gl_PointSize = size * (400.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `
    const matrixFragmentShader = `
      uniform vec3 color;
      uniform sampler2D pointTexture;
      varying vec3 vColor;
      void main() {
        gl_FragColor = vec4(color * vColor, 1.0) * texture2D(pointTexture, gl_PointCoord);
        if (gl_FragColor.a < 0.5) discard; // Avoid rendering black squares from the texture
      }
    `

    function init() {
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 10

      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setClearColor(0x000000, 1)

      // --- Post-processing for Glow ---
      const renderPass = new RenderPass(scene, camera)
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
      bloomPass.threshold = 0
      bloomPass.strength = 1.8 
      bloomPass.radius = 0.6

      composer = new EffectComposer(renderer)
      composer.addPass(renderPass)
      composer.addPass(bloomPass)
      
      // --- Graph (Nodes and Edges) ---
      graphGroup = new THREE.Group();
      const nodeCount = 150;
      const nodeGeometry = new THREE.BufferGeometry();
      const nodePositions = new Float32Array(nodeCount * 3);
      const nodePoints = [];
      
      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 12;
        nodePositions[i * 3] = x;
        nodePositions[i * 3 + 1] = y;
        nodePositions[i * 3 + 2] = z;
        nodePoints.push(new THREE.Vector3(x, y, z));
      }
      nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
      const nodeMaterial = new THREE.PointsMaterial({
        color: 0xda70d6, // <-- CHANGE: Set to pinkish-purple (Orchid)
        size: 0.2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
      });
      const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
      graphGroup.add(nodes);

      // Create lines (edges) connecting nearby nodes
      const linePositions = [];
      const connectionDistance = 2.5;
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodePoints[i].distanceTo(nodePoints[j]) < connectionDistance) {
            linePositions.push(nodePoints[i].x, nodePoints[i].y, nodePoints[i].z);
            linePositions.push(nodePoints[j].x, nodePoints[j].y, nodePoints[j].z);
          }
        }
      }
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xda70d6, // <-- CHANGE: Set to pinkish-purple to match nodes
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      graphGroup.add(lines);
      scene.add(graphGroup);

      // --- star Rain ---
      const rainParticleCount = 2000
      const rainGeometry = new THREE.BufferGeometry()
      const rainPositions = new Float32Array(rainParticleCount * 3)
      const rainColors = new Float32Array(rainParticleCount * 3)
      const rainSizes = new Float32Array(rainParticleCount)
      const rainSpeeds = new Float32Array(rainParticleCount)
      
      const baseColor = new THREE.Color(0xffffff); // Matrix green
      for (let i = 0; i < rainParticleCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 40;
        rainPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        
        const color = new THREE.Color(Math.random() > 0.9 ? 0xffffff : baseColor.getHex());
        rainColors[i * 3] = color.r;
        rainColors[i * 3 + 1] = color.g;
        rainColors[i * 3 + 2] = color.b;
        
        rainSizes[i] = Math.random() * 0.1 + 0.05;
        rainSpeeds[i] = Math.random() * 2.0 + 1.0;
      }
      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      rainGeometry.setAttribute('customColor', new THREE.BufferAttribute(rainColors, 3));
      rainGeometry.setAttribute('size', new THREE.BufferAttribute(rainSizes, 1));
      rainGeometry.setAttribute('speed', new THREE.BufferAttribute(rainSpeeds, 1));
      
      const rainMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color('0xE03FD8') },
          pointTexture: { value: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png') },
          clockTime: { value: 0.0 }
        },
        vertexShader: matrixVertexShader,
        fragmentShader: matrixFragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
      });
      matrixPoints = new THREE.Points(rainGeometry, rainMaterial);
      
      scene.add(matrixPoints);

      window.addEventListener('resize', onWindowResize)
      document.addEventListener('mousemove', onMouseMove)
    }

    function onWindowResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      composer.setSize(width, height)
    }

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Animate the graph
      graphGroup.rotation.y += delta * 0.1;
      graphGroup.rotation.x += delta * 0.05;

      // Animate the matrix rain by updating the shader's time uniform
      const rainMaterial = matrixPoints.material as THREE.ShaderMaterial;
      rainMaterial.uniforms.clockTime.value = time;

      // Animate camera position based on mouse
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position)

      composer.render()
    }

    init()
    animate()

    return () => {
      window.removeEventListener('resize', onWindowResize)
      document.removeEventListener('mousemove', onMouseMove)
      // Clean up Three.js objects on component unmount
      renderer.dispose();
      scene.traverse(object => {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.LineSegments) {
              object.geometry.dispose();
              (object.material as THREE.Material).dispose();
          }
      })
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" />
  )
}