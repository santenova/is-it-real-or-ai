import React, { useState, useRef } from "react";
import { createAnalysis } from "../lib/localStore";
import { createLogger, saveSession, logErrorLocally, logTokenUsageLocally } from "../lib/analysisLogger";
import exifr from "exifr";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Sparkles, ScanEye, Link as LinkIcon, Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "../api/client";
import MultiImageDropzone from "../components/analysis/MultiImageDropzone";
import QueueProgress from "../components/analysis/QueueProgress";
import AnalysisResult from "../components/analysis/AnalysisResult";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

async function fileToBase64DataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Reverse search prompt (inlined from backend)
const REVERSE_SEARCH_PROMPT = (url) => `You are an image provenance researcher. Investigate the internet paper trail for this image URL: ${url}

Search the web for:
1. Whether this exact image or visually similar images appear on known stock photo sites (Shutterstock, Getty, Adobe Stock, Unsplash, Pexels, etc.)
2. Whether this image appears on AI art generation platforms (Midjourney showcases, ArtStation AI sections, DeviantArt AI, Civitai, etc.)
3. Whether this image appears in news outlets, official websites, or verified social media accounts
4. Any metadata or context clues about the image origin available on the web
5. Whether the image URL domain itself is associated with AI-generated content or stock photography

Return a JSON object with: has_web_presence (boolean), found_on_stock_sites (boolean), found_on_ai_platforms (boolean), found_on_news_or_official (boolean), source_credibility ("high"|"medium"|"low"|"unknown"), estimated_origin ("real_photo"|"ai_generated"|"stock_photo"|"illustration"|"unknown"), paper_trail_summary (string), sources_found (array of strings), confidence (number 0-100).`;

const REVERSE_SEARCH_SCHEMA = {
  type: "object",
  properties: {
    has_web_presence: { type: "boolean" },
    found_on_stock_sites: { type: "boolean" },
    found_on_ai_platforms: { type: "boolean" },
    found_on_news_or_official: { type: "boolean" },
    source_credibility: { type: "string" },
    estimated_origin: { type: "string" },
    paper_trail_summary: { type: "string" },
    sources_found: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
};

// Watermark prompt (inlined from backend)
const WATERMARK_PROMPT = `You are a specialized AI watermark and signature artifact detector. Analyze this image carefully for the following specific signals:

INVISIBLE/STEGANOGRAPHIC WATERMARKS:
- C2PA (Coalition for Content Provenance and Authenticity) metadata markers
- Google SynthID invisible watermarks embedded in pixel noise
- Stable Diffusion invisible watermarks (in latent space frequency patterns)
- DALL-E / OpenAI invisible watermarks
- Midjourney invisible frequency-domain signatures

VISIBLE AI GENERATOR SIGNATURES:
- Midjourney-style "--ar" ratio marks or generational artifacts in corners
- DALL-E style over-smoothed corner vignetting
- Stable Diffusion characteristic blurring at image boundaries
- Adobe Firefly subtle edge artifacts
- Any visible "AI Generated" text watermarks (sometimes hidden in low-contrast areas)
- Typical GAN/diffusion spectral frequency anomalies (checkerboard patterns, grid artifacts)

STATISTICAL ARTIFACT SIGNATURES:
- Unnatural pixel regularity in flat color regions (too-perfect gradients)
- Frequency-domain peaks that don't match camera sensor noise profiles
- Color channel correlation anomalies typical of VAE decoders
- Overly symmetric noise distribution

Return a JSON object with:
- watermark_integrity_score: number 0-100. HIGH (80-100) = no watermarks or AI signatures detected. LOW (0-20) = strong AI watermark detected.
- detected_signatures: array of strings describing each detected signal
- steganographic_risk: "high" | "medium" | "low"
- visible_watermarks_found: boolean
- frequency_anomalies: boolean
- summary: 1-2 sentence summary of findings`;

const WATERMARK_SCHEMA = {
  type: "object",
  properties: {
    watermark_integrity_score: { type: "number" },
    detected_signatures: { type: "array", items: { type: "string" } },
    steganographic_risk: { type: "string" },
    visible_watermarks_found: { type: "boolean" },
    frequency_anomalies: { type: "boolean" },
    summary: { type: "string" },
  },
};

// Pass 0: Image type classification
const IMAGE_TYPE_PROMPT = `You are an expert image classifier. Look at this image and determine what type of image it is.

Choose the single best matching category and sub-type from this taxonomy:

1. Photography — Smartphone capture, DSLR capture, Mirrorless capture, Film Photography, Scan from Physical Photo
2. Logo Design — Brand Identity Design, Wordmark Logo, Letterform Logo, Icon/Symbol
3. AI-Generated Art — Machine Learning Generated, Deep Learning Generated, Algorithmically Generated, AI-Assisted Design
4. Wallpaper — Desktop Wallpaper, Mobile Wallpaper, Wall Decoration/Mural, Textured/Patterned Surface
5. Illustration — Hand-Drawn/Hand-Painted, Digital Illustration, Commissioned Custom Art
6. Painting — Oil Painting, Watercolor Painting, Mixed Media Painting, Digital Painting
7. Graphic Design — Commercial Graphic Design, Non-Profit Design, Event/Conference Design, Branding Materials
8. Cartoon — Hand-Drawn Cartoon, Digital Cartoon, Caricature/Satirical Illustration
9. Animation Frame — 2D Animation, 3D CGI Animation, Stop-Motion, Motion Graphics
10. Artistic Rendering — Architectural Rendering, Scientific Illustration, Fantasy/Concept Art, Abstract/Non-Representational
11. Real-World Reference — Still-Life Photography, Landscape/Nature Photography, Architectural Photography, Documentary Photography
12. Historical Image — Archival Photograph, Historical Illustration/Engraving, Retouched/Restored Image, Reproduction of Original Work

Return a JSON object with:
- category: the main category name (e.g. "Photography", "Logo Design", "Painting")
- sub_type: the specific sub-type (e.g. "DSLR capture", "Watercolor Painting")
- is_computer_generated: boolean — true if this image was fully or primarily created by a computer (not a real-world photograph or scan). Logos, graphic design, AI art, digital illustrations, CGI, etc. are true. Real photography and physical paintings are false.
- is_real_photo: boolean — true only if this appears to be an actual photograph taken by a camera (film or digital) of a real-world scene.
- confidence: number 0-100 — how confident you are in this classification
- classification_notes: one sentence explaining the key visual evidence for this classification`;

const IMAGE_TYPE_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string" },
    sub_type: { type: "string" },
    is_computer_generated: { type: "boolean" },
    is_real_photo: { type: "boolean" },
    confidence: { type: "number" },
    classification_notes: { type: "string" },
  },
};

// Pass 1: Lightweight scene understanding — object detection + description only
const SCENE_PROMPT = `You are a computer vision assistant. Analyze this image and return a JSON object with:
- image_description: A 2-3 sentence factual description of the scene, lighting, and composition.
- detected_objects: An array of all notable objects/subjects detected, each with:
  - item: object name
  - item_description: brief description including position, size, condition
  - has_faces: boolean, true if this object is a person/face
Be thorough and precise — this output will be used as context for a deeper forensic analysis.`;

const SCENE_SCHEMA = {
  type: "object",
  properties: {
    image_description: { type: "string" },
    detected_objects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item: { type: "string" },
          item_description: { type: "string" },
          has_faces: { type: "boolean" },
        },
      },
    },
  },
};

// Pass 1c: Text-only image type classification from scene description
const IMAGE_TYPE_FROM_DESCRIPTION_PROMPT = (description, detectedObjects) => {
  const objectList = (detectedObjects || []).map(o => `- ${o.item}: ${o.item_description}`).join("\n") || "none";
  return `You are an expert image classifier. Based ONLY on the following text description and detected objects from a scene analysis (do NOT see the actual image), determine what type of image this is.

SCENE DESCRIPTION:
"${description}"

DETECTED OBJECTS:
${objectList}

Use these textual clues to classify the image type. Consider:
- Does the description mention digital artifacts, perfect lighting, surreal combinations → likely AI-Generated Art or Graphic Design
- Does it describe a natural scene with realistic context, real-world lighting → likely Photography
- Does it mention drawn lines, painted strokes, artistic style → likely Illustration or Painting
- Does it mention logos, brand elements, typography, icons → likely Logo Design or Graphic Design
- Does it describe animated characters, cartoon style → likely Cartoon or Animation Frame
- Does it describe architectural visualizations, concept art, fantasy → likely Artistic Rendering

Choose the single best matching category and sub-type from this taxonomy:
1. Photography — Smartphone capture, DSLR capture, Mirrorless capture, Film Photography, Scan from Physical Photo
2. Logo Design — Brand Identity Design, Wordmark Logo, Letterform Logo, Icon/Symbol
3. AI-Generated Art — Machine Learning Generated, Deep Learning Generated, Algorithmically Generated, AI-Assisted Design
4. Wallpaper — Desktop Wallpaper, Mobile Wallpaper, Wall Decoration/Mural, Textured/Patterned Surface
5. Illustration — Hand-Drawn/Hand-Painted, Digital Illustration, Commissioned Custom Art
6. Painting — Oil Painting, Watercolor Painting, Mixed Media Painting, Digital Painting
7. Graphic Design — Commercial Graphic Design, Non-Profit Design, Event/Conference Design, Branding Materials
8. Cartoon — Hand-Drawn Cartoon, Digital Cartoon, Caricature/Satirical Illustration
9. Animation Frame — 2D Animation, 3D CGI Animation, Stop-Motion, Motion Graphics
10. Artistic Rendering — Architectural Rendering, Scientific Illustration, Fantasy/Concept Art, Abstract/Non-Representational
11. Real-World Reference — Still-Life Photography, Landscape/Nature Photography, Architectural Photography, Documentary Photography
12. Historical Image — Archival Photograph, Historical Illustration/Engraving, Retouched/Restored Image, Reproduction of Original Work

Return a JSON object with:
- category: the main category name
- sub_type: the specific sub-type
- is_computer_generated: boolean — true if computer-generated or digitally designed (not a real-world photo or physical painting)
- is_real_photo: boolean — true only if this appears to be an actual photograph taken by a camera
- confidence: number 0-100 — how confident you are based solely on the textual description
- classification_notes: one sentence explaining the key textual signal that led to this classification`;
};

const IMAGE_TYPE_FROM_DESCRIPTION_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string" },
    sub_type: { type: "string" },
    is_computer_generated: { type: "boolean" },
    is_real_photo: { type: "boolean" },
    confidence: { type: "number" },
    classification_notes: { type: "string" },
  },
};

// Pass 1b: Text-only description verdict — runs after Pass 1 using only the description text
const DESCRIPTION_VERDICT_PROMPT = (description) => `You are an expert image forensics analyst. 
Based ONLY on the following text description of an image (do NOT imagine or see the actual image), 
evaluate whether the described scene is consistent with a real photograph or an AI-generated image.

IMAGE DESCRIPTION:
"${description}"

Score the plausibility as a real photograph based solely on this textual description. Consider:
- Does the scene depict a physically plausible real-world situation?
- Are the objects, lighting, and composition described in a way consistent with real photography?
- Are there hallmarks of AI generation: surreal combinations, impossibly perfect scenes, non-existent settings, fantasy elements, or statistically improbable compositions?
- Does the description sound like what a camera would capture, or like what an AI would generate?

Return a JSON object with:
- score: number 0-100 (100 = definitely real photograph, 0 = definitely AI-generated)
- verdict: "real" | "ai_generated" | "uncertain"  
- reasoning: one sentence explaining the key signal from the description that determined your verdict`;

const DESCRIPTION_VERDICT_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "number" },
    verdict: { type: "string", enum: ["real", "ai_generated", "uncertain"] },
    reasoning: { type: "string" },
  },
};

// Pass 2: Deep forensic analysis with scene context + paper trail injected
function buildForensicPrompt(sceneResult, paperTrail = null, watermarkResult = null, imageType = null) {
  const objectList = (sceneResult.detected_objects || [])
    .map((o) => `  - ${o.item}: ${o.item_description}${o.has_faces ? " [CONTAINS FACE]" : ""}`)
    .join("\n");

  const paperTrailBlock = paperTrail
    ? `
IMAGE PAPER TRAIL (internet provenance research):
- Has web presence: ${paperTrail.has_web_presence ?? "unknown"}
- Found on stock photo sites: ${paperTrail.found_on_stock_sites ?? "unknown"}
- Found on AI art platforms: ${paperTrail.found_on_ai_platforms ?? "unknown"}
- Found on news/official sites: ${paperTrail.found_on_news_or_official ?? "unknown"}
- Source credibility: ${paperTrail.source_credibility ?? "unknown"}
- Estimated origin from web: ${paperTrail.estimated_origin ?? "unknown"}
- Sources found: ${(paperTrail.sources_found || []).join(", ") || "none"}
- Paper trail summary: ${paperTrail.paper_trail_summary ?? "No data"}
Use this provenance data to inform your internet_presence score and overall verdict.`
    : `
IMAGE PAPER TRAIL: No internet provenance data available. Score internet_presence as 50.`;

  const watermarkBlock = watermarkResult
    ? `
WATERMARK SCAN RESULTS (dedicated AI watermark detector):
- Watermark integrity score: ${watermarkResult.watermark_integrity_score ?? 50}/100
- Visible watermarks found: ${watermarkResult.visible_watermarks_found ?? false}
- Frequency anomalies detected: ${watermarkResult.frequency_anomalies ?? false}
- Steganographic risk: ${watermarkResult.steganographic_risk ?? "unknown"}
- Detected signatures: ${(watermarkResult.detected_signatures || []).join("; ") || "none"}
- Summary: ${watermarkResult.summary ?? "No data"}
Use the watermark_integrity_score directly as your breakdown.watermark_integrity score.`
    : `
WATERMARK SCAN: No dedicated watermark scan data available. Score watermark_integrity as 50.`;

  // Detect text/logo/design signals in scene description and detected objects
  const sceneText = (sceneResult?.image_description || "").toLowerCase();
  const objectLabels = (sceneResult?.detected_objects || []).map(o => (o.item + " " + (o.item_description || "")).toLowerCase()).join(" ");
  const textSignals = ["text", "logo", "font", "lettering", "inscription", "caption", "watermark", "label", "sign", "banner", "typography", "written", "word", "letter", "graphic"];
  const textDetectedInScene = textSignals.some(s => sceneText.includes(s) || objectLabels.includes(s));

  const imageTypeBlock = imageType
    ? `
IMAGE TYPE CLASSIFICATION (from prior pass):
- Category: ${imageType.category ?? "Unknown"}
- Sub-type: ${imageType.sub_type ?? "Unknown"}
- Is computer-generated: ${imageType.is_computer_generated ?? "unknown"}
- Is real photograph: ${imageType.is_real_photo ?? "unknown"}
- Classification confidence: ${imageType.confidence ?? "unknown"}%
- Classification notes: ${imageType.classification_notes ?? "N/A"}
- Text/design elements detected in scene: ${textDetectedInScene}

IMPORTANT CONTEXT FOR VERDICT:
${
  imageType.is_computer_generated
    ? `This image has been classified as "${imageType.category}" (${imageType.sub_type}), which is a computer-generated or digitally designed image. Your verdict MUST be "ai_generated" with a confidence_score between 0 and 30. This is non-negotiable — logos, graphic designs, digital illustrations, and composites are NOT real photographs, even if they contain photographic elements. Adjust ALL breakdown scores downward accordingly.`
    : textDetectedInScene
    ? `IMPORTANT: Significant text, logos, labels, or design elements have been detected in this scene. The presence of styled text or graphic design is a strong indicator of a computer-generated or digitally composed image. Unless this is clearly a real photograph of a physical sign, book, or document, treat text presence as a major signal toward "ai_generated". Lower breakdown scores for image_text_indication, semantic_consistency, and contents_reality. Lean the verdict toward "ai_generated" unless all other forensic signals strongly indicate an authentic photograph.`
    : imageType.is_real_photo
    ? `This image has been classified as real photography ("${imageType.sub_type}"). Evaluate whether the photograph itself has been AI-manipulated, deepfaked, or altered. Score accordingly.`
    : `This image is classified as "${imageType.category}" (${imageType.sub_type}). Apply contextually appropriate scoring.`
}`
    : textDetectedInScene
    ? `\nNO IMAGE TYPE CLASSIFICATION available, but text/logo/label content was detected in the scene description. The presence of styled text or design elements is a strong signal toward a computer-generated or composite image. Lean the verdict toward "ai_generated" unless all other forensic signals clearly indicate a real photograph of a physical sign or document.`
    : "";

  return `You are an expert image forensics analyst. Analyze this image and determine if it is real or AI-generated.

SCENE CONTEXT (from prior analysis pass):
Description: ${sceneResult.image_description || "N/A"}
Detected objects:
${objectList || "  - None identified"}
${imageTypeBlock}
${paperTrailBlock}
${watermarkBlock}

Use this context to inform your forensic scoring below. Pay special attention to areas where the detected objects appear (especially faces, hands, text, and edges between objects).

Score ALL 26 criteria. Each score is 0-100 (100 = definitely real/authentic, 0 = definitely AI-generated/fake).
Return every score inside the "breakdown" JSON object — do NOT omit any key:

- breakdown.texture_consistency: High if textures look natural, low if suspiciously smooth or repetitive.
- breakdown.lighting_analysis: High if lighting is physically plausible, low if inconsistent or impossible.
- breakdown.edge_detection: High if edges look natural, low if unnaturally sharp or soft.
- breakdown.noise_pattern: High if noise matches real camera sensors, low if too clean or patterned.
- breakdown.facial_analysis: High if faces look natural (50 if no faces present), low if uncanny or malformed.
- breakdown.metadata_integrity: High if image appears to have authentic compression/origin markers, low if suspicious.
- breakdown.color_distribution: High if colors look natural, low if too uniform or impossible.
- breakdown.artifact_detection: High if no AI artifacts, low if malformed text/hands/geometry/seamlines present.
- breakdown.shading_analysis: High if shading is consistent with lighting and object form, low if inconsistent.
- breakdown.depth_of_field: High if depth of field is realistic, low if unnatural or missing.
- breakdown.motion_blur: High if motion blur is consistent with implied movement, low if unnatural or misplaced.
- breakdown.background_consistency: High if background matches foreground elements and lighting, low if inconsistent.
- breakdown.shadow_analysis: High if shadows are consistent with light sources and object positions, low if incorrect.
- breakdown.perspective_correctness: High if perspective is realistic, low if distorted or inconsistent.
- breakdown.compression_artifacts: High if no visible compression artifacts, low if present (e.g. blockiness in JPEG).
- breakdown.image_text_indication: 100 if no text detected; 50 if some text present; lower if extensive illogical text.
- breakdown.contents_reality: 100 if all image contents appear logical and realistic; lower if things defy reality.
- breakdown.ai_fingerprint: High if no known AI model signatures or watermark patterns detected, low if typical GAN/diffusion artifacts (e.g. spectral peaks, frequency anomalies) or embedded watermarks are present.
- breakdown.clone_detection: High if no repetitive or copy-pasted regions detected, low if identical or near-identical patches appear in unexpected locations.
- breakdown.scale_proportion: High if all objects are correctly sized relative to each other and the scene, low if unrealistic size or proportion discrepancies exist.
- breakdown.optical_anomalies: High if reflections, lens flares, and optical distortions are physically plausible, low if reflections are missing, duplicated, or geometrically impossible.
- breakdown.exif_manipulation: High if EXIF/metadata fields show no signs of editing or inconsistency, low if timestamps, GPS, camera model fields appear tampered with or mismatched.
- breakdown.semantic_consistency: High if all scene elements make logical sense together (weather, environment, object placement), low if the scene contains illogical or contextually impossible combinations.
- breakdown.internet_presence: Score based on the IMAGE PAPER TRAIL context below. High (80-100) if found on credible news/official sources. Medium (40-60) if found on stock sites or unknown. Low (0-20) if found exclusively on AI art platforms or nowhere at all. Use 50 if no paper trail data available.
- breakdown.watermark_integrity: Score based on the WATERMARK SCAN RESULTS below. High (80-100) if no AI watermarks or signature artifacts detected. Low (0-20) if strong AI watermarks, steganographic signals, or frequency anomalies found. Use 50 if no scan data available.
- breakdown.image_description_analysis: Score based SOLELY on the scene description and detected objects from the SCENE CONTEXT above. High (80-100) if the description depicts a plausible real-world scene with natural context, lighting, and objects that co-exist logically. Low (0-20) if the description reveals hallmarks of AI generation: impossible object combinations, surreal scenarios, hyper-perfect compositions, characters with unusual perfection, fantasy or non-existent settings, or elements that are statistically improbable in real photography. Score 50 if the description is neutral/ambiguous.

Return your full response as a JSON object with these exact top-level fields:
- verdict: MUST be either "real" or "ai_generated" — never "inconclusive". Commit to a decision based on the weight of evidence.
- confidence_score: overall authenticity score 0-100. HIGH (70-100) for real, LOW (0-30) for AI-generated.
- analysis_summary: A 2-3 sentence explanation referencing specific objects or regions from the scene context.
- reasoning: A single direct sentence starting with "This image was declared [real/AI-generated] because..." citing the 1-3 most decisive signals that tipped the verdict.
- breakdown: object containing ALL 26 scores (every key required).
- flagged_regions: Array of suspicious areas. Each must have:
  - x: left position as % of image width (0-100)
  - y: top position as % of image height (0-100)
  - width: width as % of image width (1-100)
  - height: height as % of image height (1-100)
  - category: one of "texture", "lighting", "edge", "noise", "face", "artifact", "geometry", "color"
  - label: short 2-5 word description (e.g. "Unnatural skin smoothing")
  Return empty array for real images; identify 2-5 regions for AI-generated or inconclusive images.

IMPORTANT: verdict MUST match the breakdown scores and the image type context above. breakdown must contain all 26 keys.
Be thorough — look for unnatural symmetry, impossible geometry, texture inconsistencies, lighting anomalies.
Always respect the IMAGE TYPE CLASSIFICATION — a logo, graphic design, illustration, or digital art is always "ai_generated" regardless of visual quality. A real photograph being evaluated for manipulation should be scored differently from a fully computer-generated image.`;
}

const FORENSIC_SCHEMA = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["real", "ai_generated"] },
    confidence_score: { type: "number" },
    analysis_summary: { type: "string" },
    reasoning: { type: "string" },
    breakdown: {
      type: "object",
      properties: {
        texture_consistency: { type: "number" },
        lighting_analysis: { type: "number" },
        edge_detection: { type: "number" },
        noise_pattern: { type: "number" },
        facial_analysis: { type: "number" },
        metadata_integrity: { type: "number" },
        color_distribution: { type: "number" },
        artifact_detection: { type: "number" },
        shading_analysis: { type: "number" },
        depth_of_field: { type: "number" },
        motion_blur: { type: "number" },
        background_consistency: { type: "number" },
        shadow_analysis: { type: "number" },
        perspective_correctness: { type: "number" },
        compression_artifacts: { type: "number" },
        image_text_indication: { type: "number" },
        contents_reality: { type: "number" },
        ai_fingerprint: { type: "number" },
        clone_detection: { type: "number" },
        scale_proportion: { type: "number" },
        optical_anomalies: { type: "number" },
        exif_manipulation: { type: "number" },
        semantic_consistency: { type: "number" },
        internet_presence: { type: "number" },
        watermark_integrity: { type: "number" },
        image_description_analysis: { type: "number" },
      },
    },
    flagged_regions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          x: { type: "number" },
          y: { type: "number" },
          width: { type: "number" },
          height: { type: "number" },
          category: { type: "string" },
          label: { type: "string" },
        },
      },
    },
  },
};

// Small image = likely a real photo taken on a phone/camera at lower res or a thumbnail
const SMALL_IMAGE_THRESHOLD_PX = 800; // either dimension ≤ this

async function callLocalLms(endpoint, model, imageBase64, prompt, schema, temperature) {
  const response = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageBase64 } },
      ]}],
      temperature: temperature ?? 0,
      response_format: { type: "json_schema", json_schema: { name: "result", strict: true, schema } },
    }),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Local LMS error: ${response.status} ${response.statusText} — ${errText}`);
  }
  const raw = await response.json();
  let content = raw?.choices?.[0]?.message?.content ?? "{}";
  if (typeof content === "string") {
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    return JSON.parse(content);
  }
  return content;
}

async function ensureHostedUrl(imageUrl) {
  // If already a hosted URL, use as-is
  if (!imageUrl.startsWith("data:")) return imageUrl;
  // Convert base64 data URL → Blob → upload → get hosted URL
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
  const { file_url } = await apiClient.integrations.Core.UploadFile({ file });
  return file_url;
}

async function runAnalysis(imageUrlParam, sourceType, exifData = null, imageDimensions = null, settings = null) {
  const logger = createLogger();
  let imageUrl = imageUrlParam;
  let sceneResult = null;
  let llmResult = null;
  let reverseSearchResults = null;
  let paperTrail = null;
  let watermarkResult = null;
  let imageTypeResult = null;

  // Run reverse search + watermark scan in parallel BEFORE forensic analysis
  // Only run on hosted URLs and when local_mode is off (reverse search requires cloud/internet)
  if (!imageUrl.startsWith("data:") && !settings?.local_mode) {
    try {
      const rsPrompt = REVERSE_SEARCH_PROMPT(imageUrl);
      const [paperTrailResult, watermarkRes] = await Promise.all([
        apiClient.integrations.Core.InvokeLLM({
          prompt: rsPrompt,
          add_context_from_internet: true,
          response_json_schema: REVERSE_SEARCH_SCHEMA,
        }).catch(() => null),
        apiClient.integrations.Core.InvokeLLM({
          prompt: WATERMARK_PROMPT,
          file_urls: [imageUrl],
          response_json_schema: WATERMARK_SCHEMA,
        }).catch(() => null),
      ]);
      paperTrail = paperTrailResult ?? null;
      watermarkResult = watermarkRes ?? null;
      // Construct reverseSearchResults in the same shape the rest of the code expects
      reverseSearchResults = {
        data: {
          hasMatches: paperTrail?.has_web_presence ?? false,
          resultsCount: paperTrail?.has_web_presence ? 1 : 0,
          reverseSearchUrl: `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}&hl=en`,
          paperTrail,
        },
      };
      logger.log("PRE_ANALYSIS:REVERSE_SEARCH", {
        summary: `Found: ${paperTrail?.has_web_presence ?? false}, sources: ${(paperTrail?.sources_found || []).length}`,
        prompt: rsPrompt,
        schema: REVERSE_SEARCH_SCHEMA,
        input: { imageUrl },
        result: paperTrail,
        notes: paperTrail ? null : "Reverse search failed — result is null",
      });
      logger.log("PRE_ANALYSIS:WATERMARK", {
        summary: `Integrity: ${watermarkResult?.watermark_integrity_score ?? "N/A"}, risk: ${watermarkResult?.steganographic_risk ?? "N/A"}`,
        prompt: WATERMARK_PROMPT,
        schema: WATERMARK_SCHEMA,
        input: { imageUrl },
        result: watermarkResult,
        notes: watermarkResult ? null : "Watermark scan failed — result is null",
      });
      console.log(`[PRE] ReverseSearch: found=${paperTrail?.has_web_presence}, credibility=${paperTrail?.source_credibility}, sources=${(paperTrail?.sources_found||[]).length}`);
      console.log(`[PRE] Watermark: integrity=${watermarkResult?.watermark_integrity_score}, risk=${watermarkResult?.steganographic_risk}, visible=${watermarkResult?.visible_watermarks_found}`);
    } catch (err) {
      console.warn("Pre-analysis scans failed:", err);
    }
  }

  try {
    const useLocalLms = settings?.use_local_lms || false;
    const temp = settings?.llm_temperature ?? 0;

    if (useLocalLms && settings?.local_lms_endpoint) {
      const endpoint = settings.local_lms_endpoint.replace(/\/$/, "");
      const model = settings.lms_model || "llava:7b";

      // For local LMS, encode to base64 (it accepts data URLs directly)
      const base64 = imageUrl.startsWith("data:")
        ? imageUrl
        : await fetch(imageUrl).then((r) => r.blob()).then((blob) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          }));

      // For local LMS: run watermark via local model (has the image); reverse search needs a real URL
      if (!imageUrl.startsWith("data:")) {
        // Reverse search — run via InvokeLLM with internet context (text only, no image needed)
        const rsPrompt = REVERSE_SEARCH_PROMPT(imageUrl);
        const [ptResult, wmResult] = await Promise.all([
          apiClient.integrations.Core.InvokeLLM({
            prompt: rsPrompt,
            add_context_from_internet: true,
            response_json_schema: REVERSE_SEARCH_SCHEMA,
          }).catch(() => null),
          callLocalLms(endpoint, model, base64, WATERMARK_PROMPT, WATERMARK_SCHEMA, temp).catch(() => null),
        ]);
        paperTrail = ptResult ?? null;
        watermarkResult = wmResult ?? null;
        reverseSearchResults = { data: { hasMatches: paperTrail?.has_web_presence ?? false, resultsCount: paperTrail?.has_web_presence ? 1 : 0, reverseSearchUrl: `https://images.google.com/searchbyimage?image_url=${encodeURIComponent(imageUrl)}&hl=en`, paperTrail } };
        logger.log("PRE_ANALYSIS:REVERSE_SEARCH", { summary: `Found: ${paperTrail?.has_web_presence ?? false}`, prompt: rsPrompt, schema: REVERSE_SEARCH_SCHEMA, input: { imageUrl }, result: paperTrail, notes: paperTrail ? null : "Failed" });
        logger.log("PRE_ANALYSIS:WATERMARK", { summary: `Integrity: ${watermarkResult?.watermark_integrity_score ?? "N/A"}`, prompt: WATERMARK_PROMPT, schema: WATERMARK_SCHEMA, input: { imageUrl }, result: watermarkResult, notes: watermarkResult ? null : "Failed" });
        console.log(`[PRE/LMS] ReverseSearch: found=${paperTrail?.has_web_presence}, credibility=${paperTrail?.source_credibility}`);
        console.log(`[PRE/LMS] Watermark: integrity=${watermarkResult?.watermark_integrity_score}, risk=${watermarkResult?.steganographic_risk}`);
      } else {
        // base64 — watermark via local model, no reverse search possible
        watermarkResult = await callLocalLms(endpoint, model, base64, WATERMARK_PROMPT, WATERMARK_SCHEMA, temp).catch(() => null);
        logger.log("PRE_ANALYSIS:WATERMARK", { summary: `Integrity: ${watermarkResult?.watermark_integrity_score ?? "N/A"}`, prompt: WATERMARK_PROMPT, schema: WATERMARK_SCHEMA, input: { source: "base64" }, result: watermarkResult, notes: "Reverse search skipped — no hosted URL for base64 image" });
        console.log(`[PRE/LMS] Watermark (base64): integrity=${watermarkResult?.watermark_integrity_score}, risk=${watermarkResult?.steganographic_risk}`);
      }

      // Pass 0 + Pass 1: Image type classification and scene understanding
      [imageTypeResult, sceneResult] = await Promise.all([
        callLocalLms(endpoint, model, base64, IMAGE_TYPE_PROMPT, IMAGE_TYPE_SCHEMA, temp),
        callLocalLms(endpoint, model, base64, SCENE_PROMPT, SCENE_SCHEMA, temp),
      ]);
      logger.log("PASS_0:IMAGE_TYPE", {
        summary: `${imageTypeResult?.category} · ${imageTypeResult?.sub_type} · computer_generated=${imageTypeResult?.is_computer_generated}`,
        prompt: IMAGE_TYPE_PROMPT,
        schema: IMAGE_TYPE_SCHEMA,
        result: imageTypeResult,
      });
      logger.log("PASS_1:SCENE", {
        summary: sceneResult?.image_description?.slice(0, 100),
        prompt: SCENE_PROMPT,
        schema: SCENE_SCHEMA,
        result: sceneResult,
      });
      console.log(`[PASS_0/LMS] ImageType: ${imageTypeResult?.category} · ${imageTypeResult?.sub_type} · computer_generated=${imageTypeResult?.is_computer_generated} · confidence=${imageTypeResult?.confidence}`);
      console.log(`[PASS_1/LMS] Scene: objects=${sceneResult?.detected_objects?.length} · desc="${sceneResult?.image_description?.slice(0,80)}..."`);

      // Pass 1b + 1c: Text-only description verdict + image type from description (run in parallel)
      if (sceneResult?.image_description) {
        const dvPrompt = DESCRIPTION_VERDICT_PROMPT(sceneResult.image_description);
        const itPrompt = IMAGE_TYPE_FROM_DESCRIPTION_PROMPT(sceneResult.image_description, sceneResult.detected_objects);
        const [descVerdict, imageTypeFromDesc] = await Promise.all([
          callLocalLms(endpoint, model, base64, dvPrompt, DESCRIPTION_VERDICT_SCHEMA, temp),
          callLocalLms(endpoint, model, base64, itPrompt, IMAGE_TYPE_FROM_DESCRIPTION_SCHEMA, temp).catch(() => null),
        ]);
        sceneResult.description_verdict = descVerdict;
        logger.log("PASS_1B:DESCRIPTION_VERDICT", {
          summary: `verdict=${descVerdict?.verdict}, score=${descVerdict?.score}`,
          prompt: dvPrompt,
          schema: DESCRIPTION_VERDICT_SCHEMA,
          result: descVerdict,
        });
        logger.log("PASS_1C:IMAGE_TYPE_FROM_DESCRIPTION", {
          summary: `${imageTypeFromDesc?.category} · ${imageTypeFromDesc?.sub_type} · confidence=${imageTypeFromDesc?.confidence}`,
          prompt: itPrompt,
          schema: IMAGE_TYPE_FROM_DESCRIPTION_SCHEMA,
          result: imageTypeFromDesc,
          notes: imageTypeFromDesc
            ? (imageTypeFromDesc.confidence >= (imageTypeResult?.confidence ?? 0)
              ? "Used — higher confidence than visual pass"
              : "Skipped — visual pass had equal/higher confidence")
            : "Failed — result is null",
        });
        // Override imageTypeResult if description-based classification is more confident
        if (imageTypeFromDesc && imageTypeFromDesc.confidence > (imageTypeResult?.confidence ?? 0)) {
          imageTypeResult = imageTypeFromDesc;
        }
        console.log(`[PASS_1B/LMS] DescVerdict: verdict=${descVerdict?.verdict}, score=${descVerdict?.score}`);
        console.log(`[PASS_1C/LMS] ImageTypeFromDesc: ${imageTypeFromDesc?.category} · ${imageTypeFromDesc?.sub_type} · confidence=${imageTypeFromDesc?.confidence} · used=${imageTypeFromDesc?.confidence > (imageTypeResult?.confidence ?? 0)}`);
      }

      // Pass 2: Forensic analysis with scene context + paper trail + watermark + image type injected
      const forensicPromptLms = buildForensicPrompt(sceneResult, paperTrail, watermarkResult, imageTypeResult);
      llmResult = await callLocalLms(endpoint, model, base64, forensicPromptLms, FORENSIC_SCHEMA, temp);
      logger.log("PASS_2:FORENSIC", {
        summary: `verdict=${llmResult?.verdict}, confidence=${llmResult?.confidence_score}`,
        prompt: forensicPromptLms,
        schema: FORENSIC_SCHEMA,
        input: { imageType: imageTypeResult, sceneDescription: sceneResult?.image_description, paperTrail, watermarkResult },
        result: llmResult,
      });
      console.log(`[PASS_2/LMS] Forensic: verdict=${llmResult?.verdict}, confidence=${llmResult?.confidence_score}, flagged=${llmResult?.flagged_regions?.length}`);

    } else {
      // For Base44 InvokeLLM, file_urls must be hosted URLs (not base64)
      // In local_mode, skip the upload and keep base64 as-is (local model accepts data URLs)
      const hostedUrl = settings?.local_mode ? imageUrl : await ensureHostedUrl(imageUrl);
      imageUrl = hostedUrl; // update so downstream code (logging, analysisData) uses hosted URL

      const ts = Date.now();

      // Pass 0: Image type classification (runs in parallel with Pass 1)
      let pass1Result;
      const p0prompt = `[Image ref: ${hostedUrl} t=${ts}]\n\n${IMAGE_TYPE_PROMPT}`;
      const p1prompt = `[Image ref: ${hostedUrl} t=${ts}]\n\n${SCENE_PROMPT}`;
      [imageTypeResult, pass1Result] = await Promise.all([
        apiClient.integrations.Core.InvokeLLM({
          prompt: p0prompt,
          file_urls: [hostedUrl],
          response_json_schema: IMAGE_TYPE_SCHEMA,
        }),
        apiClient.integrations.Core.InvokeLLM({
          prompt: p1prompt,
          file_urls: [hostedUrl],
          response_json_schema: SCENE_SCHEMA,
        }),
      ]);
      sceneResult = pass1Result;
      logger.log("PASS_0:IMAGE_TYPE", {
        summary: `${imageTypeResult?.category} · ${imageTypeResult?.sub_type} · computer_generated=${imageTypeResult?.is_computer_generated}`,
        prompt: p0prompt,
        schema: IMAGE_TYPE_SCHEMA,
        result: imageTypeResult,
      });
      logger.log("PASS_1:SCENE", {
        summary: sceneResult?.image_description?.slice(0, 100),
        prompt: p1prompt,
        schema: SCENE_SCHEMA,
        result: sceneResult,
      });
      console.log(`[PASS_0] ImageType: ${imageTypeResult?.category} · ${imageTypeResult?.sub_type} · computer_generated=${imageTypeResult?.is_computer_generated} · confidence=${imageTypeResult?.confidence}`);
      console.log(`[PASS_1] Scene: objects=${sceneResult?.detected_objects?.length} · desc="${sceneResult?.image_description?.slice(0,80)}..."`);

      // Pass 1b + 1c: Text-only description verdict + image type from description (run in parallel, cheap text calls)
      if (sceneResult?.image_description) {
        const dvPrompt2 = DESCRIPTION_VERDICT_PROMPT(sceneResult.image_description);
        const itPrompt2 = IMAGE_TYPE_FROM_DESCRIPTION_PROMPT(sceneResult.image_description, sceneResult.detected_objects);
        const [descVerdict, imageTypeFromDesc] = await Promise.all([
          apiClient.integrations.Core.InvokeLLM({
            prompt: dvPrompt2,
            response_json_schema: DESCRIPTION_VERDICT_SCHEMA,
          }),
          apiClient.integrations.Core.InvokeLLM({
            prompt: itPrompt2,
            response_json_schema: IMAGE_TYPE_FROM_DESCRIPTION_SCHEMA,
          }).catch(() => null),
        ]);
        sceneResult.description_verdict = descVerdict;
        logger.log("PASS_1B:DESCRIPTION_VERDICT", {
          summary: `verdict=${descVerdict?.verdict}, score=${descVerdict?.score}`,
          prompt: dvPrompt2,
          schema: DESCRIPTION_VERDICT_SCHEMA,
          result: descVerdict,
        });
        logger.log("PASS_1C:IMAGE_TYPE_FROM_DESCRIPTION", {
          summary: `${imageTypeFromDesc?.category} · ${imageTypeFromDesc?.sub_type} · confidence=${imageTypeFromDesc?.confidence}`,
          prompt: itPrompt2,
          schema: IMAGE_TYPE_FROM_DESCRIPTION_SCHEMA,
          result: imageTypeFromDesc,
          notes: imageTypeFromDesc
            ? (imageTypeFromDesc.confidence >= (imageTypeResult?.confidence ?? 0)
              ? "Used — higher confidence than visual pass"
              : "Skipped — visual pass had equal/higher confidence")
            : "Failed — result is null",
        });
        // Override imageTypeResult if description-based classification is more confident
        if (imageTypeFromDesc && imageTypeFromDesc.confidence > (imageTypeResult?.confidence ?? 0)) {
          imageTypeResult = imageTypeFromDesc;
        }
        console.log(`[PASS_1B] DescVerdict: verdict=${descVerdict?.verdict}, score=${descVerdict?.score}`);
        console.log(`[PASS_1C] ImageTypeFromDesc: ${imageTypeFromDesc?.category} · ${imageTypeFromDesc?.sub_type} · confidence=${imageTypeFromDesc?.confidence} · used=${imageTypeFromDesc?.confidence > (imageTypeResult?.confidence ?? 0)}`);
      }

      // Pass 2: Forensic analysis
      const forensicPrompt = buildForensicPrompt(sceneResult, paperTrail, watermarkResult, imageTypeResult);
      const forensicFullPrompt = `[Image ref: ${hostedUrl} t=${ts}]\n\n${forensicPrompt}`;
      llmResult = await apiClient.integrations.Core.InvokeLLM({
        prompt: forensicFullPrompt,
        file_urls: [hostedUrl],
        response_json_schema: FORENSIC_SCHEMA,
      });
      console.log(`[PASS_2] Forensic: verdict=${llmResult?.verdict}, confidence=${llmResult?.confidence_score}, flagged=${llmResult?.flagged_regions?.length}`);
      logger.log("PASS_2:FORENSIC", {
        summary: `verdict=${llmResult?.verdict}, confidence=${llmResult?.confidence_score}`,
        prompt: forensicFullPrompt,
        schema: FORENSIC_SCHEMA,
        input: { imageType: imageTypeResult, sceneDescription: sceneResult?.image_description, paperTrail, watermarkResult },
        result: llmResult,
      });
    }
  } catch (err) {
    console.error("Analysis error:", err);
    logErrorLocally({ image_url: imageUrl, error: err.message, source_type: sourceType });
    return null;
  }

  // Log token usage locally (no entity needed)
  if (llmResult) {
    logTokenUsageLocally({ operation: 'analyze_image', tokens_used: 4000, image_url: imageUrl, verdict: llmResult.verdict });
  }

  const breakdown = { ...(llmResult.breakdown ?? {}) };
  const BREAKDOWN_KEYS = [
    "texture_consistency", "lighting_analysis", "edge_detection", "noise_pattern",
    "facial_analysis", "metadata_integrity", "color_distribution", "artifact_detection",
    "shading_analysis", "depth_of_field", "motion_blur", "background_consistency",
    "shadow_analysis", "perspective_correctness", "compression_artifacts",
    "image_text_indication", "contents_reality",
    "ai_fingerprint", "clone_detection", "scale_proportion",
    "optical_anomalies", "exif_manipulation", "semantic_consistency", "internet_presence",
    "watermark_integrity", "image_description_analysis",
  ];

  // Factor EXIF presence into metadata_integrity score
  if (sourceType === "upload") {
    const hasPixelDimensions = exifData?.PixelXDimension && exifData?.PixelYDimension;
    const hasDate = exifData?.DateTimeOriginal;
    const hasCameraMakeOrModel = exifData?.Make || exifData?.Model;
    const isAuthenticCamera = hasPixelDimensions && hasDate && hasCameraMakeOrModel;
    const exifScore = isAuthenticCamera ? 85 : 20;
    const llmMeta = typeof breakdown.metadata_integrity === "number" ? breakdown.metadata_integrity : 50;
    breakdown.metadata_integrity = Math.round(llmMeta * 0.4 + exifScore * 0.6);
    logger.log("POST:EXIF", {
      summary: `authentic_camera=${isAuthenticCamera}, exif_score=${exifScore}, final_metadata_integrity=${breakdown.metadata_integrity}`,
      input: exifData ?? {},
      computed: { isAuthenticCamera, exifScore, llmMeta, final: breakdown.metadata_integrity },
    });
  }

  // Apply reverse search penalty if enabled and no matches found
  if (settings?.reverse_search_penalty_ai && !(paperTrail?.has_web_presence)) {
    // Increase AI probability by 10% (decrease confidence by 10)
    const penaltyAmount = 10;
    const breakdown_copy = { ...breakdown };
    BREAKDOWN_KEYS.forEach(key => {
      if (typeof breakdown_copy[key] === "number") {
        breakdown_copy[key] = Math.max(0, breakdown_copy[key] - penaltyAmount);
      }
    });
    Object.assign(breakdown, breakdown_copy);
  }

  const breakdownValues = BREAKDOWN_KEYS.map(k => breakdown[k]).filter(v => typeof v === "number");
  const computedScore = breakdownValues.length > 0
    ? Math.round(breakdownValues.reduce((a, b) => a + b, 0) / (breakdownValues.length * 100) * 100)
    : llmResult.confidence_score ?? 50;

  const verdict = llmResult.verdict ?? "ai_generated";

  console.log(`[POST] Scoring: verdict=${verdict}, computed=${computedScore}, llm_raw=${llmResult.confidence_score}, breakdown_keys=${breakdownValues.length}`);
  logger.log("POST:SCORING", {
    summary: `final verdict=${verdict}, computed_score=${computedScore}, llm_raw_score=${llmResult.confidence_score}`,
    computed: {
      verdict,
      computedScore,
      llm_raw_confidence: llmResult.confidence_score,
      breakdown_key_count: breakdownValues.length,
      breakdown_avg: computedScore,
    },
    result: breakdown,
  });

  // Compute per-criterion mini verdicts based solely on individual scores
  const criteria_verdicts = {};
  BREAKDOWN_KEYS.forEach((key) => {
    const score = breakdown[key];
    if (typeof score === "number") {
      if (score >= 60) criteria_verdicts[key] = "real";
      else if (score < 40) criteria_verdicts[key] = "ai_generated";
      else criteria_verdicts[key] = "uncertain";
    }
  });

  const analysisData = {
    image_url: imageUrl,
    source_type: sourceType,
    verdict,
    confidence_score: computedScore,
    breakdown,
    analysis_summary: llmResult.analysis_summary ?? "",
    reasoning: llmResult.reasoning ?? "",
    image_description: sceneResult?.image_description ?? "",
    description_verdict: sceneResult?.description_verdict ?? null,
    image_type: imageTypeResult ?? null,
    detected_objects: sceneResult?.detected_objects ?? [],
    image_metadata: exifData ?? {},
    reverse_search_result: reverseSearchResults?.data ?? null,
    paper_trail: paperTrail ?? null,
    watermark_result: watermarkResult ?? null,
    criteria_verdicts,
    flagged_regions: llmResult.flagged_regions ?? [],
    lms_model: (settings?.use_local_lms && settings?.lms_model) ? settings.lms_model : null,
  };

  const saved = await createAnalysis(analysisData);

  // Save full log session linked to this analysis record
  const sessionId = saveSession(imageUrl, logger.getLogs(), saved.id);

  // Patch the stored record with the session_id back-reference
  const all = (() => { try { return JSON.parse(localStorage.getItem("verilens_analyses") || "[]"); } catch { return []; } })();
  const idx = all.findIndex((r) => r.id === saved.id);
  if (idx !== -1) { all[idx].session_id = sessionId; localStorage.setItem("verilens_analyses", JSON.stringify(all)); }

  return { ...saved, session_id: sessionId };
}

export default function Home() {
  const [queue, setQueue] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUrlAnalyzing, setIsUrlAnalyzing] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [showLogHint, setShowLogHint] = useState(false);
  const processingRef = useRef(false);
  const [settings, setSettingsState] = useState(null);

  const updateItem = (id, patch) =>
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const processItems = async (newItems, userSettings = null) => {
    // Load settings from localStorage
    const saved = localStorage.getItem("verilens_settings");
    const currentSettings = saved ? JSON.parse(saved) : {};
    const sleepMs = currentSettings.queue_sleep_ms || 500;
    
    // Merge user settings if provided
    const mergedSettings = { ...currentSettings, ...userSettings };

    for (const item of newItems) {
      updateItem(item.id, { status: "uploading" });

      try {
        // In local_mode, always use base64 — never upload to cloud or check auth
        const useBase64 = currentSettings.local_mode || !(await apiClient.auth.isAuthenticated());

        const [imageUrl, exifData] = await Promise.all([
          useBase64
            ? fileToBase64DataUrl(item.file)
            : apiClient.integrations.Core.UploadFile({ file: item.file }).then((r) => r.file_url),
          exifr.parse(item.file, { pick: ["Make", "Model", "DateTimeOriginal", "PixelXDimension", "PixelYDimension"] }).catch(() => null),
        ]);

        // Update preview to use the resolved URL (base64 or hosted)
        updateItem(item.id, { preview: imageUrl });

        // Read natural dimensions
        const dims = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
          img.onerror = () => resolve(null);
          img.src = imageUrl;
        });

        updateItem(item.id, { status: "analyzing" });
        const result = await runAnalysis(imageUrl, "upload", exifData, dims, mergedSettings);

        if (result) {
          updateItem(item.id, { status: "done", result });
          setLatestResult(result);
          setShowLogHint(true);
        } else {
          updateItem(item.id, { status: "error", error: "Analysis failed - check admin logs" });
        }

        // Sleep before next item to avoid rate limiting
        if (newItems.indexOf(item) < newItems.length - 1) {
          await sleep(sleepMs);
        }
      } catch (err) {
        console.error("Queue processing error:", err);
        updateItem(item.id, { status: "error", error: err.message });
        
        logErrorLocally({ image_url: item.filename, error: err.message, source_type: "upload" });
      }
    }
  };

  const handleFilesSelected = (files) => {
    setQueue((prev) => {
      const existingKeys = new Set(prev.map((i) => `${i.filename}-${i.file?.size}`));
      const dedupedFiles = files.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));
      if (dedupedFiles.length === 0) return prev;

      const newItems = dedupedFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        filename: file.name,
        preview: URL.createObjectURL(file),
        status: "pending",
        result: null,
      }));

      processItems(newItems, {});
      return [...prev, ...newItems];
    });
  };

  const handleUrlAnalyze = async () => {
    if (!urlInput.trim()) return;
    setIsUrlAnalyzing(true);
    setLatestResult(null);
    
    try {
      // Load settings from localStorage
      const saved = localStorage.getItem("verilens_settings");
      const currentSettings = saved ? JSON.parse(saved) : {};
      const sleepMs = currentSettings.queue_sleep_ms || 500;
      

      
      // Sleep before analyzing to respect rate limits
      await sleep(sleepMs);
      
      const result = await runAnalysis(urlInput.trim(), "url", null, null, currentSettings);
      setLatestResult(result);
      if (result) setShowLogHint(true);
    } catch (err) {
      console.error("URL analysis error:", err);
      logErrorLocally({ image_url: urlInput.trim(), error: err.message, source_type: "url" });
    } finally {
      setIsUrlAnalyzing(false);
      setUrlInput("");
    }
  };

  const removeItem = (id) => setQueue((prev) => prev.filter((i) => i.id !== id));
  const clearAll = () => setQueue([]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          AI-Powered Detection
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Is it <span className="text-primary">Real</span> or{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            AI?
          </span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base">
          Drag & drop multiple images or paste a URL — each one is queued, uploaded, and
          analyzed automatically.
        </p>
      </motion.div>

      {/* Analyzer card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-xl shadow-black/5 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScanEye className="w-5 h-5 text-primary" />
              Image Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag & drop zone */}
            <MultiImageDropzone
              onFilesSelected={handleFilesSelected}
              disabled={false}
            />

            {/* Queue progress */}
            <QueueProgress
              queue={queue}
              onRemove={removeItem}
              onClearAll={clearAll}
            />

            {/* URL input */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Or analyze by URL
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlAnalyze()}
                  className="h-11 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
                />
                <Button
                  onClick={handleUrlAnalyze}
                  disabled={isUrlAnalyzing || !urlInput.trim()}
                  className="h-11 px-5 shrink-0 shadow-md shadow-primary/20"
                >
                  {isUrlAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Log hint */}
      {showLogHint && (
        <div className="flex justify-end">
          <Link
            to="/analysis-logs"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            View pipeline logs
          </Link>
        </div>
      )}

      {/* Latest result */}
      {latestResult && (
        <AnalysisResult
          result={latestResult}
          queueResults={queue.filter((i) => i.status === "done" && i.result).map((i) => i.result)}
        />
      )}
    </div>
  );
}
