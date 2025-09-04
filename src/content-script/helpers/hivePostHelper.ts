import { HiveContentType } from '../../common/type';

const getHivePost = async (author: string, permlink: string) => {
  try {
    const post = await fetch(`https://www.waivio.com/api/post/${author}/${permlink}`);
    return await post.json() as Promise<HiveContentType>;
  } catch (error) {
    return null;
  }
};

const extractAuthorPermlink = (url: string):null | {author: string, permlink:string} => {
  try {
    const u = new URL(url);

    // case: 3speak.tv/watch?v=author/permlink
    if (u.hostname.includes('3speak.tv')) {
      const vParam = u.searchParams.get('v');
      if (!vParam) return null;
      const [author, permlink] = vParam.split('/');
      return { author, permlink };
    }

    // case: waivio.com/.../@author/permlink[/*]
    if (u.hostname.includes('waivio.com')) {
      const match = u.pathname.match(/\/@([^/]+)\/([^/]+)/);
      if (match) {
        const [, author, permlink] = match;
        return { author: author.replace(/^@/, ''), permlink };
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const getHivePostFromDocUrl = async () => {
  const link = document.URL;
  const authorPermlink = extractAuthorPermlink(link);
  if (!authorPermlink) return null;
  const { author, permlink } = authorPermlink;
  const post = await getHivePost(author, permlink);

  if (!post) return null;
  return post;
};
