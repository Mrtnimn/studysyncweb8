import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  BookOpen, 
  Volume2, 
  X, 
  AlertCircle,
  ExternalLink
} from "lucide-react";

interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: Meaning[];
  sourceUrls: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface Definition {
  definition: string;
  example?: string;
  synonyms: string[];
  antonyms: string[];
}

interface DictionaryLookupProps {
  isOpen: boolean;
  onClose: () => void;
  initialWord?: string;
}

export function DictionaryLookup({ isOpen, onClose, initialWord = "" }: DictionaryLookupProps) {
  const [searchWord, setSearchWord] = useState(initialWord);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDictionary = async (word: string) => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
      
      if (!response.ok) {
        throw new Error('Word not found');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setResult(data[0] as DictionaryEntry);
      } else {
        throw new Error('No definition found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch definition');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchDictionary(searchWord);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const playPronunciation = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      data-testid="dictionary-overlay"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl max-h-[90vh] m-4"
      >
        <Card className="shadow-2xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Dictionary Lookup
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-dictionary"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Search Input */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Enter a word to look up..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                data-testid="input-dictionary-search"
              />
              <Button 
                onClick={handleSearch}
                disabled={!searchWord.trim() || isLoading}
                data-testid="button-search-dictionary"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center py-8"
                >
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">{error}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try checking the spelling or search for a different word.
                    </p>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                  data-testid="dictionary-result"
                >
                  {/* Word Header */}
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-gray-800">
                        {result.word}
                      </h2>
                      {result.phonetic && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playPronunciation(result.word)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          data-testid="button-pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-sm font-mono">{result.phonetic}</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Meanings */}
                  <div className="space-y-6">
                    {result.meanings.map((meaning, meaningIndex) => (
                      <div key={meaningIndex} className="space-y-3">
                        <Badge variant="outline" className="mb-3">
                          {meaning.partOfSpeech}
                        </Badge>

                        <div className="space-y-4">
                          {meaning.definitions.map((definition, defIndex) => (
                            <div key={defIndex} className="pl-4 border-l-2 border-gray-200">
                              <p className="text-gray-800 leading-relaxed">
                                <span className="font-medium">{defIndex + 1}.</span> {definition.definition}
                              </p>
                              
                              {definition.example && (
                                <p className="text-gray-600 italic mt-2 text-sm">
                                  <strong>Example:</strong> "{definition.example}"
                                </p>
                              )}
                              
                              {(definition.synonyms.length > 0 || meaning.synonyms.length > 0) && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium text-green-700">Synonyms: </span>
                                  <span className="text-sm text-green-600">
                                    {[...definition.synonyms, ...meaning.synonyms]
                                      .slice(0, 5)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                              
                              {(definition.antonyms.length > 0 || meaning.antonyms.length > 0) && (
                                <div className="mt-1">
                                  <span className="text-sm font-medium text-red-700">Antonyms: </span>
                                  <span className="text-sm text-red-600">
                                    {[...definition.antonyms, ...meaning.antonyms]
                                      .slice(0, 5)
                                      .join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Source */}
                  {result.sourceUrls && result.sourceUrls.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ExternalLink className="w-4 h-4" />
                        <span>Source: </span>
                        <a
                          href={result.sourceUrls[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Free Dictionary API
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}