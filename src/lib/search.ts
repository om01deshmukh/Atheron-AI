import * as DDG from "duck-duck-scrape";

export interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
        const results = await DDG.search(query, {
            safeSearch: DDG.SafeSearchType.MODERATE,
        });

        if (!results.results || results.results.length === 0) {
            return [];
        }

        return results.results.slice(0, maxResults).map((result) => ({
            title: result.title || "",
            url: result.url || "",
            description: result.description || "",
        }));
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}

export async function searchPapers(query: string): Promise<SearchResult[]> {
    // Search specifically for academic papers
    const academicQuery = `${query} research paper site:arxiv.org OR site:pubmed.ncbi.nlm.nih.gov OR site:scholar.google.com OR site:nature.com OR site:science.org`;
    return searchWeb(academicQuery, 5);
}
