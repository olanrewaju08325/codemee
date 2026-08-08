"""Provider-agnostic AI Tutor layer (Part 4 scaffolding).

Only the mock provider ships today. A real provider (OpenAI, Anthropic, etc.)
plugs in by subclassing `AIProvider`, registering it in `get_ai_provider`,
and setting `AI_PROVIDER` in the backend .env. No quiz auto-grading engine
or real generation is included in this pass.
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import os
import json
import random

HINT_ONLY_SYSTEM_PROMPT = (
    "You are CodeMe Assistant, a coding tutor inside the CodeMe Academy app. "
    "You guide students toward answers with hints and questions. "
    "CRITICAL RULE: You must ONLY answer questions based on the current lesson context. "
    "If a student asks a general question outside the scope of their provided context, "
    "or asks you to write full solutions for assignments, you must politely REFUSE and "
    "direct them back to the course material. Keep answers short and actionable."
)


def build_system_prompt() -> str:
    """D1 policy: hint-only instruction used for every tutor call."""
    return HINT_ONLY_SYSTEM_PROMPT


class AIProvider(ABC):
    name: str = "base"

    @abstractmethod
    async def ask_tutor(self, message: str, context_code: str) -> str:
        """Return a tutor reply for a student question, respecting the hint-only policy."""

    @abstractmethod
    async def draft_submission_review(self, submission_text: str, assignment_title: str) -> Dict[str, Any]:
        """Return a draft review: {feedback, score, is_ai_flagged, passed}."""

    @abstractmethod
    async def generate_content(self, prompt: str, context_type: str, context_data: Optional[str] = None) -> str:
        """Generate content for teachers/admins based on context type."""


class MockAIProvider(AIProvider):
    """Deterministic local stand-in. Documents the interface and the D1 policy."""
    name = "mock"

    async def ask_tutor(self, message: str, context_code: str) -> str:
        msg = message.lower()

        if "answer" in msg or "solution" in msg or "give me the code" in msg:
            return (
                "I'm here to help you learn, so I can't give you the exact answer. "
                "But I can point you in the right direction! What specific part is confusing you?"
            )

        if "error" in msg or "not working" in msg or "bug" in msg:
            if not context_code.strip():
                return "It looks like your editor is currently empty. Try writing some code first and then ask me if you run into any errors!"
            if "<" in context_code and "/>" not in context_code and "</" not in context_code:
                return "It looks like you might have unclosed HTML tags. Remember that most elements like `<div>` need a matching closing tag `</div>`."
            if "console.log" in context_code and ";" not in context_code:
                return "I see some JavaScript! Don't forget that it's good practice to end your statements with a semicolon `;`."
            return (
                "I'm looking at your code now. A good debugging strategy is to check your terminal output "
                "or use `console.log()` to see what values your variables hold. Can you be more specific about what error you are seeing?"
            )

        if "hint" in msg or "stuck" in msg or "help" in msg:
            return "Sure thing! Break the problem down into smaller steps. Have you tried checking if all your variables are defined properly? If you're writing HTML, ensure your tags are properly nested."

        if "hello" in msg or "hi " in msg or msg == "hi":
            return "Hello there! How can I help you with your code today?"

        return (
            "That's an interesting question. Based on the code you've written, you might want to review "
            "the lesson notes on syntax and logic flow. Let me know if you want a specific hint!"
        )

    async def draft_submission_review(self, submission_text: str, assignment_title: str) -> Dict[str, Any]:
        text = (submission_text or "").strip()
        if not text:
            return {
                "feedback": "No submission text was provided, so I cannot review this project yet.",
                "score": 0,
                "is_ai_flagged": False,
                "passed": False,
            }

        word_count = len(text.split())
        has_structure = any(tag in text for tag in ("<html", "<body", "<header", "<main", "<section"))
        has_semantic = any(tag in text for tag in ("<nav", "<article", "<footer", "aria-", "<form"))
        length_score = min(100, 30 + word_count // 4)
        structure_bonus = 20 if has_structure else 0
        semantic_bonus = 15 if has_semantic else 0
        score = min(100, length_score + structure_bonus + semantic_bonus)

        is_ai_flagged = score >= 85 and word_count > 300 and len(set(text.split())) < word_count * 0.6

        if score >= 66:
            feedback = (
                f"Solid draft! Your submission for '{assignment_title}' has good structure and covers the "
                "core requirements. Review your semantic tags and add descriptive comments to strengthen it further."
            )
        else:
            feedback = (
                f"Good start on '{assignment_title}', but it needs work. Check the assignment brief and make sure "
                "you've included all required sections, then re-submit for another review."
            )

        return {
            "feedback": feedback,
            "score": score,
            "is_ai_flagged": is_ai_flagged,
            "passed": score >= 66,
        }

    async def generate_content(self, prompt: str, context_type: str, context_data: Optional[str] = None) -> str:
        return f"Mock generated {context_type}: {prompt}"


class GroqAIProvider(AIProvider):
    """Real AI provider utilizing the Groq API with round-robin key fallbacks."""
    name = "groq"

    def __init__(self):
        from groq import Groq
        keys_str = os.getenv("GROQ_API_KEYS", "")
        if not keys_str:
            keys_str = os.getenv("GROQ_API_KEY", "")
            
        self.keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        if not self.keys:
            raise ValueError("No Groq API keys found. Set GROQ_API_KEYS.")
        
        self.current_key_idx = 0
        self.client = Groq(api_key=self.keys[self.current_key_idx])
    
    def _rotate_key(self):
        from groq import Groq
        self.current_key_idx = (self.current_key_idx + 1) % len(self.keys)
        self.client = Groq(api_key=self.keys[self.current_key_idx])
        print(f"Switched to Groq API Key #{self.current_key_idx + 1}")

    async def _safe_chat_completion(self, messages, response_format=None):
        import groq
        attempts = 0
        max_attempts = len(self.keys)
        
        while attempts < max_attempts:
            try:
                kwargs = {
                    "model": "llama3-70b-8192",
                    "messages": messages,
                    "temperature": 0.5,
                }
                if response_format:
                    kwargs["response_format"] = {"type": "json_object"}
                    
                response = self.client.chat.completions.create(**kwargs)
                return response.choices[0].message.content
            
            except groq.RateLimitError:
                attempts += 1
                self._rotate_key()
            except groq.APIError as e:
                if "invalid_api_key" in str(e).lower() or e.status_code in (401, 403):
                    attempts += 1
                    self._rotate_key()
                else:
                    raise e
            except Exception as e:
                raise e
                
        raise Exception("All Groq API keys failed or hit rate limits.")

    async def ask_tutor(self, message: str, context_code: str) -> str:
        messages = [
            {"role": "system", "content": build_system_prompt()},
            {"role": "user", "content": f"Context/Current Code:\n```\n{context_code}\n```\n\nStudent Question: {message}"}
        ]
        return await self._safe_chat_completion(messages)

    async def draft_submission_review(self, submission_text: str, assignment_title: str) -> Dict[str, Any]:
        system_prompt = (
            "You are an expert grading assistant. Review the student's submission text for the assignment. "
            "Return a JSON object containing EXACTLY these fields: "
            "'feedback' (string with constructive feedback), "
            "'score' (integer 0-100), "
            "'passed' (boolean, true if score >= 66), "
            "'is_ai_flagged' (boolean, true if submission looks like raw AI generation)."
        )
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Assignment: {assignment_title}\n\nSubmission Text:\n{submission_text}"}
        ]
        
        try:
            content = await self._safe_chat_completion(messages, response_format=True)
            result = json.loads(content)
            return {
                "feedback": str(result.get("feedback", "No feedback provided.")),
                "score": int(result.get("score", 0)),
                "is_ai_flagged": bool(result.get("is_ai_flagged", False)),
                "passed": bool(result.get("passed", False))
            }
        except Exception as e:
            return {
                "feedback": f"Failed to generate AI review. Error: {str(e)}",
                "score": 0,
                "is_ai_flagged": False,
                "passed": False
            }

    async def generate_content(self, prompt: str, context_type: str, context_data: Optional[str] = None) -> str:
        system_prompt = (
            f"You are a helpful academy assistant for CodeMe Academy. Your current task is to help generate content for a {context_type}. "
            "Provide professional, clear, and high-quality output."
        )
        if context_data:
            system_prompt += f"\nContext information: {context_data}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        return await self._safe_chat_completion(messages)


def get_ai_provider(provider_name: Optional[str] = None) -> AIProvider:
    """Factory — returns the configured provider. Unknown names fall back to mock."""
    name = (provider_name or os.getenv("AI_PROVIDER", "mock")).lower()
    if name == "mock":
        return MockAIProvider()
    elif name == "groq":
        return GroqAIProvider()
    return MockAIProvider()
