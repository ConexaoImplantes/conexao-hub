
# Fix: Google Drive Links for PDF and Image Materials

## Problem
When a user saves a Google Drive sharing link (e.g. `https://drive.google.com/file/d/XXX/view?usp=sharing`) for a PDF or image material, it doesn't display because:

- **Images**: The `<img src="...">` tag receives the sharing page URL, not a direct image URL
- **PDFs**: The `<iframe src="...">` tag receives the sharing page URL instead of the embeddable preview URL

The Google Drive ID extraction logic already exists in `ViewerModal.tsx` (line 42-52) but is only used for the video path.

## Solution
Modify `ViewerModal.tsx` to detect Google Drive links **before** rendering PDFs and images, converting them to the correct format:

- **Images**: Convert to `https://drive.google.com/uc?export=view&id=FILE_ID`
- **PDFs**: Convert to `https://drive.google.com/file/d/FILE_ID/preview`

## Technical Changes

### File: `src/components/hub/ViewerModal.tsx`

1. Move the `getEmbedConfig` function call **above** the render logic (already done at line 63)
2. Update the **image rendering block** (line 116-121):
   - Check if the URL is a Google Drive link
   - If yes, use `https://drive.google.com/uc?export=view&id=FILE_ID` instead of `asset.url`

3. Update the **PDF rendering block** (line 123-128):
   - Check if the URL is a Google Drive link
   - If yes, use `https://drive.google.com/file/d/FILE_ID/preview` instead of `asset.url`

4. Create a helper function `getResolvedUrl(url, type)` that:
   - Extracts the Google Drive file ID from the URL (reusing existing regex)
   - Returns the appropriate URL format based on material type
   - Falls through to the original URL for non-Drive links

### File: `src/components/hub/MaterialFormModal.tsx`
No changes needed -- the form already saves the URL as-is, which is fine. The conversion happens at display time.

## Expected Result
- PDF links from Google Drive will render in the embedded viewer
- Image links from Google Drive will display correctly in the `<img>` tag
- Video links continue working as before (no regression)
- Non-Google-Drive URLs continue working unchanged
