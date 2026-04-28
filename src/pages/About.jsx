import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import {
  Sparkles,
  Eye,
  BarChart3,
  Shield,
  Lightbulb,
  Layers,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Visual Forensics",
    description:
      "Examines texture consistency, lighting plausibility, and edge sharpness to detect AI manipulation patterns invisible to the human eye.",
  },
  {
    icon: BarChart3,
    title: "26-Point Scoring",
    description:
      "Each image is scored across 26 forensic dimensions including noise patterns, color distribution, depth of field, shadow analysis, artifact detection, watermark integrity, and AI fingerprinting for a comprehensive assessment.",
  },
  {
    icon: Layers,
    title: "Multi-Source Input",
    description:
      "Analyze images by uploading files directly or pasting URLs. Both methods receive the same thorough analysis pipeline.",
  },
  {
    icon: Shield,
    title: "History Tracking",
    description:
      "Every analysis is saved to your personal history, allowing you to review past results, track patterns, and compare findings.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get analysis results in seconds powered by advanced AI vision models that evaluate images with forensic-level detail.",
  },
  {
    icon: Lightbulb,
    title: "Educational Insights",
    description:
      "Learn what makes an image look real or AI-generated through detailed summaries that explain the reasoning behind each verdict.",
  },
];

const scoringCriteria = [
  { name: "Texture Consistency", description: "Evaluates whether textures across the image are natural and consistent, or show signs of AI smoothing/repetition." },
  { name: "Lighting Analysis", description: "Checks if light sources and reflections are physically plausible and consistent throughout the scene." },
  { name: "Edge Detection", description: "Analyzes edge quality for unnatural softness or sharpness that AI generators often produce." },
  { name: "Noise Pattern", description: "Examines sensor noise patterns — real cameras produce characteristic noise that AI models struggle to replicate." },
  { name: "Facial Analysis", description: "When faces are present, checks for anomalies like asymmetry, earring mismatches, or uncanny features. Scores 50 if no faces present." },
  { name: "Metadata Integrity", description: "Evaluates visual clues about image origin, compression artifacts, and authenticity markers." },
  { name: "Color Distribution", description: "Analyzes color histograms and gradients for unnatural uniformity or impossible color combinations." },
  { name: "Artifact Detection", description: "Scans for telltale AI artifacts: malformed text, extra fingers, seamlines, or impossible geometry." },
  { name: "Shading Analysis", description: "Checks whether shading is consistent with the lighting conditions and the form of objects in the scene." },
  { name: "Depth of Field", description: "Evaluates whether depth-of-field blur is realistic and physically consistent with the implied focal length." },
  { name: "Motion Blur", description: "Checks if motion blur aligns with the implied movement direction and speed of subjects in the frame." },
  { name: "Background Consistency", description: "Assesses whether the background matches the foreground in lighting, perspective, and style." },
  { name: "Shadow Analysis", description: "Verifies that shadows are cast in the correct direction and at the right intensity relative to light sources." },
  { name: "Perspective Correctness", description: "Checks for realistic perspective with consistent vanishing points and proportions throughout the image." },
  { name: "Compression Artifacts", description: "Detects suspicious JPEG blockiness or compression patterns inconsistent with natural camera output." },
  { name: "Image Text Indication", description: "Scores 100 if no text present; penalizes heavily for illogical, garbled, or AI-generated text artifacts." },
  { name: "Contents Reality", description: "Evaluates whether the overall image content and scenario is physically plausible and reflects reality." },
  { name: "AI Fingerprint / Watermark", description: "Detects known AI model signatures, GAN/diffusion frequency anomalies, spectral peaks, or embedded watermarks typical of generative models." },
  { name: "Clone / Repeated Elements", description: "Identifies copy-pasted or near-identical patches appearing in unexpected locations — a common artifact of inpainting and diffusion models." },
  { name: "Scale & Proportion", description: "Checks that all objects are correctly sized relative to each other and the scene; unrealistic proportions are a strong AI indicator." },
  { name: "Optical Anomalies & Reflections", description: "Verifies that reflections, lens flares, and optical distortions are physically plausible and geometrically consistent." },
  { name: "EXIF Manipulation", description: "Checks EXIF/metadata fields for signs of tampering: inconsistent timestamps, missing camera model, or GPS mismatches." },
  { name: "Semantic Consistency", description: "Evaluates whether all scene elements make logical sense together — weather, environment, object placement, and context." },
  { name: "Internet Presence", description: "Cross-references the image against the web. High score if found on credible news or official sources; low if found only on AI art platforms or nowhere." },
  { name: "Watermark Integrity", description: "Runs a dedicated scan for C2PA metadata, SynthID signals, steganographic watermarks, and frequency-domain anomalies from AI generators." },
  { name: "Image Description Analysis", description: "Scores based solely on the scene description from Pass 1: plausible real-world scenes score high; surreal, hyper-perfect, or AI-typical compositions score low." },
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full border-0 shadow-md shadow-black/3 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group">
        <CardContent className="p-6 space-y-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <feature.icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feature.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function About() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          About Real or AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          How It{" "}
          <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Works
          </span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
          Real or AI uses advanced AI vision analysis to examine images across multiple
          forensic dimensions, helping you determine whether an image was captured by
          a real camera or generated by artificial intelligence.
        </p>
      </motion.div>

      {/* Features grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <FeatureCard key={feature.title} feature={feature} index={idx} />
          ))}
        </div>
      </div>

      {/* Scoring system */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-3 mb-8"
        >
          <h2 className="text-2xl font-bold">The 26-Point Scoring System</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Each image is evaluated on these 26 criteria, scored individually from 0 to 100.
            Higher scores indicate stronger signs of authenticity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scoringCriteria.map((criteria, idx) => (
            <motion.div
              key={criteria.name}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{criteria.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {criteria.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Disclaimer</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Real or AI provides AI-powered analysis as a helpful tool, but results should
                not be considered definitive proof. AI detection technology is continuously
                evolving, and no system is 100% accurate. Always use critical thinking and
                consider multiple factors when evaluating image authenticity.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Browser Plugin */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">Browser Extension</h3>
                </div>
                <h2 className="text-3xl font-bold">Analyze on the Go</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Install the Real or AI browser plugin to analyze any image you encounter on the web. Right-click on images and get instant forensic analysis without leaving your browser.
                </p>
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium text-foreground">Available for:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-white/60 text-sm font-medium text-foreground border border-border/50">Chrome</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/60 text-sm font-medium text-foreground border border-border/50">Firefox</span>
                    <span className="px-3 py-1.5 rounded-full bg-white/60 text-sm font-medium text-foreground border border-border/50">Edge</span>
                  </div>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 w-fit"
                >
                  <Download className="w-4 h-4" />
                  Download Extension
                </a>
              </div>
              <div className="flex-shrink-0 w-full lg:w-auto">
                <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Download className="w-16 h-16 text-slate-400 mx-auto" />
                    <p className="text-sm text-slate-500 font-medium">Plugin Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <div className="pb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Tips for Best Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "Use the highest resolution image available for more accurate analysis.",
            "Upload original files when possible — screenshots lose forensic data.",
            "AI artifacts are often most visible in hands, text, and background details.",
          ].map((tip, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * idx }}
            >
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-4 flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
