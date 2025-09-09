# Mock Analysis Server

This is a local mock server that simulates the environmental analysis API for development purposes.

## What it does

- Receives POST requests with red box coordinates (company operational areas)
- Returns green box coordinates (environmentally similar areas) in the same format as the real API
- Generates exactly 3 similar areas: Gold, Silver, Bronze with different similarity scores
- All green boxes have the same dimensions as the input red box
- Green boxes are positioned at reasonable distances from the red box (different cities/regions)

## Usage

### Starting the server

```bash
# Start only the mock server
npm run mock-server

# Start everything (main app + gemini proxy + mock server)
npm run dev:with-mock
```

The mock server runs on **port 3002** (different from the main Gemini proxy server on 3001).

### Endpoints

- `POST /analyze-area` - Main analysis endpoint
  - Accepts: `{"coordinates": [tlx, tly, brx, bry]}`
  - Returns: Array of similar areas in API format
  - Processing time: 800-1200ms (simulated)

- `GET /health` - Health check endpoint
  - Returns: `{"status": "ok", "message": "Mock analysis server is running"}`

### Testing manually

```bash
# Test with sample coordinates
curl -X POST http://localhost:3002/analyze-area \
  -H "Content-Type: application/json" \
  -d '{"coordinates": [7.0, 51.0, 7.2, 51.1]}'

# Health check
curl http://localhost:3002/health
```

## Response Format

The mock server returns data in the exact same format as the real API:

```json
[
  {
    "geometry": {
      "xg": null,
      "args": null,
      "ol": null,
      "la": null,
      "rm": "Polygon",
      "ja": [[[lng, lat], [lng, lat], [lng, lat], [lng, lat], [lng, lat]]],
      "da": null
    },
    "similarity": 0.8576694346485472,
    "position": 2,
    "rank": 1,
    "name": "Gold"
  },
  // ... Silver and Bronze entries
]
```

## Integration

The frontend (`CompanyAnalysisMap.tsx`) is already configured to use this mock endpoint:

```typescript
const ANALYSIS_API_ENDPOINT = 'http://localhost:3002/analyze-area';
```

## Notes

- Green boxes are randomly positioned but consistently sized
- Each request generates new random positions for variety
- Processing delay is simulated for realistic testing
- CORS is enabled for localhost:8080 (Vite dev server)
- All boxes maintain the same size as the input red box
