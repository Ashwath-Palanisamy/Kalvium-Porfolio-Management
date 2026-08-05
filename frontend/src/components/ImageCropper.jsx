import Cropper from "react-easy-crop";
import { useState } from "react";

export default function ImageCropper({
  image,
  crop,
  zoom,
  setCrop,
  setZoom,
  onCropComplete,
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: 400,
        background: "#000",
      }}
    >
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape="round"
        showGrid={false}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />
    </div>
  );
}