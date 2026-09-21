import { withBasePath } from "@/lib/base-path";

export type Story = {
  id: number;
  date: string;
  day: string;
  title: string;
  excerpt: string;
  content: string;
  objectImage: string;
  storyImages: string[];
  tone: string;
  people: string[];
  public: boolean;
};

export type ShelfObject = {
  id: string;
  storyId?: number;
  date: string;
  title: string;
  objectImage: string;
  people: string[];
  cutout: boolean;
};

export const OBJECT_ASSETS = [
  "/objects/blue-mug.png",
  "/objects/red-book.png",
  "/objects/camera.png",
  "/objects/mint-pot.png",
  "/objects/yellow-pear.svg",
  "/objects/green-bottle.svg",
  "/objects/brass-key.svg",
  "/objects/cream-envelope.svg",
  "/objects/amber-lamp.svg",
  "/objects/navy-watch.svg",
  "/objects/wax-candle.svg",
  "/objects/film-roll.svg",
  "/objects/brown-radio.svg",
  "/objects/ceramic-bowl.svg",
  "/objects/olive-hat.svg",
  "/objects/glass-jar.svg",
].map(withBasePath);

const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1514897575457-c4db467cf78e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
];

type Template = {
  title: string;
  excerpt: string;
  content: string;
  people: string[];
  public: boolean;
  tone: string;
};

const TEMPLATES: Template[] = [
  { title: "便利店门口", excerpt: "买水时遇到一只猫。", content: "雨停在便利店门口。\n\n橘猫从纸箱里探出头，我们在门边站了十分钟。后来把伞借给了没有伞的人。\n\n店里的灯刚好亮起来，潮湿的街道也跟着亮了一小块。我们把这段偶遇记在了当天的纸页上。", people: ["你", "Mia"], public: true, tone: "ochre" },
  { title: "末班车", excerpt: "车没来，我们走回家。", content: "末班车开走之后，站台安静下来。\n\n我们交换了耳机里的歌，沿着熟悉的路走到天亮前。", people: ["你", "Noah", "June"], public: true, tone: "clay" },
  { title: "面包店", excerpt: "周五，买到热面包。", content: "我们在周五下午排队买面包。\n\n老板多送了一块曲奇，烤箱响了一声，下午就有了形状。", people: ["你", "Kai"], public: false, tone: "sand" },
  { title: "窗台的风", excerpt: "下午的风吹动了窗帘。", content: "窗台上的影子慢慢移到墙角。\n\n我们把一小盆薄荷放到光里，屋里多了一点清新的气味。", people: ["你"], public: false, tone: "sand" },
  { title: "一颗梨", excerpt: "袋子里多了一颗梨。", content: "从市场回来，纸袋底多了一颗还温热的梨。\n\n我们把它放在桌上，傍晚切开，汁水沾在手指上。", people: ["你", "Mia"], public: true, tone: "ochre" },
  { title: "空瓶", excerpt: "路边捡到一只空瓶。", content: "绿玻璃在草丛里反光。\n\n洗干净以后，它成了插一支野花的瓶子。", people: ["你"], public: false, tone: "clay" },
  { title: "旧钥匙", excerpt: "抽屉里找到一把旧钥匙。", content: "钥匙齿已经钝了，可还是带着铜的气味。\n\n我们猜它曾经开过哪一扇门，最后把它放回原处。", people: ["你", "Noah"], public: true, tone: "sand" },
  { title: "没寄出的信", excerpt: "信封合上了，地址还空着。", content: "写完最后一行，窗外的蝉声停了一会儿。\n\n信纸折好，放进抽屉，等一个更合适的日子。", people: ["你"], public: false, tone: "ochre" },
  { title: "夜里的灯", excerpt: "台灯一直亮到很晚。", content: "灯罩把桌面收成一小块暖色。\n\n我们把白天没说完的话，留在这圈光里。", people: ["你", "June"], public: true, tone: "clay" },
  { title: "停走的表", excerpt: "指针停在三点过一刻。", content: "表带还留着体温。\n\n我们没有立刻上弦，只是把它翻过来看了看背面的字。", people: ["你"], public: false, tone: "sand" },
  { title: "停电的夜", excerpt: "蜡烛把墙影拉得很长。", content: "小区突然暗下来。\n\n我们点了一支蜡烛，把棋盘摊在地板上，下完两盘电才来。", people: ["你", "Kai"], public: true, tone: "ochre" },
  { title: "冲洗店", excerpt: "胶卷终于洗出来了。", content: "店员把照片推过柜台，还带着一点药水味。\n\n有一张拍糊了，我们还是留下来。", people: ["你", "Mia"], public: true, tone: "clay" },
  { title: "夜里的广播", excerpt: "收音机里有人在念天气。", content: "旋钮转到半途，沙沙声里忽然清楚起来。\n\n我们靠在椅背上，听到一首很老的歌。", people: ["你"], public: false, tone: "sand" },
  { title: "一碗汤", excerpt: "汤还在冒热气。", content: "瓷碗烫手，葱花浮在面上。\n\n我们没说话，把一碗汤喝完，窗外开始下雨。", people: ["你", "Noah"], public: true, tone: "ochre" },
  { title: "春日的帽子", excerpt: "出门前多戴了一顶帽子。", content: "风有点大，帽檐挡住了眼睛。\n\n走到河边才发现，帽子里还夹着一张昨天的票根。", people: ["你", "June"], public: false, tone: "clay" },
  { title: "窗台上的果酱", excerpt: "罐子在光里变成琥珀色。", content: "果酱还没封口，勺子靠在瓶边。\n\n下午的阳光把它照得很透，像一小块迟到的夏天。", people: ["你"], public: true, tone: "sand" },
];

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatFromOffset(daysBack: number) {
  const date = new Date(Date.UTC(2024, 5, 14));
  date.setUTCDate(date.getUTCDate() - daysBack);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return {
    date: `${year} / ${month} / ${day}`,
    day: DAYS[date.getUTCDay()],
  };
}

function storyImagesFor(index: number, isPublic: boolean) {
  if (!isPublic && index % 5 === 0) return [PHOTO_POOL[index % PHOTO_POOL.length]];
  const first = PHOTO_POOL[index % PHOTO_POOL.length];
  const second = PHOTO_POOL[(index + 3) % PHOTO_POOL.length];
  return index % 3 === 0 ? [first, second] : [first];
}

export function makeCatalogEntry(index: number, idBase = 1): { story: Story; item: ShelfObject } {
  const template = TEMPLATES[index % TEMPLATES.length];
  const objectImage = OBJECT_ASSETS[index % OBJECT_ASSETS.length];
  const id = idBase + index;
  const { date, day } = formatFromOffset(index * 3);
  const story: Story = {
    id,
    date,
    day,
    title: template.title,
    excerpt: template.excerpt,
    content: template.content,
    objectImage,
    storyImages: storyImagesFor(index, template.public),
    tone: template.tone,
    people: template.people,
    public: template.public,
  };
  const item: ShelfObject = {
    id: `story-${id}`,
    storyId: id,
    date,
    title: template.title,
    objectImage,
    people: template.people,
    cutout: true,
  };
  return { story, item };
}

export function buildSampleCatalog(count: number) {
  const stories: Story[] = [];
  const items: ShelfObject[] = [];
  for (let index = 0; index < count; index += 1) {
    const entry = makeCatalogEntry(index);
    stories.push(entry.story);
    items.push(entry.item);
  }
  return { stories, items };
}

export const INITIAL_SHELF_ROWS = 8;
export const INITIAL_SHELF_COUNT = INITIAL_SHELF_ROWS * 4;
export const PLACEHOLDER_BATCH = 16;

export const { stories: initialStories, items: sampleObjects } = buildSampleCatalog(INITIAL_SHELF_COUNT);

export function makePlaceholderBatch(offset: number, count = PLACEHOLDER_BATCH) {
  const stories: Story[] = [];
  const items: ShelfObject[] = [];
  for (let index = 0; index < count; index += 1) {
    const entry = makeCatalogEntry(offset + index, 10_000);
    stories.push(entry.story);
    items.push({ ...entry.item, id: `extra-${entry.item.id}` });
  }
  return { stories, items };
}
