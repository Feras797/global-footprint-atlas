"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const cors = require("cors");
const node_fetch_1 = require("node-fetch");
// Initialize CORS middleware
const corsHandler = cors({ origin: true });
/**
 * Firebase Function to proxy Gemini API calls
 * This handles authentication with Google Cloud and forwards requests to Gemini
 */
exports.api = (0, https_1.onRequest)({
    region: "europe-west3",
    memory: "256MiB",
    timeoutSeconds: 60,
}, (request, response) => {
    return corsHandler(request, response, async () => {
        // Only handle POST requests to /api/gemini
        if (request.method !== "POST") {
            response.status(405).json({ error: "Method not allowed" });
            return;
        }
        if (!request.url.includes("/gemini")) {
            response.status(404).json({ error: "Endpoint not found" });
            return;
        }
        try {
            firebase_functions_1.logger.info("🤖 Gemini API request received");
            // Get access token using Application Default Credentials
            // This works automatically in Firebase Functions
            const { GoogleAuth } = require("google-auth-library");
            const auth = new GoogleAuth({
                scopes: ["https://www.googleapis.com/auth/cloud-platform"],
            });
            const accessToken = await auth.getAccessToken();
            firebase_functions_1.logger.info("🔑 Got access token");
            // Make request to Gemini 1.5 Pro
            const geminiUrl = "https://europe-west3-aiplatform.googleapis.com/v1/projects/tum-cdtm25mun-8787/locations/europe-west3/publishers/google/models/gemini-1.5-pro:generateContent";
            const geminiResponse = await (0, node_fetch_1.default)(geminiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request.body),
            });
            firebase_functions_1.logger.info("📡 Made request to Gemini, status:", geminiResponse.status);
            if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                firebase_functions_1.logger.error("❌ Gemini API error:", errorText);
                throw new Error(`Gemini API failed: ${geminiResponse.status} ${geminiResponse.statusText}`);
            }
            const data = await geminiResponse.json();
            firebase_functions_1.logger.info("✅ Got response from Gemini");
            response.json(data);
        }
        catch (error) {
            firebase_functions_1.logger.error("❌ Gemini API error:", error);
            response.status(500).json({
                error: "Failed to call Gemini API",
                details: error instanceof Error ? error.message : "Unknown error",
            });
        }
    });
});
//# sourceMappingURL=index.js.map