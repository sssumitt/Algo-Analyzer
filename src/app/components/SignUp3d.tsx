'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let animationFrameId: number;

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) // alpha: true is important
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 1.5, 0.4, 0.85)
    bloomPass.threshold = 0
    bloomPass.strength = 1.8
    bloomPass.radius = 0.6
    composer.addPass(bloomPass)
      
   
    // --- Star Rain ---
    // (Shader code and particle setup remains identical to the previous version)
    const matrixVertexShader = `uniform float clockTime;attribute float size;attribute vec3 customColor;attribute float speed;varying vec3 vColor;void main(){vColor=customColor;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);float newY=position.y-(speed*clockTime*0.1);mvPosition.y=mod(newY,40.0)-20.0;gl_PointSize=size*(400.0/-mvPosition.z);gl_Position=projectionMatrix*mvPosition;}`
    const matrixFragmentShader = `uniform vec3 color;uniform sampler2D pointTexture;varying vec3 vColor;void main(){gl_FragColor=vec4(color*vColor,1.0)*texture2D(pointTexture,gl_PointCoord);if(gl_FragColor.a<0.5)discard;}`
    const rainParticleCount=5000;const rainGeometry=new THREE.BufferGeometry();const rainPositions=new Float32Array(rainParticleCount*3);const rainColors=new Float32Array(rainParticleCount*3);const rainSizes=new Float32Array(rainParticleCount);const rainSpeeds=new Float32Array(rainParticleCount);const baseColor=new THREE.Color(0xffffff);for(let i=0;i<rainParticleCount;i++){rainPositions[i*3]=(Math.random()-.5)*40;rainPositions[i*3+1]=(Math.random()-.5)*40;rainPositions[i*3+2]=(Math.random()-.5)*40;const color=new THREE.Color(Math.random()>.9?16777215:baseColor.getHex());rainColors[i*3]=color.r;rainColors[i*3+1]=color.g;rainColors[i*3+2]=color.b;rainSizes[i]=Math.random()*.1+.05;rainSpeeds[i]=Math.random()*2+1}
    rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));rainGeometry.setAttribute('customColor',new THREE.BufferAttribute(rainColors,3));rainGeometry.setAttribute('size',new THREE.BufferAttribute(rainSizes,1));rainGeometry.setAttribute('speed',new THREE.BufferAttribute(rainSpeeds,1));
    const rainMaterial=new THREE.ShaderMaterial({uniforms:{color:{value:new THREE.Color("0xE03FD8")},pointTexture:{value:(new THREE.TextureLoader).load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png")},clockTime:{value:0}},vertexShader:matrixVertexShader,fragmentShader:matrixFragmentShader,blending:THREE.AdditiveBlending,depthTest:!1,transparent:!0});
    const matrixPoints = new THREE.Points(rainGeometry, rainMaterial);
    scene.add(matrixPoints);

    const mouse = new THREE.Vector2()
    const clock = new THREE.Clock()
    
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }
    document.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      // const delta = clock.getDelta();
      const time = clock.getElapsedTime();

    

      rainMaterial.uniforms.clockTime.value = time;

      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position)

      composer.render()
    }
    animate()

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
      composer.setSize(container.clientWidth, container.clientHeight)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(animationFrameId)
      document.removeEventListener('mousemove', onMouseMove)
      resizeObserver.disconnect()
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      // You can add full scene disposal here if needed
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
}