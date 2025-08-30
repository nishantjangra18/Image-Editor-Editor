import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const editImage = async (
    base64ImageData: string,
    mimeType: string,
    prompt: string,
    width?: number,
    height?: number
): Promise<string> => {
    try {
        let instruction = `You are an expert image editor. Your task is to modify the provided image.`;

        if (prompt) {
            instruction += ` The user's primary instruction is: "${prompt}".`;
        }
    
        if (width && height) {
            instruction += ` Critically, you must ensure the final output image has a resolution of exactly ${width}x${height} pixels.`;
        }

        instruction += ` To achieve the desired result, you may need to expand the canvas (generative outpainting), crop, shrink, or otherwise alter the resolution. You must contextually fill any new areas to perfectly match the original image's style, lighting, and quality. If cropping or shrinking, you should intelligently select the most important part of the image to keep. It is essential that you generate a new, altered image and DO NOT return the original. The final image should be a seamless, high-quality composition.`;
        
        const fullPrompt = instruction;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: fullPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.promptFeedback?.blockReason) {
            const reason = response.promptFeedback.blockReason.replace(/_/g, " ").toLowerCase();
            throw new Error(`Your request was blocked for safety reasons: ${reason}. Please modify your prompt and try again.`);
        }

        const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

        if (imagePart?.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
        
        const textResponse = response.text?.trim();
        if (textResponse) {
             throw new Error(`The AI didn't return an image. It said: "${textResponse}"`);
        }

        throw new Error("The AI failed to generate an image. Please try rephrasing your prompt or try again.");

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        }
        throw new Error("An unknown error occurred while editing the image.");
    }
};

export const generateImage = async (
    prompt: string,
    aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
): Promise<string> => {
    try {
        if (!prompt) {
            throw new Error("Prompt cannot be empty.");
        }

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        
        // Fix: The `GenerateImagesResponse` type does not have a `promptFeedback` property.
        // If the API call fails (e.g., due to a safety block), it will throw an error
        // which is handled by the catch block. If it succeeds but returns no images,
        // we throw a generic error.
        throw new Error("The AI failed to generate an image. Please try a different prompt.");

    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        if (error instanceof Error) {
            throw new Error(`${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the image.");
    }
};
