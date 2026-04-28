# Real or AI

## About Real or AI

To determine whether the image is a real photograph or AI-generated, we will follow a structured approach using the provided prompts. Here's how each step should be executed:

1. **Reverse Search**: Investigate the internet paper trail for the image URL to check its origin and history.
2. **Watermark Detection**: Analyze the image for any watermarks or signature artifacts that might indicate authenticity or source.
3. **Image Type Classification**: Determine the type of image (e.g., portrait, landscape, macro, etc.) using expert classification techniques.
4. **Scene Analysis**: Use computer vision to analyze the scene and extract relevant details such as objects, lighting, and composition.
5. **Description Verdict**: Based on the description and detected objects from the scene analysis, determine if the image is real or AI-generated.

### Step-by-Step Execution

#### 1. Reverse Search
```javascript
const REVERSE_SEARCH_PROMPT = (url) => `You are an image provenance researcher. Investigate the internet paper trail for this image URL: ${url}`;
```
**Action**: Perform a reverse search on the provided image URL to trace its origin and history.

#### 2. Watermark Detection
```javascript
const WATERMARK_PROMPT = `You are a specialized AI watermark and signature artifact detector. Analyze this image carefully for the following specific signals:
- Presence of visible or subtle watermarks
- Any digital signatures or metadata embedded in the image
- Patterns that might indicate post-processing or manipulation`;
```
**Action**: Carefully examine the image for any signs of watermarks, digital signatures, or other artifacts that could indicate its origin and authenticity.

#### 3. Image Type Classification
```javascript
const IMAGE_TYPE_PROMPT = `You are an expert image classifier. Look at this image and determine what type of image it is.
- Is it a portrait?
- A landscape?
- Macro photography?
- Action shot?
- Still life?
- Abstract art?`;
```
**Action**: Classify the image based on its content, style, and composition.

#### 4. Scene Analysis
```javascript
const SCENE_PROMPT = `You are a computer vision assistant. Analyze this image and return a JSON object with:
{
  "objects": ["object1", "object2", "object3"],
  "lighting": "description_of_lighting",
  "composition": "description_of_composition",
  "background": "description_of_background"
}`;
```
**Action**: Use computer vision tools to analyze the image and extract details about objects, lighting, composition, and background.

#### 5. Description Verdict
```javascript
const DESCRIPTION_VERDICT_PROMPT = (description) => `You are an expert image forensics analyst. Analyze this image and determine if it is real or AI-generated.
- Consider the quality of the image (e.g., noise, sharpness)
- Evaluate the presence of realistic details versus overly perfect elements
- Assess consistency between detected objects and described scene`;
```
**Action**: Based on the description and detected objects from the scene analysis, make a determination about whether the image is real or AI-generated.

### Final Verdict

After completing all the above steps, you will have a comprehensive understanding of the image's origin, authenticity, and characteristics. The final verdict should be based on the combined evidence from all analysis steps.

```javascript
const FINAL_VERDICT_PROMPT = `You are an expert image forensics analyst. Based on the following information:
- Reverse Search Results: [insert results]
- Watermark Detection: [insert findings]
- Image Type Classification: [insert classification]
- Scene Analysis: [insert analysis details]
- Description Verdict: [insert description and verdict]

Determine if this image is a real photograph or AI-generated.`;
```

---

## How It Works

Real or AI employs sophisticated visual forensics techniques to examine images in depth. By analyzing multiple aspects of the image, it identifies patterns that are often invisible to the human eye but reveal the true nature of the image's origin.

---

## Key Features

### Visual Forensics
- **Texture Consistency:** Evaluates naturalness and consistency of textures.
- **Lighting Plausibility:** Checks if lighting sources and reflections are physically plausible.
- **Edge Sharpness:** Analyzes edge quality for unnatural smoothness or sharpness.

### 26-Point Scoring System
Each image undergoes a comprehensive evaluation across 26 forensic dimensions, including:
- Noise patterns
- Color distribution
- Depth of field
- Shadow analysis
- Artifact detection
- Watermark integrity
- AI fingerprinting

### Multi-Source Input
You can analyze images by uploading files directly or pasting URLs. Both methods are treated with the same rigorous analysis pipeline.

### History Tracking
Every analysis is stored in your personal history, allowing you to review past results, track patterns, and compare findings.

### Instant Results
Receive analysis results in seconds thanks to advanced AI vision models that provide forensic-level detail.

### Educational Insights
Gain a deeper understanding of what makes an image appear real or AI-generated through detailed summaries explaining the reasoning behind each verdict.

---

## The 26-Point Scoring System

Each image is evaluated on these 26 criteria, scored individually from 0 to 100. Higher scores indicate stronger signs of authenticity:

| **Criteria**                | **Description**                                                                 |
|-----------------------------|---------------------------------------------------------------------------------|
| Texture Consistency         | Evaluates natural and consistent textures or AI smoothing/repetition.             |
| Lighting Analysis           | Checks physical plausibility and consistency of light sources and reflections.  |
| Edge Detection              | Analyzes edge quality for unnatural softness or sharpness.                      |
| Noise Pattern               | Examines characteristic noise patterns from real cameras.                         |
| Facial Analysis             | Detects anomalies in faces, scores 50 if no faces present.                      |
| Metadata Integrity          | Evaluates visual clues about image origin and authenticity markers.           |
| Color Distribution          | Analyzes color histograms and gradients for unnatural uniformity or impossible combinations. |
| Artifact Detection          | Scans for AI artifacts like malformed text, extra fingers, seamlines, or impossible geometry. |
| Shading Analysis            | Checks consistency of shading with lighting conditions and object form.         |
| Depth of Field              | Evaluates realistic depth-of-field blur consistent with implied focal length.   |
| Motion Blur                 | Aligns motion blur with implied movement direction and speed.                   |
| Background Consistency      | Assesses matching lighting, perspective, and style between background and foreground. |
| Shadow Analysis             | Verifies correct shadow direction and intensity relative to light sources.    |
| Perspective Correctness     | Checks realistic perspective with consistent vanishing points and proportions.  |
| Compression Artifacts       | Detects suspicious JPEG blockiness or compression patterns inconsistent with natural camera output. |
| Image Text Indication       | Scores 100 if no text present, penalizes illogical, garbled, or AI-generated text artifacts. |
| Contents Reality            | Evaluates physical plausibility and realism of image content and scenario.      |
| AI Fingerprint / Watermark  | Detects known AI model signatures, GAN/diffusion frequency anomalies, spectral peaks, or embedded watermarks typical of generative models. |
| Clone / Repeated Elements   | Identifies copy-pasted or near-identical patches in unexpected locations.       |
| Scale & Proportion          | Checks correct sizing and proportions of objects relative to each other and the scene. |
| Optical Anomalies & Reflections | Verifies physical plausibility and geometric consistency of reflections, lens flares, and optical distortions. |
| EXIF Manipulation           | Checks EXIF/metadata fields for signs of tampering: inconsistent timestamps, missing camera model, or GPS mismatches. |
| Semantic Consistency        | Evaluates logical sense of all scene elements together — weather, environment, object placement, and context. |
| Internet Presence           | Cross-references the image against the web; high score if found on credible news or official sources; low if found only on AI art platforms or nowhere. |
| Watermark Integrity         | Runs a dedicated scan for C2PA metadata, SynthID signals, steganographic watermarks, and frequency-domain anomalies from AI generators. |
| Image Description Analysis  | Scores based solely on scene description from Pass 1: plausible real-world scenes score high; surreal, hyper-perfect, or AI-typical compositions score low. |

---

# Internal Proxy Setup

## Overview

To avoid Cross-Origin Resource Sharing (CORS) issues when making large language API calls from the frontend, we have set up an internal proxy using Vite's development server. This proxy forwards requests to your local model server (e.g., Ollama).

## Configuration

The proxy is configured in the `vite.config.js` file as follows:

```javascript
// vite.config.js

export default {
  server: {
    proxy: {
      '/proxy': {
        target: 'http://localhost:11434', // Replace with the actual Ollama API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ''),
      },
    },
  },
};
```

### Key Configuration Options

- **`/proxy`**: This is the prefix that will be used in your frontend requests to indicate that they should be proxied. For example, a request to `/proxy/api/data` will be forwarded to `http://localhost:11434/api/data`.

- **`target`**: The URL of the model server where the requests should be forwarded. In this case, it is set to `http://localhost:11434`. You may need to update this URL if your model server is hosted elsewhere.

- **`changeOrigin`**: When set to `true`, this option changes the origin of the request to match the target URL. This is often necessary to bypass CORS restrictions on the server side.

- **`rewrite`**: This function rewrites the path of the request before it is sent to the target server. In this case, it removes the `/proxy` prefix from the path, so that the model server receives the correct endpoint URL.

## Important Notes

- **Development Only**: This proxy setup is intended for use during local development. For production environments, you may need a different approach to handle CORS issues, such as configuring the model server to accept requests from your frontend domain or using a reverse proxy like Nginx.

- **Security Considerations**: Ensure that the target URL (`http://localhost:11434` in this example) is secure and accessible only within your internal network. Exposing sensitive APIs to external networks can pose serious security risks.

## Note: Replace `http://localhost:11434` with the actual URL of your Ollama API.

---

## Prompt Flow

**Modules and Structure**

The codebase consists of several modules, each responsible for a specific aspect of the analysis:

1. **[`image-forensics.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/image-forensics.js)**: The main entry point of the tool.
2. **[`utils.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/utils.js)**: Provides utility functions for image processing and analysis.
3. **[`text-analysis.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/text-analysis.js)**: Analyzes text and logo signals in the image.
4. **[`watermark-detection.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/watermark-detection.js)**: Detects watermarks and steganographic signals in the image.
5. **[`exif-parser.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/exif-parser.js)**: Parses EXIF metadata from the image file.
6. **[`edge-detection.js`](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/main/edge-detection.js)**: Analyzes edge detection artifacts in the image.

**Analysis Flow**

The analysis flow can be summarized as follows:

1. Load the input image file and perform initial processing (e.g., resizing, converting to grayscale).
2. Run text analysis using `text-analysis.js`.
3. Run watermark detection using `watermark-detection.js`.
4. Parse EXIF metadata using `exif-parser.js` and analyze it for inconsistencies.
5. Analyze edge detection artifacts using `edge-detection.js`.
6. Combine the results of each step to determine whether the image is real or AI-generated.

**Output**

The tool returns a JSON object containing the following fields:

* `verdict`: Either "real" or "ai_generated", indicating the final verdict.
* `confidence_score`: An overall authenticity score (0-100).
* `analysis_summary`: A brief summary of the analysis, referencing specific objects or regions from the image context.
* `reasoning`: A single sentence explaining why the tool declared the image real or AI-generated.
* `breakdown`: An object containing all 26 scores and flags for each aspect of the analysis (e.g., texture consistency, lighting analysis).
* `flagged_regions`: An array of suspicious areas in the image, including their position, size, category, and label.

**Analysis Specifications**

1. **Contextual analysis**: The analyst must consider the context in which the image was created, including the image type classification, paper trail, and watermark scan results.
2. **Visual analysis**: The analyst must evaluate the image's visual characteristics, including texture, lighting, edges, noise, facial features, artifacts, geometry, color, and optical anomalies.
3. **Metadata analysis**: The analyst must examine the image's metadata, including EXIF fields, timestamps, GPS, and camera model information.
4. **Semantic consistency**: The analyst must assess whether the image's contents are logically consistent and realistic.
5. **Internet presence**: The analyst must consider the image's presence on the internet, including its source, publication date, and any notable events or controversies surrounding its release.
6. **Watermark integrity**: The analyst must evaluate the presence and authenticity of any watermarks or signature artifacts embedded in the image.
7. **Breakdown scoring**: The analyst must assign scores to each of the 26 criteria, using a 0-100 scale to indicate the level of authenticity or AI-generatedness.

The specification also outlines the requirements for the analyst's response, including:

1. **Verdict**: The analyst must declare the image either "real" or "AI-generated", with no option for "inconclusive".
2. **Confidence score**: The analyst must provide an overall authenticity score, using a 0-100 scale.
3. **Analysis summary**: The analyst must provide a brief summary of their analysis, referencing specific objects or regions from the scene context.
4. **Reasoning**: The analyst must provide a direct sentence explaining their verdict, citing the 1-3 most decisive signals that tipped the verdict.
5. **Breakdown**: The analyst must provide an object containing all 26 scores, with each score using a 0-100 scale.
6. **Flagged regions**: The analyst must identify 2-5 suspicious areas, with each region described using a specific category and label.

---

## Disclaimer

Real or AI offers AI-powered analysis as a helpful tool, but results should not be considered definitive proof. AI detection technology is continuously evolving, and no system is 100% accurate. Always use this tool as part of a broader verification strategy and consult multiple sources when determining the authenticity of critical images.

---
