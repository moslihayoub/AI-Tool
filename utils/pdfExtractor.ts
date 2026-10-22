import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL for browser execution
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

/**
 * Extracts clean text from a PDF file directly in the client browser (0 tokens, fast local execution).
 */
export async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            useSystemFonts: true,
            disableFontFace: true,
        });
        const pdfDoc = await loadingTask.promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => ('str' in item ? item.str : ''))
                .join(' ');
            fullText += pageText + '\n';
        }

        // Clean redundant whitespace and extra line breaks
        const cleaned = fullText
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        return cleaned;
    } catch (error) {
        console.warn('[PDF.js] Text extraction failed or file has no text layer, will fallback to vision:', error);
        return '';
    }
}
