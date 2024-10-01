import { MutableRefObject } from "react";
import useExport from "../../helpers/useExport";
import { ExportObject } from "../Scene";

const Renderer = ({
  ffmpeg,
}: {
  ffmpeg: MutableRefObject<ExportObject | null>;
}) => {
  ffmpeg.current = useExport();
  // console.log(ffmpeg.current.ffmpegLoaded);

  return null;
};

export default Renderer;

// import { useEffect, useMemo, useRef } from 'react'
// import { useFrame, useThree } from '@react-three/fiber'
// import { useFBO } from '@react-three/drei'
// import { Color, Vector3 } from 'three'
// import { useShallow } from 'zustand/react/shallow'
// import { levaStore, useControls, button, folder } from 'leva'

// import { config } from '../store/config'
// import { useStore } from '../store/store'
// import { getBounds, map, lerp } from '../helpers/utils'
// import { easeInOutQuad } from '../helpers/utils'
// import useFFmpeg from './useFFmpeg'

// const Renderer = ({ canvasContainer, controlsReady, render, debug }) => {
//   const [
//     scene,
//     debugBoxRef,
//     debugCameraRef,
//     debugSceneRef,
//     sphereGroupRef,
//     expressionRef,
//     typographyRef,
//     raymarcherRef,
//     raymarcherSceneRef,
//     textMaterialRef,
//     textSceneRef,
//     textCameraRef,
//     defaultConfig,
//   ] = useStore(
//     useShallow((state) => [
//       state.scene,
//       state.debugBoxRef,
//       state.debugCameraRef,
//       state.debugSceneRef,
//       state.sphereGroupRef,
//       state.expressionRef,
//       state.typographyRef,
//       state.raymarcherRef,
//       state.raymarcherSceneRef,
//       state.textMaterialRef,
//       state.textSceneRef,
//       state.textCameraRef,
//       state.defaultConfig,
//     ])
//   )
//   const { spheres } = scene

//   const fps = config.export.fps

//   const previewButton = useRef(null)

//   const debugFBO = useFBO(512, 512)
//   const sceneFBO = useFBO(512 / 2, 512 / 2)
//   const raymarchFBO = useFBO()
//   const textFBO = useFBO()

//   const { gl, camera } = useThree()

//   useEffect(() => {
//     if (typographyRef) {
//       typographyRef.material.uniforms.uTexture.value = textFBO.texture
//     }
//     if (raymarcherRef) {
//       raymarcherRef.material.uniforms.uSceneTexture.value = sceneFBO.texture
//     }
//     if (expressionRef) {
//       expressionRef.material.uniforms.uDebugTexture.value = debugFBO.texture
//       expressionRef.material.uniforms.uRaymarchTexture.value =
//         raymarchFBO.texture
//     }
//   }, [
//     typographyRef,
//     textFBO,
//     raymarcherRef,
//     sceneFBO,
//     debugFBO,
//     expressionRef,
//     raymarchFBO,
//   ])

//   const bounds = useMemo(() => {
//     return {
//       min: new Vector3(),
//       max: new Vector3(),
//       mid: new Vector3(),
//       w: 0,
//       h: 0,
//       d: 0,
//     }
//   }, [])

//   const setBounds = () => {
//     const points = []
//     for (let i = 0; i < sphereGroupRef.children.length; i++) {
//       const sphere = sphereGroupRef.children[i]
//       const r = sphere.scale.x * 1 // * 1 - radius of sphere
//       const pos = sphere.position
//       points.push({ pos, r })
//     }

//     getBounds(bounds, points)

//     raymarcherRef.material.uniforms.uBBMin.value.set(
//       bounds.min.x,
//       bounds.min.y,
//       bounds.min.z
//     )
//     raymarcherRef.material.uniforms.uBBMax.value.set(
//       bounds.max.x,
//       bounds.max.y,
//       bounds.max.z
//     )
//   }

//   const getTime = (t, fadeInStart, fadeInDuration) => {
//     let fadeF = 0

//     const fadeInEnd = fadeInStart + fadeInDuration

//     if (t < fadeInStart) {
//       fadeF = 0
//     } else if (t < fadeInEnd) {
//       let tFade = map(t, fadeInStart, fadeInEnd, 0, 1)
//       tFade = easeInOutQuad(tFade)
//       // tFade *= Math.PI / 2
//       // fadeF = Math.sin(tFade)
//       fadeF = tFade
//     } else {
//       fadeF = 1
//     }

//     return fadeF
//   }

//   const transformSpheres = (time, s, i, debug = false) => {
//     s.material.color = new Color(debug ? 0xff0000 : 0xffffff)
//     s.material.wireframe = debug
//     s.material.needsUpdate = true

//     const data = spheres[i]
//     const sf = debug ? 0 : 0.4
//     let scl = 1

//     const animation = levaStore.get('Animation.backgroundAnimation')

//     if (render.current.mode === 'animation') {
//       const { duration, offset, mode } = config.scene.animation
//       const o = offset !== undefined ? offset : 0.1
//       let m = mode !== undefined ? mode : 'enter-exit'
//       if (
//         !['enter-exit', 'enter', 'none'].find(
//           (mode) => mode === m.toLowerCase().trim()
//         )
//       ) {
//         m = 'enter-exit'
//       }
//       let f = 1
//       if (m === 'enter') f = 0
//       const off = i * o
//       let t1 = getTime(time, off, duration / lerp(1, 2, f))
//       let t2 = getTime(time, off + duration / 2, duration / 2)
//       let x = 0
//       let y = 0
//       let z = 0

//       // Animation transform
//       if (m !== 'none') {
//         let d = 3 // 5
//         if (animation === 'Informative') {
//           t2 *= f
//           x = lerp(lerp(d, 0, t1), -d, t2)
//           y = lerp(lerp(-d, 0, t1), d, t2)
//           scl *= lerp(lerp(0.25, 1, t1), 0.25, t2)
//         } else if (animation === 'Uplifting') {
//           t2 *= f
//           y = lerp(lerp(-d, 0, t1), d, t2)
//           scl *= lerp(lerp(0.25, 1, t1), 0.9, t2)
//         } else if (animation === 'Emotive') {
//           const t1 = getTime(time, off, duration)
//           const s = Math.sin(t1 * Math.PI * 2)
//           // const c = Math.cos(t1 * Math.PI * 2)
//           const s2 = Math.sin(t1 * Math.PI * 1)
//           if (i === 0) {
//             x = s * -0.4
//             y = s * 0.2
//             scl *= -s2 * 0.5 + 1
//           } else if (i === 1) {
//             x = s * 0.75
//             y = s * -0.4
//             scl *= -s2 * 0.3 + 1
//           } else if (i === 2) {
//             x = s * 0.66
//             y = s * 0.75
//             scl *= -s2 * 0.45 + 1
//           } else if (i === 3) {
//             x = s * 0.4
//             y = s * 0.3
//             scl *= -s2 * 0.25 + 1
//           } else if (i === 4) {
//             x = s * 0.75
//             y = s * -0.4
//             scl *= -s2 * 0.4 + 1
//           } else if (i === 5) {
//             x = s * 0.3
//             y = s * -0.9
//             scl *= -s2 * 0.35 + 1
//           } else if (i === 6) {
//             x = s * 0.5
//             y = s * 0.8
//             scl *= -s2 * 0.5 + 1
//           }
//         }
//       }
//       s.position.x = data.x + x
//       s.position.y = data.y + y
//       s.position.z = data.z + z
//       s.scale.set(data.w * scl + sf, data.w * scl + sf, data.w * scl + sf)
//       if (debug && raymarcherRef) {
//         // values used in raymarch shader
//         raymarcherRef.material.uniforms[`uData${i}`].value.x = data.x + x
//         raymarcherRef.material.uniforms[`uData${i}`].value.y = data.y + y
//         raymarcherRef.material.uniforms[`uData${i}`].value.z = data.z + z
//         raymarcherRef.material.uniforms[`uData${i}`].value.w = data.w * scl
//       }
//     } else {
//       s.position.x = data.x
//       s.position.y = data.y
//       s.position.z = data.z
//       s.scale.set(data.w * scl + sf, data.w * scl + sf, data.w * scl + sf)
//       if (debug && raymarcherRef) {
//         // values used in raymarch shader
//         raymarcherRef.material.uniforms[`uData${i}`].value.x = data.x
//         raymarcherRef.material.uniforms[`uData${i}`].value.y = data.y
//         raymarcherRef.material.uniforms[`uData${i}`].value.z = data.z
//         raymarcherRef.material.uniforms[`uData${i}`].value.w = data.w
//       }
//     }
//   }

//   const renderExpression = (gl, time, camera) => {
//     if (
//       debugBoxRef &&
//       debugCameraRef &&
//       sphereGroupRef &&
//       raymarcherRef &&
//       expressionRef
//     ) {
//       // Sphere scene (to raymarch shader)
//       debugBoxRef.visible = false

//       sphereGroupRef.children.forEach((s, i) => {
//         transformSpheres(time, s, i, false)
//       })

//       gl.setRenderTarget(sceneFBO)
//       gl.clear()
//       gl.render(debugSceneRef, debugCameraRef)

//       // Debug scene (to expression shader)
//       sphereGroupRef.children.forEach((s, i) => {
//         transformSpheres(time, s, i, true)
//       })

//       setBounds()

//       // Only need to render debug pass if in debug mode
//       if (debug) {
//         debugBoxRef.visible = true
//         debugBoxRef.position.set(bounds.mid.x, bounds.mid.y, bounds.mid.z)
//         debugBoxRef.scale.set(bounds.w, bounds.h, bounds.d)

//         gl.setRenderTarget(debugFBO)
//         gl.clear()
//         gl.render(debugSceneRef, debugCameraRef)
//       }

//       // Raymarch scene (to expression shader)
//       // debugCameraRef.getWorldDirection(
//       //   raymarcherRef.material.uniforms.uCamDir.value
//       // )
//       // debugCameraRef.getWorldPosition(
//       //   raymarcherRef.material.uniforms.uCamPos.value
//       // )

//       gl.setRenderTarget(raymarchFBO)
//       gl.clear()
//       gl.render(raymarcherSceneRef, camera)
//     }
//   }

//   const renderText = (gl, time) => {
//     if (textSceneRef && textCameraRef && textMaterialRef) {
//       textMaterialRef.uniforms.uTime.value = time
//       gl.setRenderTarget(textFBO)
//       gl.clear()
//       gl.render(textSceneRef, textCameraRef)
//     }
//   }

//   const status = document.getElementById('Animation.textAnimation')
//   if (status) {
//     previewButton.current =
//       status.parentElement.parentElement.parentElement.nextSibling.firstChild
//     // previewButton.current.addEventListener('mouseover', ({ target }) => {
//     //   target.innerHTML = render.current.preview ? 'Cancel Preview' : 'Preview'
//     // })
//     // previewButton.current.addEventListener('mouseleave', ({ target }) => {
//     //   target.innerHTML = render.current.preview ? 'Previewing...' : 'Preview'
//     // })
//     previewButton.current.addEventListener('click', ({ target }) => {
//       if (render.current.preview) {
//         target.style.removeProperty('background')
//         target.innerHTML = 'Preview'
//       } else target.innerHTML = 'Previewing...'
//     })
//   }

//   // Preview button progress
//   const previewBtnProgress = () => {
//     if (previewButton.current) {
//       const t =
//         render.current.deltaTime / (render.current.frames.animation / fps)
//       const colorBg = '#0066dc'
//       const colorProgress = '#3c93ff'
//       previewButton.current.style.background = `linear-gradient(to right, ${colorProgress} ${
//         t * 100
//       }%, ${colorBg} ${t * 100}%)`
//     }
//   }

//   const previewBtnReset = () => {
//     if (previewButton.current) {
//       previewButton.current.innerHTML = 'Preview'
//       previewButton.current.style.removeProperty('background')
//     }
//   }

//   const renderExport = () => {
//     const time = render.current.frameCount / fps
//     renderExpression(gl, time, camera)
//     renderText(gl, time)
//     gl.setRenderTarget(null)
//     console.log('RENDER FRAME:', render.current.frameCount)
//   }

//   const ff = useFFmpeg(
//     canvasContainer,
//     render,
//     controlsReady,
//     textMaterialRef,
//     raymarcherRef,
//     renderExport
//   )

//   const exportSchema = {
//     Export: folder({
//       resolution: {
//         label: 'Resolution',
//         options: ['HD', '4K'],
//         value: defaultConfig.resolution,
//         render: (get) => get('General.aspectRatio') !== 'Custom',
//         // onChange: () => updateConfig(defaultConfig),
//         disabled: !ff.loaded || render.current.exporting,
//       },
//       format: {
//         label: 'Format',
//         options: { Image: 'image', MP4: 'video', GIF: 'gif' },
//         value: defaultConfig.format,
//         // onChange: () => updateConfig(defaultConfig),
//         disabled: !ff.loaded || render.current.exporting,
//       },
//       Download: button(
//         async () => {
//           if (ff.loaded) {
//             if (!render.current.exporting) {
//               render.current.preview = false
//               render.current.deltaTime = 0
//               render.current.exporting = true

//               try {
//                 await ff.download(levaStore.get('Export.format'))
//               } catch (error) {
//                 console.log(error)
//                 await ff.cancel()
//               }
//             }
//           }
//         },
//         {
//           disabled: !ff.loaded,
//         }
//       ),
//       'Cancel Download': button(
//         async () => {
//           if (ff.loaded) {
//             try {
//               await ff.cancel()
//             } catch (error) {
//               console.log(error)
//             }
//           }
//         },
//         { disabled: !ff.loaded }
//       ),
//       downloadStatus: {
//         value: '',
//         disabled: !ff.loaded,
//       },
//     }),
//   }

//   useControls(
//     exportSchema,
//     // pass spheres are dependency so transcode function refereces latest expression data after randomising
//     [ff.loaded, render.current.exporting, spheres]
//   )

//   useEffect(() => {
//     if (ff.loaded) {
//       const downloadStatusInput = document.getElementById(
//         'Export.downloadStatus'
//       )
//       downloadStatusInput.parentElement.previousSibling.style.visibility =
//         'hidden'
//       downloadStatusInput.parentElement.style.backgroundColor = 'transparent'
//       downloadStatusInput.parentElement.style.pointerEvents = 'none'
//       downloadStatusInput.style.padding = 0
//       downloadStatusInput.style.marginTop = '-10px'
//       downloadStatusInput.style.pointerEvents = 'none'

//       const cancelDownloadButton =
//         downloadStatusInput.parentElement.parentElement.parentElement
//           .previousSibling.firstChild
//       cancelDownloadButton.classList.add('cancel')
//     }
//   }, [ff.loaded])

//   useFrame(({ gl, camera }, delta) => {
//     const { mode } = render.current

//     if (render.current.exporting) {
//       if (render.current.exportPrep) {
//         previewBtnReset()
//         if (textMaterialRef)
//           textMaterialRef.uniforms.uAnimating.value = mode === 'static' ? 0 : 1
//         if (raymarcherRef)
//           raymarcherRef.material.uniforms.uAnimating.value =
//             mode === 'static' ? 0 : 1
//         const time = 0
//         renderExpression(gl, time, camera)
//         renderText(gl, time)
//       }
//     } else if (render.current.preview) {
//       const time = render.current.deltaTime

//       renderExpression(gl, time, camera)
//       renderText(gl, time)

//       previewBtnProgress()

//       // console.log('RENDER PREVIEW FRAME:', render.current.frameCount)
//       render.current.deltaTime += delta
//       render.current.frameCount++
//     } else if (render.current.reset) {
//       const time = 0
//       renderExpression(gl, time, camera)
//       renderText(gl, time)

//       // console.log('RENDER RESET FRAME:', render.current.frameCount)
//       render.current.frameCount++
//     }

//     // Check if reached end of animation
//     const test = render.current.preview
//       ? render.current.deltaTime >= render.current.frames[mode] / fps
//       : render.current.frameCount >= render.current.frames[mode]

//     if (test) {
//       if (render.current.preview) {
//         previewBtnReset()
//       }

//       render.current.exporting = false
//       render.current.preview = false
//       render.current.reset = false

//       if (mode === 'animation') {
//         render.current.reset = true
//         render.current.mode = 'static'
//         // console.log(
//         //   'setting mode to static',
//         //   render.current.frameCount,
//         //   render.current.deltaTime
//         // )
//       }

//       render.current.frameCount = 0
//       render.current.deltaTime = 0

//       if (raymarcherRef) raymarcherRef.material.uniforms.uAnimating.value = 0
//       if (textMaterialRef) textMaterialRef.uniforms.uAnimating.value = 0
//     }

//     if (!render.current.exporting || render.current.exportPrep) {
//       gl.setRenderTarget(null)
//     }
//   })

//   return null
// }

// export default Renderer
