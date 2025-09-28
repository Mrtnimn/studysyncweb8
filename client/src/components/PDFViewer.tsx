import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  Maximize2,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";

// Set up PDF.js worker with locked version for security
// Using specific version to prevent supply-chain attacks
const PDF_JS_VERSION = "3.11.174"; // Lock to specific version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDF_JS_VERSION}/pdf.worker.min.js`;

interface PDFViewerProps {
  file: File;
  onClose?: () => void;
  className?: string;
}

interface PDFViewerState {
  numPages: number | null;
  pageNumber: number;
  scale: number;
  rotation: number;
}

export function PDFViewer({ file, onClose, className = "" }: PDFViewerProps) {
  const [state, setState] = useState<PDFViewerState>({
    numPages: null,
    pageNumber: 1,
    scale: 1.2,
    rotation: 0
  });
  const [pageInputValue, setPageInputValue] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setState(prev => ({ ...prev, numPages }));
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = () => {
    setError("Failed to load PDF. Please try another file.");
    setIsLoading(false);
  };

  const changePage = (offset: number) => {
    setState(prev => ({
      ...prev,
      pageNumber: Math.max(1, Math.min(prev.pageNumber + offset, prev.numPages || 1))
    }));
  };

  const goToPage = () => {
    const page = parseInt(pageInputValue);
    if (page && page > 0 && page <= (state.numPages || 1)) {
      setState(prev => ({ ...prev, pageNumber: page }));
    }
    setPageInputValue(state.pageNumber.toString());
  };

  const changeScale = (scaleDelta: number) => {
    setState(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(prev.scale + scaleDelta, 3.0))
    }));
  };

  const rotate = () => {
    setState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  };

  const downloadFile = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`flex flex-col h-full ${className}`} data-testid="pdf-viewer">
      <CardHeader className="py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg truncate max-w-[200px]" title={file.name}>
              {file.name}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-pdf">
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Controls */}
        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(-1)}
              disabled={state.pageNumber <= 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={pageInputValue}
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={goToPage}
                onKeyDown={(e) => e.key === 'Enter' && goToPage()}
                className="w-16 h-8 text-center"
                min="1"
                max={state.numPages || 1}
                data-testid="input-page-number"
              />
              <span className="text-sm text-gray-600">
                / {state.numPages || 0}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => changePage(1)}
              disabled={state.pageNumber >= (state.numPages || 1)}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeScale(-0.2)}
              disabled={state.scale <= 0.5}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Badge variant="outline" className="mx-1">
              {Math.round(state.scale * 100)}%
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => changeScale(0.2)}
              disabled={state.scale >= 3.0}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={rotate}
              data-testid="button-rotate"
            >
              <RotateCw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadFile}
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
              />
              <span className="ml-3 text-gray-600">Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="flex justify-center p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="shadow-lg"
              >
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                >
                  <Page
                    pageNumber={state.pageNumber}
                    scale={state.scale}
                    rotate={state.rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </Document>
              </motion.div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}