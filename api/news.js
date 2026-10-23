export default async function handler(req, res) {
  const category = req.query?.category || "latest";

  const topics = {
    latest: "Real Madrid",
    transfers: "Real Madrid transfers",
    matches: "Real Madrid matches",
    injuries: "Real Madrid injuries",
    spanish: "Real Madrid news Spanish press"
  };

  const topic = topics[category] || topics.latest;
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(topic) +
    "&hl=ar&gl=IQ&ceid=IQ:ar";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: "تعذر جلب الأخبار حالياً" });
    }

    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    const news = items.slice(0, 20).map((item) => {
      const content = item[1];

      const get = (tag) => {
        const match = content.match(
          new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">")
        );
        return match
          ? match[1]
              .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
              .replace(/&amp;/g, "&")
              .replace(/&quot;/g, '"')
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&apos;/g, "'")
          : "";
      };

      return {
        title: get("title"),
        link: get("link"),
        source: get("source"),
        pubDate: get("pubDate")
      };
    });

    return res.status(200).json({ news });
  } catch (error) {
    return res.status(500).json({ error: "حدث خطأ أثناء جلب الأخبار" });
  }
}
