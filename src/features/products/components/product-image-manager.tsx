"use client";

import { useRef, useState } from "react";
import { Check, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import type { ProductImage } from "../types";

type ProductImageManagerProps = {
  productId?: string;
  images: ProductImage[];
};

type UploadResponse =
  | { status: "uploaded"; message: string; image: Omit<ProductImage, "createdAt"> & { createdAt: string } }
  | { status: "rejected" | "blocked"; message: string };

export function ProductImageManager({ productId, images: initialImages }: ProductImageManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isCover, setIsCover] = useState(true);
  const [coveringImageId, setCoveringImageId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload() {
    if (!productId || !file || status === "uploading") return;
    setStatus("uploading");
    setMessage("Enviando imagem…");

    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("file", file);
    formData.set("altText", altText);
    formData.set("isCover", String(isCover));
    formData.set("sortOrder", String(images.length));

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const result = (await response.json()) as UploadResponse;
      if (!response.ok || result.status !== "uploaded") throw new Error(result.message);

      const uploaded = { ...result.image, createdAt: new Date(result.image.createdAt) };
      setImages((current) => [
        ...current.map((image) => isCover ? { ...image, isCover: false } : image),
        uploaded
      ]);
      setFile(null);
      setAltText("");
      setIsCover(true);
      if (inputRef.current) inputRef.current.value = "";
      setStatus("success");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    }
  }

  async function makeCover(imageId: string) {
    if (!productId || coveringImageId) return;
    setCoveringImageId(imageId);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/upload", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, imageId })
      });
      const result = (await response.json()) as {
        status: "updated" | "blocked";
        message: string;
      };
      if (!response.ok || result.status !== "updated") throw new Error(result.message);

      setImages((current) =>
        current.map((image) => ({ ...image, isCover: image.id === imageId }))
      );
      setStatus("success");
      setMessage(result.message);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível alterar a capa.");
    } finally {
      setCoveringImageId(null);
    }
  }

  return (
    <section className="form-panel product-images-panel">
      <div className="form-panel__header">
        <div className="product-images-panel__title">
          <ImagePlus aria-hidden="true" size={22} />
          <div>
            <h2>Imagens</h2>
            <p className="muted">JPEG, PNG ou WebP de até 5 MB.</p>
          </div>
        </div>
      </div>

      {productId ? (
        <div className="product-image-uploader">
          <label className="form-field product-image-file">
            <span>Arquivo</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setStatus("idle");
                setMessage("");
              }}
            />
          </label>
          <label className="form-field">
            <span>Texto alternativo</span>
            <input
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Ex.: Frasco verde do Essenza Gold"
            />
          </label>
          <label className="checkbox-field product-image-cover">
            <input type="checkbox" checked={isCover} onChange={(event) => setIsCover(event.target.checked)} />
            <span>Usar como capa</span>
          </label>
          <button className="secondary-action product-image-upload-button" type="button" onClick={upload} disabled={!file || status === "uploading"}>
            {status === "uploading" ? <LoaderCircle aria-hidden="true" className="postal-code-status__spinner" size={17} /> : <Upload aria-hidden="true" size={17} />}
            {status === "uploading" ? "Enviando…" : "Enviar imagem"}
          </button>
        </div>
      ) : (
        <p className="form-message">Salve o produto antes de adicionar imagens.</p>
      )}

      {message ? (
        <p className={`upload-feedback upload-feedback--${status}`} role="status">
          {status === "success" ? <Check aria-hidden="true" size={17} /> : null}
          {message}
        </p>
      ) : null}

      <div className="image-manager-list" aria-label="Imagens do produto">
        {images.length === 0 ? <p className="muted">Nenhuma imagem vinculada ao produto.</p> : null}
        {images.map((image) => (
          <article key={image.id} className="image-manager-item">
            <div
              className="image-manager-item__preview"
              role="img"
              aria-label={image.altText || "Imagem do produto"}
              style={{ backgroundImage: `url("${image.blobUrl.replaceAll('"', "%22")}")` }}
            />
            <div className="image-manager-item__content">
              <div>
                <span className={image.isCover ? "image-role image-role--cover" : "image-role"}>{image.isCover ? "Capa" : "Galeria"}</span>
                <strong>{image.altText || "Sem texto alternativo"}</strong>
              </div>
              <small>{image.contentType ?? "tipo não informado"} · {formatFileSize(image.sizeBytes)}</small>
              {!image.isCover ? (
                <button
                  className="image-manager-item__cover-action"
                  type="button"
                  disabled={coveringImageId !== null}
                  onClick={() => makeCover(image.id)}
                >
                  {coveringImageId === image.id ? "Alterando…" : "Definir como capa"}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatFileSize(value?: number | null) {
  if (!value) return "tamanho não informado";
  return value >= 1024 * 1024
    ? `${(value / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.ceil(value / 1024)} KB`;
}
