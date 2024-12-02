import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasTexture } from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../../store/store";

import LogoFull from "/logo_full.svg";
import LogoEmblem from "/logo.svg";

const CanvasLogo = () => {
  const { size } = useThree();

  const logo = useStore((state) => state.logo);
  const fullscreen = useStore((state) => state.fullscreen);
  const { color } = useStore((state) => state.text);
  const setValue = useStore((state) => state.setValue);

  const [offscreen, glo, imageFull, imageEmblem] = useMemo(() => {
    const offscreen = new OffscreenCanvas(1000, 1000);
    const glo = offscreen.getContext("2d");
    const imageFull = new Image();
    const imageEmblem = new Image();
    return [offscreen, glo, imageFull, imageEmblem];
  }, []);

  const [tex, setTex] = useState(new CanvasTexture(offscreen));

  useEffect(() => {
    setValue("canvasSize", {
      width: size.width,
      height: size.height,
    });
  }, [size, setValue]);

  const [logoSrc, setLogoSrc] = useState(LogoFull);
  const [logoSrcEmblem, setLogoSrcEmblem] = useState(LogoEmblem);

  useEffect(() => {
    // Convert logo to base64 string for image src so can adjust color before drawing to canvas
    const getSVG = async () => {
      const logo = await fetch(LogoFull);
      const logoText = await logo.text();
      setLogoSrc(logoText);
      const svg64 = btoa(logoText);
      imageFull.src = "data:image/svg+xml;base64," + svg64;
      return logoText;
    };

    getSVG();
  }, [imageFull]);

  useEffect(() => {
    // Convert logo to base64 string for image src so can adjust color before drawing to canvas
    const getSVG = async () => {
      const logo = await fetch(LogoEmblem);
      const logoText = await logo.text();
      setLogoSrcEmblem(logoText);
      const svg64 = btoa(logoText);
      imageEmblem.src = "data:image/svg+xml;base64," + svg64;
      return logoText;
    };

    getSVG();
  }, [imageEmblem]);

  useEffect(() => {
    // Replace svg file fill color with text color
    if (logo.value === 0) return;
    const logoTextColor =
      logo.value === 2
        ? logoSrcEmblem.replace("#3A3A3A", color.hex)
        : logoSrc.replace("#3A3A3A", color.hex);
    const svg64 = btoa(logoTextColor);
    if (logo.value === 1) imageFull.src = "data:image/svg+xml;base64," + svg64;
    else if (logo.value === 2)
      imageEmblem.src = "data:image/svg+xml;base64," + svg64;
  }, [color, imageFull, imageEmblem, logoSrc, logoSrcEmblem, logo]);

  const drawLogo = useCallback(() => {
    // Setting canvas width will auto clear it
    const dpr = Math.min(window.devicePixelRatio, 2);
    offscreen.width = size.width * dpr;
    offscreen.height = size.height * dpr;

    const image = logo.value === 2 ? imageEmblem : imageFull;

    const pad = 1 / 34;
    const padX = pad;

    const grid = 4;
    const colw = (1 - padX * 2 - (grid - 1) * (padX * 0.5)) / grid;
    const spanx = 1;
    let wtotal = colw * spanx + (Math.max(0, spanx - 1) * padX) / 2;
    if (logo.value === 2) wtotal /= 4; // if emblem reduce to 1/6th column width
    const scl = (wtotal * size.width) / image.width;

    if (glo) {
      glo.drawImage(
        image,
        Math.floor(
          offscreen.width - image.width * scl * dpr - padX * offscreen.width
        ),
        Math.floor(padX * offscreen.width),
        Math.floor(image.width * scl * dpr),
        Math.floor(image.height * scl * dpr)
      );

      tex.dispose();
      setTex(new CanvasTexture(offscreen));
    }
  }, [offscreen, imageFull, imageEmblem, glo, size, logo]);

  useEffect(() => {
    imageFull.onload = () => {
      drawLogo();
    };
  }, [imageFull, drawLogo]);

  useEffect(() => {
    imageEmblem.onload = () => {
      drawLogo();
    };
  }, [imageEmblem, drawLogo]);

  useEffect(() => {
    drawLogo();
  }, [size, drawLogo]);

  return (
    <mesh visible={logo.value > 0 && !fullscreen}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial transparent={true} map={tex} toneMapped={false} />
    </mesh>
  );
};

export default CanvasLogo;
