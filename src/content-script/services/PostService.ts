import { postImportWaivio } from '../helpers/downloadWaivioHelper';
import { copyContent } from '../helpers/commonHelper';
import { createObjectForPost } from '../helpers/objectHelper';
import { getDraftBodyTitleTags } from '../helpers/draftHelper';
import { extractPostInfo } from '../helpers/postHelper';
import { createAnalysisVideoPromptBySource } from '../helpers/promptHelper';
import { videoAnalysesByLink } from '../helpers/gptHelper';

export interface PostData {
  title: string;
  body: string;
  host: string;
  tags: string[];
}

export interface ObjectForPost {
  name: string;
  permlink: string;
}

export class PostService {
  static async publishPost(postData: PostData): Promise<void> {
    await postImportWaivio(postData);
  }

  static async copyContent(content: string): Promise<void> {
    await copyContent(content);
  }

  static async createObjectForPost(body: string): Promise<ObjectForPost | null> {
    const result = await createObjectForPost(body);
    return result || null;
  }

  static async refreshDraft(source: string, currentBody: string): Promise<{ body: string; tags: string[] } | null> {
    let bodyFromEditor = currentBody;
    const videoData = await extractPostInfo(source || '');
    if (videoData) {
      bodyFromEditor = `${videoData.title}${videoData.body} ${bodyFromEditor}`;
    }

    return getDraftBodyTitleTags(source, bodyFromEditor);
  }

  static async analyzeVideo(source: string): Promise<string | null> {
    const prompt = createAnalysisVideoPromptBySource(source, '');
    const response = await videoAnalysesByLink(prompt, document.URL);

    if (!response.result) {
      throw new Error('Failed to upload the video. Please try again.');
    }

    return response.result;
  }

  static cleanupModal(): void {
    const nested = document.getElementById('react-chrome-modal');
    if (nested) {
      document.body.removeChild(nested);
    }
  }
}
