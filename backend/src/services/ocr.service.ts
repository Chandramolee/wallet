
import axios from "axios";
import { Env } from "../config/env.config";

export const extractTextFromImageUrl = async (imageUrl: string) => {
    try {
        const params = new URLSearchParams();
        params.append("url", imageUrl);
        params.append("language", "eng");
        params.append("isOverlayRequired", "false");
        params.append("apikey", Env.OCR_SPACE_API_KEY as string);
        params.append("OCREngine", "2"); // Engine 2 for better accuracy (especially numbers)

        const response = await axios.post(
            "https://api.ocr.space/parse/image",
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (response.data.IsErroredOnProcessing) {
            // IsErroredOnProcessing is true if there was an error
            // ErrorMessage is an array of strings
            throw new Error(response.data.ErrorMessage?.[0] || "OCR processing error");
        }

        const parsedResults = response.data.ParsedResults;
        if (!parsedResults || !Array.isArray(parsedResults) || parsedResults.length === 0) {
            // This happens if OCR failed to find text but didn't error out
            throw new Error("No text found in the image/pdf");
        }

        const text = parsedResults
            .map((result: any) => result.ParsedText)
            .join("\n");

        return text.trim();
    } catch (error: any) {
        console.error("OCR Service Error:", error.message || error);
        // If OCR fails, we throw so the controller/service can handle it (maybe propagate or ignore)
        throw new Error(`OCR processing failed: ${error.message}`);
    }
};
