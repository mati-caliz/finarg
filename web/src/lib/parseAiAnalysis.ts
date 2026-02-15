interface ParsedAnalysis {
  cleanSummary: string;
  keyPoints: string[];
}

export function parseAiAnalysis(rawAnalysis: string | null): ParsedAnalysis {
  if (!rawAnalysis) {
    return {
      cleanSummary: "",
      keyPoints: [],
    };
  }

  const sentimentPattern = /\*\*SENTIMIENTO:\*\*/i;
  const keyPointsPattern = /\*\*PUNTOS_CLAVE:\*\*/i;

  const parts = rawAnalysis.split(sentimentPattern);
  const cleanSummary = parts[0]?.trim() || "";

  const keyPointsMatch = rawAnalysis.match(keyPointsPattern);
  const keyPoints: string[] = [];

  if (keyPointsMatch) {
    const keyPointsSection = rawAnalysis.split(keyPointsPattern)[1];
    if (keyPointsSection) {
      const lines = keyPointsSection.split("\n");
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("*") || trimmedLine.startsWith("-")) {
          const point = trimmedLine.replace(/^[*\-]\s*/, "").trim();
          if (point && point.length > 10) {
            keyPoints.push(point);
          }
        }
      }
    }
  }

  return {
    cleanSummary,
    keyPoints,
  };
}
