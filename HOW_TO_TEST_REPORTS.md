# How to Test AI Report Generation

## Quick Test Steps

### 1. Start the Mock Server
```bash
npm run server:mock
```
This will start a mock Gemini server that returns realistic sample reports without needing Google Cloud credentials.

### 2. Start the Development Server
In a new terminal:
```bash
npm run dev
```

### 3. Navigate to a Company
1. Open http://localhost:8080 in your browser
2. Click on "Companies" in the sidebar
3. Select any company (e.g., "Engie Electrabel" or "Électricité de France SA")

### 4. Run Satellite Analysis (Important!)
**This step is crucial to get the red and green areas data:**

1. In the company page, stay on the **"Satellite Analysis"** tab
2. Click the **"Search Similar Areas"** button
3. Wait for the analysis to complete (you'll see green squares appear on the map)
4. The system will automatically switch to the "Data Visualization" tab when complete

### 5. Generate AI Report
1. Click on the **"AI Reports"** tab
2. You should see:
   - "Operational Areas: 1 areas analyzed" (red box)
   - "Reference Areas: 3 similar areas found" (green box)
3. Select a report type:
   - **Comprehensive**: Full balanced report
   - **Executive Summary**: Short business-focused report
   - **Technical Deep-dive**: Detailed scientific analysis
4. Click **"Generate AI Report"**
5. Wait for the progress bar to complete
6. The PDF should automatically download

## Troubleshooting

### Issue: Only JSON files download, no PDF
**Solution**: This happens when debug mode is accidentally enabled. The debug files now only download when you add `?debug=true` to the URL.

To fix:
1. Make sure you're using the regular URL without debug parameter
2. Clear your browser cache
3. Try generating the report again

### Issue: "No analysis data available" message
**Solution**: You must run the satellite analysis first!
1. Go back to "Satellite Analysis" tab
2. Click "Search Similar Areas"
3. Wait for completion
4. Then try generating the report

### Issue: PDF generation fails
Check the browser console for errors:
- Press F12 to open Developer Tools
- Go to Console tab
- Look for error messages
- Common issues:
  - jsPDF not loaded (refresh the page)
  - Mock server not running (check terminal)
  - CORS errors (make sure both servers are running)

### Issue: Mock server connection refused
Make sure the mock server is running on port 3001:
```bash
# Check if server is running
ps aux | grep "node.*server" | grep -v grep

# If not running, start it:
npm run server:mock
```

## Understanding the Data Flow

1. **Satellite Analysis** generates:
   - Red areas: Operational zones (company locations)
   - Green areas: Environmentally similar reference regions

2. **Report Generation** uses this data to:
   - Compare environmental metrics
   - Generate AI insights using Gemini
   - Create a professional PDF report

3. **PDF Creation**:
   - The mock server returns sample Gemini responses
   - The client generates a PDF with charts and analysis
   - The PDF is automatically downloaded to your Downloads folder

## Debug Mode

To enable debug mode and see the raw data being processed:
1. Add `?debug=true` to the URL
2. Example: `http://localhost:8080/company/mock-5?debug=true`
3. This will download JSON debug files showing:
   - Request sent to Gemini
   - Response received
   - Final processed result

## Expected Output

When successful, you should see:
1. Progress bar reaching 100%
2. "Report Generated Successfully" card appearing
3. PDF automatically downloading with filename like:
   - `Engie_Electrabel_Environmental_Report_2025-01-09.pdf`

The PDF should contain:
- Executive Summary
- Environmental metrics comparison
- Charts showing NDVI, NDWI, elevation
- Detailed analysis based on report type
- Recommendations and conclusions

## Testing Different Report Types

### Executive Summary (2-3 pages)
- Business-focused language
- Key findings only
- Strategic recommendations

### Technical Deep-Dive (10-15 pages)  
- Scientific methodology
- Statistical analysis
- Detailed formulas and calculations

### Comprehensive (5-8 pages)
- Balanced technical and business content
- Full environmental assessment
- Suitable for most use cases
