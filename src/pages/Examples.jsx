import React, { useState, useEffect } from "react";
import { apiClient } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Filter, TrendingUp, AlertCircle, Search, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import ExampleCard from "../components/examples/ExampleCard";

export default function Examples() {
  const [verdictFilter, setVerdictFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [itemsPerPage] = useState(12);
  const [displayedItems, setDisplayedItems] = useState(itemsPerPage);

  // Fetch public examples (all analyses, not filtered by user)
  const { data: allAnalyses = [], isLoading } = useQuery({
    queryKey: ["examples"],
    queryFn: () => apiClient.entities.ImageAnalysis.list("-created_date", 50).catch(() => []),
  });

  // Filter out analyses with no image or summary
  const validExamples = allAnalyses.filter(
    (a) => a.image_url && a.analysis_summary && a.verdict && a.breakdown
  );

  // Filter out inconclusive from display
  const displayExamples = validExamples.filter((a) => a.verdict !== "inconclusive");

  // Apply verdict filter & search
  let filtered = displayExamples.filter(
    (a) => (verdictFilter === "all" || a.verdict === verdictFilter) &&
           (searchQuery === "" || 
            a.analysis_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.filename?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "highest") return b.confidence_score - a.confidence_score;
    if (sortBy === "lowest") return a.confidence_score - b.confidence_score;
    return 0;
  });

  const stats = {
    total: displayExamples.length,
    real: displayExamples.filter((a) => a.verdict === "real").length,
    ai: displayExamples.filter((a) => a.verdict === "ai_generated").length,
  };

  const paginatedItems = filtered.slice(0, displayedItems);
  const hasMore = displayedItems < filtered.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          Learning Examples
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Learn Pattern <span className="text-primary">Recognition</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-base">
          Explore recent analysis examples to understand what makes images authentic or AI-generated.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Total Examples</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{stats.real}</p>
                <p className="text-sm text-muted-foreground mt-1">Real Images</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.ai}</p>
                <p className="text-sm text-muted-foreground mt-1">AI Generated</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by filename or analysis summary..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDisplayedItems(itemsPerPage);
            }}
            className="pl-10 h-11 bg-muted/50 border-0"
          />
        </div>

        {/* Verdict Filter & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={verdictFilter} onValueChange={setVerdictFilter}>
            <SelectTrigger className="w-full sm:w-48 h-10 bg-muted/50 border-0">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Examples</SelectItem>
              <SelectItem value="real">Real Images</SelectItem>
              <SelectItem value="ai_generated">AI Generated</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-muted/50 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="highest">Highest Confidence</SelectItem>
              <SelectItem value="lowest">Lowest Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[500px] rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground mb-1">No examples found</p>
          <p className="text-sm text-muted-foreground">
            {displayExamples.length === 0
              ? "Examples will appear as analyses are shared"
              : "Try a different filter"}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {paginatedItems.map((example, idx) => (
                <motion.div
                  key={example.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ExampleCard example={example} onShare={() => {
                    const text = `Check out this ${example.verdict === 'real' ? 'authentic' : 'AI-generated'} image analysis on VeriLens (${example.confidence_score}% confidence)`;
                    if (navigator.share) {
                      navigator.share({ title: "VeriLens Analysis", text, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
                    }
                  }} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4"
            >
              <Button
                variant="outline"
                onClick={() => setDisplayedItems(prev => prev + itemsPerPage)}
                className="gap-2"
              >
                Load More ({filtered.length - displayedItems} remaining)
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Info Banner */}
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">All examples are anonymized</p>
          <p>No personal information or original metadata is displayed. Examples are shared to help you learn pattern recognition in AI detection.</p>
        </div>
      </div>
    </div>
  );
}
