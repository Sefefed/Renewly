import { useEffect, useMemo, useState } from "react";

const MIN_DELAY = 35;
const MAX_DELAY = 120;
const DEFAULT_DURATION = 4000;

const buildParagraphs = (text) => {
  if (!text) return [];

  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

const buildTokens = (paragraphs) => {
  const tokens = [];

  paragraphs.forEach((paragraph, index) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    words.forEach((word) => {
      tokens.push({ type: "word", value: word, paragraphIndex: index });
    });

    if (index < paragraphs.length - 1) {
      tokens.push({ type: "break" });
    }
  });

  return tokens;
};

const useTypingParagraphs = (text) => {
  const paragraphs = useMemo(() => buildParagraphs(text), [text]);
  const tokens = useMemo(() => buildTokens(paragraphs), [paragraphs]);
  const [displayTokens, setDisplayTokens] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!tokens.length) {
      setDisplayTokens([]);
      setIsTyping(false);
      return undefined;
    }

    setDisplayTokens([tokens[0]]);
    setIsTyping(true);

    let index = 1;
    const totalTokens = tokens.length;
    const delay = Math.max(
      MIN_DELAY,
      Math.min(
        MAX_DELAY,
        Math.round(DEFAULT_DURATION / Math.max(totalTokens, 1))
      )
    );

    const intervalId = setInterval(() => {
      setDisplayTokens((current) => {
        if (index >= totalTokens) {
          clearInterval(intervalId);
          setIsTyping(false);
          return current;
        }

        const nextToken = tokens[index];
        index += 1;
        return [...current, nextToken];
      });
    }, delay);

    return () => {
      clearInterval(intervalId);
    };
  }, [tokens]);

  const displayedParagraphs = useMemo(() => {
    if (!displayTokens.length) {
      return [];
    }

    const sections = [[]];

    displayTokens.forEach((token) => {
      if (token.type === "break") {
        if (sections[sections.length - 1].length) {
          sections.push([]);
        }
        return;
      }

      sections[sections.length - 1].push(token.value);
    });

    return sections
      .filter((section) => section.length > 0)
      .map((section) => section.join(" "));
  }, [displayTokens]);

  return {
    paragraphs,
    displayedParagraphs,
    isTyping,
  };
};

export default useTypingParagraphs;
