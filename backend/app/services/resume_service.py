import io
import json
from pypdf import PdfReader
from app.llm.nvidia_client import nvidia_client
import logging

logger = logging.getLogger(__name__)

class ResumeService:
    async def analyze_resume(self, file_bytes: bytes, filename: str) -> dict:
        text = ""
        try:
            if filename.lower().endswith('.pdf'):
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            else:
                # Fallback to plain text decoding or throw error for unsupported
                text = file_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            logger.error(f"Failed to parse resume: {e}")
            raise ValueError(f"Could not parse file. Ensure it is a valid PDF. Error: {e}")

        if not text.strip():
            raise ValueError("No text could be extracted from the uploaded resume.")

        # Prepare prompt for LLM
        system_prompt = (
            "You are an expert technical recruiter and Applicant Tracking System (ATS) evaluator. "
            "Analyze the following resume and return a STRICT JSON object containing exactly the following keys: "
            "'ats_score' (an integer from 0 to 100), "
            "'status' (a short string like 'Needs Improvement', 'Good', or 'Excellent'), "
            "'summary' (a 2-3 sentence overall critique of the resume), "
            "'strengths' (a list of 2-3 strings highlighting good points), "
            "'weaknesses' (a list of 2-3 strings highlighting missing keywords, bad formatting, or areas to improve). "
            "DO NOT include any markdown formatting, codeblocks, or extra text. ONLY return raw JSON."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Resume Text:\n{text[:10000]}"} # Limit to 10k chars to avoid token limits
        ]

        try:
            # We use chat() as an async generator, we just need the full response
            response = ""
            async for chunk in nvidia_client.chat(messages, stream=False):
                # The non-streaming chat yields a dict with the JSON response
                if isinstance(chunk, dict) and "choices" in chunk:
                    response = chunk["choices"][0]["message"]["content"]
                elif isinstance(chunk, str):
                    response = chunk
            
            # Clean response if LLM hallucinated markdown code blocks
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
                
            result = json.loads(response.strip())
            return result
        except json.JSONDecodeError as e:
            logger.error(f"LLM did not return valid JSON: {response}")
            raise ValueError("AI analysis failed to produce valid JSON output.")
        except Exception as e:
            logger.error(f"LLM request failed: {e}")
            raise ValueError(f"AI analysis request failed: {e}")

resume_service = ResumeService()
