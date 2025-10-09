'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { Box } from '@chakra-ui/react'

export function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    let scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      renderer: THREE.WebGLRenderer,
      composer: EffectComposer,
      matrixPoints: THREE.Points,
      graphGroup: THREE.Group

    const mouse = new THREE.Vector2()
    const clock = new THREE.Clock()

    const matrixVertexShader = `
      uniform float clockTime;
      attribute float size;
      attribute vec3 customColor;
      attribute float speed;
      varying vec3 vColor;
      void main() {
        vColor = customColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float newY = position.y - (speed * clockTime * 0.1);
        mvPosition.y = mod(newY, 40.0) - 20.0;
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
        if (gl_FragColor.a < 0.5) discard;
      }
    `

    function init() {
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 10

      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true,
        alpha: false,
      })
      renderer.setClearColor(0x000000, 1)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)

      const renderPass = new RenderPass(scene, camera)
      const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
      bloomPass.threshold = 0
      bloomPass.strength = 1.8
      bloomPass.radius = 0.6
      composer = new EffectComposer(renderer)
      composer.addPass(renderPass)
      composer.addPass(bloomPass)

      graphGroup = new THREE.Group()
      const nodeCount = 150
      const nodeGeometry = new THREE.BufferGeometry()
      const nodePositions = new Float32Array(nodeCount * 3)
      const nodePoints: THREE.Vector3[] = []

      for (let i = 0; i < nodeCount; i++) {
        const x = (Math.random() - 0.5) * 12
        const y = (Math.random() - 0.5) * 12
        const z = (Math.random() - 0.5) * 12
        nodePositions[i * 3] = x
        nodePositions[i * 3 + 1] = y
        nodePositions[i * 3 + 2] = z
        nodePoints.push(new THREE.Vector3(x, y, z))
      }

      nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3))
      const nodeMaterial = new THREE.PointsMaterial({
        color: 0xda70d6,
        size: 0.2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true,
      })
      const nodes = new THREE.Points(nodeGeometry, nodeMaterial)
      graphGroup.add(nodes)

      const linePositions: number[] = []
      const connectionDistance = 2.5
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (nodePoints[i].distanceTo(nodePoints[j]) < connectionDistance) {
            linePositions.push(
              nodePoints[i].x,
              nodePoints[i].y,
              nodePoints[i].z,
              nodePoints[j].x,
              nodePoints[j].y,
              nodePoints[j].z
            )
          }
        }
      }
      const lineGeometry = new THREE.BufferGeometry()
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3))
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xda70d6,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
      })
      graphGroup.add(new THREE.LineSegments(lineGeometry, lineMaterial))
      scene.add(graphGroup)

      const rainCount = 2000
      const rainGeometry = new THREE.BufferGeometry()
      const rainPositions = new Float32Array(rainCount * 3)
      const rainColors = new Float32Array(rainCount * 3)
      const rainSizes = new Float32Array(rainCount)
      const rainSpeeds = new Float32Array(rainCount)
      const baseColor = new THREE.Color(0xffffff)

      for (let i = 0; i < rainCount; i++) {
        rainPositions[i * 3] = (Math.random() - 0.5) * 40
        rainPositions[i * 3 + 1] = (Math.random() - 0.5) * 40
        rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 40

        const color = new THREE.Color(Math.random() > 0.9 ? 0xffffff : baseColor.getHex())
        rainColors[i * 3] = color.r
        rainColors[i * 3 + 1] = color.g
        rainColors[i * 3 + 2] = color.b

        rainSizes[i] = Math.random() * 0.1 + 0.05
        rainSpeeds[i] = Math.random() * 2 + 1
      }

      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3))
      rainGeometry.setAttribute('customColor', new THREE.BufferAttribute(rainColors, 3))
      rainGeometry.setAttribute('size', new THREE.BufferAttribute(rainSizes, 1))
      rainGeometry.setAttribute('speed', new THREE.BufferAttribute(rainSpeeds, 1))

      matrixPoints = new THREE.Points(
        rainGeometry,
        new THREE.ShaderMaterial({
          uniforms: {
            color: { value: new THREE.Color(0xe03fd8) },
            pointTexture: {
              value: new THREE.TextureLoader().load(
                'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/disc.png'
              ),
            },
            clockTime: { value: 0 },
          },
          vertexShader: matrixVertexShader,
          fragmentShader: matrixFragmentShader,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          transparent: true,
        })
      )
      scene.add(matrixPoints)

      window.addEventListener('resize', onWindowResize)
      document.addEventListener('mousemove', onMouseMove)

      setIsReady(true)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      composer.setSize(window.innerWidth, window.innerHeight)
    }

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    function animate() {
      requestAnimationFrame(animate)
      const delta = clock.getDelta()
      const time = clock.getElapsedTime()

      graphGroup.rotation.y += delta * 0.1
      graphGroup.rotation.x += delta * 0.05

      ;(matrixPoints.material as THREE.ShaderMaterial).uniforms.clockTime.value = time

      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02
      camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.02
      camera.lookAt(scene.position)

      composer.render()
    }

    init()
    animate()

    return () => {
      window.removeEventListener('resize', onWindowResize)
      document.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose()
          ;(obj.material as THREE.Material).dispose()
        }
      })
    }
  }, [])

  return (
    <Box w="100%" h="100vh" position="relative" overflow="hidden" bg="black">
      <Box
        as="canvas"
        ref={canvasRef}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        visibility={isReady ? 'visible' : 'hidden'}
        opacity={isReady ? 1 : 0}
        transition="opacity 1s ease-in"
      />
    </Box>
  )
}