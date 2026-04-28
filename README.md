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



**Modules and Structure**
=====================================================


The codebase is organized into several modules, each responsible for specific aspects of the application. Here's a breakdown of the key components:

### **src/api/**
- **[client.js](src/api/client.js)**: Manages API requests and responses. This module handles communication with external services.

### **src/lib/**
- **[AuthContext.jsx](src/lib/AuthContext.jsx)**: Provides authentication context for managing user sessions and access control across the application.
- **[PageNotFound.jsx](src/lib/PageNotFound.jsx)**: Displays a custom 404 page when users attempt to navigate to a non-existent route.
- **[ThemeContext.jsx](src/lib/ThemeContext.jsx)**: Manages theme settings, allowing users to switch between light and dark modes seamlessly.
- **[analysisLogger.js](src/lib/analysisLogger.js)**: Logs analysis activities for debugging and auditing purposes. This helps in tracking the flow of data and identifying potential issues.
- **[app-params.js](src/lib/app-params.js)**: Contains application-wide parameters that can be accessed across different modules, ensuring consistency.
- **[localStore.js](src/lib/localStore.js)**: Interfaces with local storage to save user settings or temporary data without relying on a server.
- **[pdfReport.js](src/lib/pdfReport.js)**: Generates PDF reports based on analysis results. This module is crucial for exporting findings in a standard format.
- **[query-client.js](src/lib/query-client.js)**: Manages query caching and optimization, improving the performance of data retrieval operations.
- **[utils.js](src/lib/utils.js)**: A collection of utility functions used throughout the application, covering various tasks like date formatting, string manipulation, etc.

### **src/pages/**
- **[About.jsx](src/pages/About.jsx)**: Displays information about the application, its features, and possibly credits to contributors.
- **[Admin.jsx](src/pages/Admin.jsx)**: Provides administrative functionalities, such as managing user permissions or system settings. This module is typically accessible only to authorized users.
- **[AnalysisLogs.jsx](src/pages/AnalysisLogs.jsx)**: Shows logs of previous analyses, helping users review past work and track progress.
- **[BrowserPlugin.jsx](src/pages/BrowserPlugin.jsx)**: Manages interactions with browser plugins, enhancing the application's capabilities by integrating external tools.
- **[Compare.jsx](src/pages/Compare.jsx)**: Allows users to compare different analysis results side-by-side, aiding in detailed examination and decision-making.
- **[Examples.jsx](src/pages/Examples.jsx)**: Demonstrates various use cases or provides sample data for users to explore and understand the application better.
- **[History.jsx](src/pages/History.jsx)**: Keeps a record of user activities within the application, offering insights into past interactions.
- **[Home.jsx](src/pages/Home.jsx)**: Serves as the landing page, providing an overview of available features and navigation options.
- **[Settings.jsx](src/pages/Settings.jsx)**: Manages user settings, allowing customization of preferences such as notifications, display settings, etc.

---


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

Real or AI employs sophisticated visual forensics techniques to examine images in depth. By analyzing multiple aspects of the image, it identifies patterns that are often invisible to the human eye.

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

- **`target`**: The URL of the model server where the requests should be forwarded. In this case, it is set to `http://localhost:11434`. You may need to update this URL if your model server is hosted on a different machine or port.

- **`changeOrigin`**: When set to `true`, this option changes the origin of the request to match the target URL. This is often necessary to bypass CORS restrictions on the server side.

- **`rewrite`**: This function rewrites the path of the request before it is sent to the target server. In this case, it removes the `/proxy` prefix from the path, so that the model server receives requests in the expected format.

## Important Notes

- **Development Only**: This proxy setup is intended for use during local development. For production environments, you may need a different approach to handle CORS issues, such as configuring the server-side CORS headers or using a dedicated backend proxy.

- **Security Considerations**: Ensure that the target URL (`http://localhost:11434` in this example) is secure and accessible only within your internal network. Exposing sensitive APIs to external networks can pose security risks.


---

## Note:

- Replace `http://localhost:11434` with the actual URL of your Ollama API.


---

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


## Developer Content

### Images Directory Structure

The following images are organized under the `images` directory. Each image has been described with its purpose and location within the directory structure.

#### 1. Console Testing Single Image

[![Console Testing Single Image](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/console-testing-single-image.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/console-testing-single-image.png)

[![Image Result Overview](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/image-result-overview.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/image-result-overview.png)

[![Landing Page Image](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/landing.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/landing.png)

The main landing page image used for the project's homepage. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/landing.png)

#### 2. Test Directory

The `test` directory contains several test-related images.

##### 2.1 Fucked-Up Logo

[![Fucked-Up Logo](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/broken-logo.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/broken-logo.png)

A logo that appears to be broken or corrupted. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/broken-logo.png)

##### 2.2 Real 001 Photoshoot Text on Wall

[![Real 001 Photoshoot Text on Wall](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/real-001-photoshoot-text-on-wall.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/real-001-photoshoot-text-on-wall.png)

A photograph of a real shoot with text on the wall. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/real-001-photoshoot-text-on-wall.png)

##### 2.3 Trump Walker Gemini AI WebP

[![Trump Walker Gemini AI WebP](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/trump_walker_gemini_ai.webp?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/trump_walker_gemini_ai.webp)

An image featuring Trump, Walker, and Gemini AI in a web format. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/trump_walker_gemini_ai.webp)

##### 2.4 Logo

[![Logo](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/logo.png?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/logo.png)

The main logo used across the project. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/logo.png)

##### 2.5 Screenshot of Landscape Monoglype Photo

[![Screenshot of Landscape Monoglype Photo](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/screenshot-of-landacape-monoglype-photo.jpeg?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/screenshot-of-landacape-monoglype-photo.jpeg)

A screenshot of a landscape photo featuring monoglype imagery. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/screenshot-of-landacape-monoglype-photo.jpeg)

##### 2.6 Crude Trump AI Portrait

[![Crude Trump AI Portrait](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/crude-trump-ai-portrait.jpg?w=200)](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/crude-trump-ai-portrait.jpg)

An image of a crude portrait of Donald Trump using AI. [View full resolution](https://raw.githubusercontent.com/santenova/is-it-real-or-ai/refs/heads/main/images/test/crude-trump-ai-portrait.jpg)

## Disclaimer

Real or AI offers AI-powered analysis as a helpful tool, but results should not be considered definitive proof. AI detection technology is continuously evolving, and no system is 100% accurate. Always verify findings with additional sources when making important decisions.

---
