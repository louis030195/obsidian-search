/* eslint-disable require-jsdoc */
import {Notice} from "obsidian";
import {readVault} from "obsidian-vault-parser";


export interface SearchResponse {
	fileName: string;
	filePath: string;
	score?: number;
	content?: string;
}
export interface Api {
	search(query: string): Promise<SearchResponse[]>;
}
const VAULT_PATH = "/Users/louisbeaumont/Documents/brain";


export class FakeApi implements Api {
  async search(
      _: string,
  ): Promise<SearchResponse[]> {
    const vault = await readVault(VAULT_PATH);
    return Object.entries(vault.files).map(
        ([fileName, page]) => ({
          fileName: fileName,
          filePath: page.path,
        }))
    // only take random 5
        .shuffle()
        .slice(0, 5);
  }
}

export class ClipRetrievalApi implements Api {
  async search(
      query: string,
  ): Promise<SearchResponse[]> {
    const params: { [key: string]: string | number } = {
      text: query,
      modality: "text",
      num_images: 4,
      indice_name: "example_index",
    };

    let res: Response;
    try {
      res = await fetch("http://localhost:1234/knn-service", {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
    } catch (e) {
      new Notice("Request to search API failed. " +
      "Please check your connection and API URL", 5000);
      return Promise.reject(e);
    }

    if (!res.ok) {
      new Notice(`request to search API failed\n${res.statusText}`, 5000);
      return Promise.reject(
          new Error(`unexpected status ${res.status}, see network tab`));
    }

    let ret: SearchResponse[] = [];
    try {
      const r = await res.json();
      const results = await Promise.all(r.map((e: any) => {
        const d = {
          indice_name: "example_index",
          ids: [e.id],
        };
        return fetch("http://localhost:1234/metadata", {
          method: "POST",
          body: JSON.stringify(d),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        })
            .then((r) => r.json())
            .then((metadata) => {
              const fileUrlSplitted =
                metadata[0].metadata.caption_url.split("/");
              return {
                // remove first element
                filePath: fileUrlSplitted.slice(1).join("/"),
                fileName: fileUrlSplitted.pop(),
              };
            });
      }));
      // @ts-ignore
      ret = results;
    } catch (e) {
      new Notice("Error processing response from API", 5000);
      return Promise.reject(e);
    }

    return ret;
  }
}


export class JinaApi implements Api {
  async search(
      query: string,
  ): Promise<SearchResponse[]> {
    const params: { [key: string]: string | number } = {
      text: query,
      modality: "text",
      num_images: 4,
      indice_name: "example_index",
    };

    let res: Response;
    try {
      res = await fetch("http://localhost:1234/knn-service", {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });
    } catch (e) {
      new Notice("Request to search API failed. " +
      "Please check your connection and API URL", 5000);
      return Promise.reject(e);
    }

    if (!res.ok) {
      new Notice(`request to search API failed\n${res.statusText}`, 5000);
      return Promise.reject(
          new Error(`unexpected status ${res.status}, see network tab`));
    }

    let ret: SearchResponse[] = [];
    try {
      const r = await res.json();
      const results = await Promise.all(r.map((e: any) => {
        const d = {
          indice_name: "example_index",
          ids: [e.id],
        };
        return fetch("http://localhost:1234/metadata", {
          method: "POST",
          body: JSON.stringify(d),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        })
            .then((r) => r.json())
            .then((metadata) => {
              const fileUrlSplitted =
                metadata[0].metadata.caption_url.split("/");
              return {
                // remove first element
                filePath: fileUrlSplitted.slice(1).join("/"),
                fileName: fileUrlSplitted.pop(),
              };
            });
      }));
      // @ts-ignore
      ret = results;
    } catch (e) {
      new Notice("Error processing response from API", 5000);
      return Promise.reject(e);
    }

    return ret;
  }
}


/**
{
  "query": "reinforcement learning",
  "similarities": [
    {
      "score": 0.9303182363510132,
      "file_name": "Bellman Equation",
      "file_path": "Bellman Equation",
      "file_content": "File:\nBellman Equation\n\nContent:\n# ai\n\n# computing\n\n# reinforcement-learning\n"
    },
  ]
}
 */
interface SentenceTransformersApiResponse {
	query: string;
	similarities: {
		score: number;
		file_name: string;
		file_path: string;
		file_content: string;
	}[];
}
/**
curl -X POST -H "Content-Type: application/json" -d '{"query": "reinforcement learning"}' http://localhost:3000/semantic_search | jq '.'
 */
export class SentenceTransformersApi implements Api {
  async search(
      query: string,
  ): Promise<SearchResponse[]> {
    const data = {
      query: query,
    };

    try {
      const response = await fetch("http://localhost:3000/semantic_search", {
        headers: {"Content-Type": "application/json"},
        method: "POST",
        mode: "cors",
        body: JSON.stringify(data),
      });
      const res: SentenceTransformersApiResponse = await response.json();
      const similarities = res["similarities"];
      return similarities.map((e) => ({
        filePath: e.file_path,
        fileName: e.file_name,
        score: e.score,
        content: e.file_content,
      }));
    } catch (e) {
      new Notice("Error processing response from API", 5000);
      return Promise.reject(e);
    }
  }
}
