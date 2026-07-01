<div dir="rtl" style="text-align: right; font-family: 'Vazirmatn', 'Inter', sans-serif; line-height: 1.8; max-width: 900px; margin: 0 auto; padding: 20px;">

# 🎬 یوتیوب تیوتریال — ساخت Reddit Clone با Next.js 16 (Threadly)

**مدت زمان تخمینی**: ۳ تا ۴ ساعت (تقسیم شده به ۶-۷ قسمت)
**سطح**: Intermediate تا Advanced
**سبک**: JS Mastery — پروژه‌محور، کدنویسی زنده، توضیح مفهوم‌های عمیق

---

## 📑 فهرست قسمت‌ها (Chapters)

| قسمت | عنوان                                             | مدت      |
| ---- | ------------------------------------------------- | -------- |
| ۰    | مقدمه و معرفی پروژه                               | ۵ دقیقه  |
| ۱    | فوت و فن‌های جاوا اسکریپت / تایپ‌اسکریپت          | ۲۵ دقیقه |
| ۲    | پیاده‌سازی دیتابیس و Prisma Schema                | ۲۰ دقیقه |
| ۳    | لایه دسترسی به داده (Queries) + الگوریتم‌های sort | ۴۵ دقیقه |
| ۴    | Server Actions و Auth                             | ۳۰ دقیقه |
| ۵    | کامپوننت‌های Layout: Navbar, Sidebar, Trending    | ۳۰ دقیقه |
| ۶    | کامپوننت Feed: PostCard, VoteButtons, SortTabs    | ۳۵ دقیقه |
| ۷    | صفحه پست + کامنت‌های درختی + Profile Page         | ۴۰ دقیقه |
| ۸    | Seed Scripts و نکات نهایی                         | ۱۵ دقیقه |

---

# 📝 اسکریپت کامل

---

## قسمت ۰: مقدمه و معرفی پروژه

**مدت**: ۵ دقیقه

**(Intro با موسیقی JS Mastery style)**

**Host**: سلام به همه! امروز قراره یه پروژه واقعاً جذاب و کامل رو با هم بسازیم.

**Screen**: پروژه Threadly روی صفحه نشون داده بشه

**Host**: اسم پروژه‌مون هست Threadly — یه Reddit Clone مدرن با Next.js 16. توی این سری ویدیوها، از صفر تا صد یه پلتفرم مثل Reddit رو می‌سازیم با:

- **Server Components** و **Server Actions**
- **Prisma + Neon PostgreSQL** برای دیتابیس
- **Neon Auth** برای احراز هویت
- **Tailwind v4** و **shadcn/ui** برای ظاهر
- **Voting System** با تگ‌های پست
- **کامنت‌های درختی** (Nested Threaded Comments)
- **سه نوع مرتب‌سازی**: Hot / New / Top
- **پروفایل کاربر** با آمار Karma

**Host**: این پروژه پر از تکنیک‌های حرفه‌ایه که توی کارهای روزمره بهشون نیاز دارین. پس اگه آماده‌اید، بریم سراغ قسمت اول که یکم جاوا اسکریپت باحال ببینیم!

---

## قسمت ۱: فوت و فن‌های جاوا اسکریپت / تایپ‌اسکریپت

**مدت**: ۲۵ دقیقه

### بخش ۱-۱: Promise.all — موازی بخون، سریع‌تر برسون! (۳ دقیقه)

**Screen**: فایل `lib/db/queries.ts` خط ۶۲

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const [tagMap, ccMap, vsMap, uvMap] = await Promise.all([
  tagsForPosts(ids),
  commentCountsForPosts(ids),
  voteSumsForPosts(ids),
  userVotesForPosts(userId, ids),
]);
```

</div>

**Host**: اولین تکنیکی که می‌بینیم، یکی از مهم‌ترین‌هاست. توی پروژه‌های واقعی، معمولاً باید چندتا داده رو از دیتابیس بگیریم. اگه پشت سر هم این کار رو بکنیم، کاربر باید منتظر بمونه تا اولی تموم بشه بعد دومی شروع بشه.

**Screen**: مقایسه تصویری — Sequential vs Parallel waterfall

**Host**: اینجا چهار تا query رو داریم که هیچکدوم به هم وابسته نیستن. پس با `Promise.all` همه رو **همزمان** اجرا می‌کنیم. نتیجه؟ زمان پاسخ‌دهی تقریباً برابر با **طولانی‌ترین query** میشه، نه حاصل جمعشون!

**نکته حرفه‌ای**: دقت کنید که از Destructuring با Array استفاده کردیم تا خروجی رو به چهار متغیر مجزا بشکنیم. این کار خوانایی کد رو خیلی بالا می‌بره.

---

### بخش ۱-۲: Map — جایگزین هوشمند Object برای دیتاهای گروهی (۳ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۱۱۳-۱۲۶

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
async function tagsForPosts(postIds: string[]): Promise<Map<string, string[]>> {
  const m = new Map<string, string[]>();
  if (postIds.length === 0) return m;
  const rows = await prisma.postTag.findMany({
    where: { postId: { in: postIds } },
  });
  for (const pid of postIds) m.set(pid, []);
  for (const r of rows) {
    const list = m.get(r.postId) ?? [];
    list.push(r.tagSlug);
    m.set(r.postId, list);
  }
  return m;
}
```

</div>

**Host**: اینجا یه الگوی خیلی رایج توی پروژه‌های واقعیه. ما می‌خوایم برای لیستی از postIdها، تگ‌هاشون رو پیدا کنیم. چرا از `Map` استفاده کردیم به جای `{}`؟

**مقایسه Map vs Object:**

- ✅ **Map**: `m.get(key)` => O(1) ، حفظ ترتیب insertion ، هر نوع keyای می‌تونه داشته باشه
- ❌ **Object**: `obj[key]` => O(1) ولی محدودیت‌های prototype داره

**Host**: اول همه postIdها رو با آرایه خالی توی Map می‌ذاریم (خط ۱۱۹). بعد هر ردیف رو پیدا می‌کنیم و تگش رو به آرایه‌ش اضافه می‌کنیم. نتیجه نهایی یه Map میشه که برای هر postId، یه آرایه از tagSlugها داره.

**نکته حرفه‌ای**: `nullish coalescing (??)` رو می‌بینید؟ `m.get(r.postId) ?? []` یعنی "اگه null یا undefined بود، یه آرایه خالی بده". این تمیزتر از `||` هستش چون `||` مقادیر falsy مثل `""` و `0` رو هم می‌گیره.

---

### بخش ۱-۳: Set — حذف تکراری‌ها با یه خط کد (۲ دقیقه)

**Screen**: `lib/db/queries.ts` خط ۹

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const unique = [...new Set(authorIds)];
```

</div>

**Host**: ببینید چقدر ساده! `Set` یه ساختمان داده‌ست که فقط مقادیر unique رو نگه می‌داره. با `...` (spread operator) محتویات Set رو توی یه آرایه جدید می‌ریزیم. یه خط، همه تکراری‌ها رو حذف می‌کنه.

این رو توی جاوااسکریپت قدیم چجوری می‌کردیم؟

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```javascript
// ❌ قدیمی
var unique = [];
for (var i = 0; i < authorIds.length; i++) {
  if (unique.indexOf(authorIds[i]) === -1) {
    unique.push(authorIds[i]);
  }
}

// ✅ مدرن
const unique = [...new Set(authorIds)];
```

</div>

---

### بخش ۱-۴: Spread Operator — آرایه‌ها رو قورت بده! (۲ دقیقه)

**Screen**: `scripts/seed-with-comments-and-votes.ts` خط ۳۵۷

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const allPosts = [...CURATED_POSTS, ...procedural];
```

</div>

**Host**: با `...` می‌تونیم دو تا آرایه رو به هم بچسبونیم. اینجا داریم پست‌های دست‌نویس و پست‌های تولیدشده با کد رو یکی می‌کنیم.

**مقایسه:**

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
// ❌ قدیمی
const allPosts = CURATED_POSTS.concat(procedural);

// ✅ مدرن (بهتر)
const allPosts = [...CURATED_POSTS, ...procedural];

// ✅ حتی می‌تونیم وسطش اضافه کنیم!
const mixed = [...firstHalf, { special: true }, ...secondHalf];
```

</div>

---

### بخش ۱-۵: Nullish Coalescing (??) — یا این، یا اون (۱ دقیقه)

**Screen**: `lib/db/user-profile.ts` خط ۲۸

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
displayName: existing.displayName ?? neon.name,
avatarUrl: existing.avatarUrl ?? neon.image ?? undefined,
```

</div>

**Host**: اپراتور `??` فقط وقتی مقدار `null` یا `undefined` باشه، مقدار پیش‌فرض رو برمی‌گردونه. این با `||` فرق داره:

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const x = 0;
const a = x || 10; // 10  ← چون 0 falsy هست!
const b = x ?? 10; // 0   ← چون 0 null یا undefined نیست
```

</div>

---

### بخش ۱-۶: useTransition — UI رو Responsive نگه دار (۳ دقیقه)

**Screen**: `components/feed/vote-buttons.tsx` خطوط ۲۱-۳۳

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";
const [pending, startTransition] = useTransition();
const router = useRouter();

function vote(value: -1 | 1) {
  startTransition(async () => {
    if (isPost) {
      await votePostAction(targetId, value);
    } else {
      await voteCommentAction(targetId, value);
    }
    router.refresh();
  });
}
```

</div>

**Host**: `useTransition` یکی از هوک‌های React 19 هستش که به ما اجازه میده عملیات سنگین رو به عنوان Transition تعریف کنیم. توی این پروژه، رای دادن یه عملیات async هستش که:

1. یه Server Action رو صدا می‌زنه
2. صفحه رو Refresh می‌کنه

`pending` به ما می‌گه که آیا transition در حال اجراست. دکمه‌ها رو `disabled` می‌کنیم وقتی `pending` درسته. اینجوری کاربر نمی‌تونه دوبار رای بده!

**نکته حرفه‌ای**: `useTransition` بهتر از `useState` برای این کاره چون با Suspense هماهنگه و می‌تونه Loading Stateهای موجود رو مدیریت کنه.

---

### بخش ۱-۷: useActionState — فرم‌های Server-Side ساده (۲ دقیقه)

**Screen**: `components/post/submit-post-form.tsx` خط ۱۰

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const [state, action, pending] = useActionState(createPostAction, null);
```

</div>

**Host**: `useActionState` هوک جدید React 19 هستش که کار با Server Actions توی فرم‌ها رو خیلی ساده می‌کنه. سه تا چیز بهمون میده:

- `state`: آخرین مقداری که action برگردونده (خطاها و ...)
- `action`: تابعی که میشه به `form action` داد
- `pending`: وضعیت در حال اجرا بودن

با این هوک، نیازی به `formRef`، `useState` برای خطاها، و `handleSubmit` دستی نداریم.

---

### بخش ۱-۸: Recursion برای کامنت‌های درختی (۳ دقیقه)

**Screen**: `lib/comment-tree.ts` خطوط ۲۲-۶۴

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export function nestCommentRows(
  flat: EnrichedCommentRow[],
): EnrichedCommentNode[] {
  const map = new Map<string, EnrichedCommentNode>();
  for (const c of flat) map.set(c.id, { ...c, children: [] });

  const roots: EnrichedCommentNode[] = [];
  for (const c of flat) {
    const node = map.get(c.id);
    if (!node) continue;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // ← مرتب‌سازی بازگشتی
  const sortCh = (nodes: EnrichedCommentNode[]) => {
    nodes.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    for (const n of nodes) sortCh(n.children);
  };
  sortCh(roots);
  return roots;
}
```

</div>

**Screen**: `components/post/comment-node.tsx` خطوط ۸۱-۹۱

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
{node.children.length > 0 && (
  <ul className="mt-4 space-y-4 border-l border-border/80 pl-3">
    {node.children.map((ch) => (
      <CommentNode
        key={ch.id}
        node={ch}
        postAuthorId={postAuthorId}
        sessionUser={sessionUser}
      />
    ))}
  </ul>
)}
```

</div>

**Host**: اینجا دو نوع recursion داریم:

**۱. Recursive Tree Building (Server-side):**

کامنت‌ها توی دیتابیس به صورت flat ذخیره شدن — هر کامنت یه `parentId` داره. ما این آرایه flat رو به یه درخت تبدیل می‌کنیم:

- اول همه کامنت‌ها رو توی Map می‌ذاریم (Key: id, Value: node)
- دوباره حلقه می‌زنیم و هر کامنتی که `parentId` داره و parentش وجود داره، می‌ذاریم زیر مجموعه parent
- بقیه میشن root (کامنت‌های سطح اول)
- در نهایت مرتب‌سازی بازگشتی انجام می‌دیم

**۲. Recursive Component Rendering (Client-side):**

کامپوننت `CommentNode` خودش رو به صورت بازگشتی برای `node.children` صدا می‌زنه. هر بار یک `ul` جدید با حاشیه سمت چپ ایجاد میشه که همون نمای درختی معروف Reddit رو می‌سازه.

**نکته حرفه‌ای**: روش Adjacency List (parentId) ساده‌ترین و منعطف‌ترین روش برای کامنت‌های درختیه. برخلاف Nested Sets که migrationش سخت‌ه، این روش به راحتی کامنت جدید اضافه می‌کنه.

---

### بخش ۱-۹: Optional Chaining (?.) — ضرب‌العجل زنجیره‌ای (۱ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
existing?.displayName ?? neon.name;
```

</div>

**Host**: `?.` بهمون اجازه میده بدون نگرانی از undefined/null بودن یه property، بهش دسترسی داشته باشیم. اگه `existing` undefined باشه، کل عبارت میشه `undefined` و بعد `??` مقدار پیش‌فرض رو برمی‌گردونه.

---

### بخش ۱-۱۰: Type Narrowing + Type Guards (۲ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۴۲۴-۴۳۶

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const enriched = flat
  .map((c) => {
    const author = authorMap.get(c.authorId);
    if (!author) return null;
    return { ...c, author, score: scoreMap.get(c.id) ?? 0, ... };
  })
  .filter((x): x is NonNullable<typeof x> => x !== null);
```

</div>

**Host**: این یه تکنیک خیلی حرفه‌ایه. وقتی از `map` استفاده می‌کنیم و ممکنه بعضی آیتم‌ها `null` باشن، تایپ‌اسکریپت نمی‌دونه که `filter` تکراری‌ها رو گرفته. با `x is NonNullable<typeof x>` ما به تایپ‌اسکریپت می‌گیم که این فانکشن به عنوان Type Guard عمل می‌کنه و نتیجه نهایی آرایه‌ای بدون `null` هستش.

---

### بخش ۱-۱۱: () => Date — مقایسه تاریخ با Timestamp (۱ دقیقه)

**Screen**: `lib/comment-tree.ts` خط ۵۵

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
nodes.sort((a, b) => {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
});
```

</div>

**Host**: برای مقایسه تاریخ‌ها، `Date.getTime()` توی میلی‌ثانیه عدد برمی‌گردونه. تفریق دو عدد دقیقاً همون چیزیه که `sort` نیاز داره — عدد منفی یعنی a کوچیکتره (قدیمی‌تر)، مثبت یعنی b قدیمی‌تره.

---

### بخش ۱-۱۲: template literal + encodeURIComponent برای URL (۱ دقیقه)

**Screen**: `components/feed/feed-sort-tabs.tsx` و `components/feed/post-card.tsx`

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
href={`/?tag=${encodeURIComponent(primaryTag.slug)}`}
```

</div>

**Host**: همیشه موقع ساختن URL داینامیک از `encodeURIComponent` استفاده کنید. این تابع کاراکترهای خاص مثل space، #، & رو به فرمت URL-safe تبدیل می‌کنه. با template literals (بک‌تیک) می‌تونیم string و متغیر رو قشنگ ترکیب کنیم.

---

## قسمت ۲: دیتابیس و Prisma Schema

**مدت**: ۲۰ دقیقه

### بخش ۲-۱: معماری دیتابیس

**Screen**: `prisma/schema.prisma` کامل

**Host**: بیایید اول معماری دیتابیسمون رو ببینیم. پنج مدل داریم:

1. **UserProfile** — اطلاعات کاربر
2. **Post** — پست‌ها با رابطه many-to-many به Tag
3. **Tag** — تگ‌ها (جایگزین subredditها)
4. **Comment** — کامنت‌های درختی (self-referencing با parentId)
5. **Vote** — رای‌ها (polymorphic برای post و comment)

**نکته معماری**: این پروژه به جای subreddit از Tag استفاده می‌کنه. هر پست می‌تونه چندین تگ داشته باشه. چرا این تصمیم؟ چون توی جامعه‌های کوچک، مدل تگ ساده‌تر از subreddit هستش — کاربران راحت‌تر محتوا رو پیدا می‌کنن.

---

### بخش ۲-۲: مدل Vote — Polymorphic Design

**Screen**: مدل Vote

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```prisma
model Vote {
  userId     String @map("user_id")
  targetType String @map("target_type")  // "post" یا "comment"
  targetId   String @map("target_id") @db.Uuid
  value      Int    @db.SmallInt          // -1 یا 1

  @@id([userId, targetType, targetId])    // ← Composite Key
  @@map("votes")
}
```

</div>

**Host**: این مدل جالبیه. به جای اینکه دو تا جدول جدا برای رای پست و رای کامنت داشته باشیم، از یه جدول polymorphic استفاده کردیم:

- `targetType`: مشخص می‌کنه این رای برای پسته یا کامنت
- `targetId`: ID هدف (پست یا کامنت)
- `value`: ۱ برای upvote، ۱- برای downvote

**نکته کلیدی**: `@@id([userId, targetType, targetId])` یه **Composite Primary Key** می‌سازه. یعنی هر کاربر فقط می‌تونه یه بار به هر هدفی رای بده. این unique constraint رو مستقیماً توی دیتابیس اعمال می‌کنه.

همچنین از `@db.SmallInt` استفاده کردیم که یه integer ۲ بایتی‌ست — بهینه‌تر از Int معمولی برای مقادیر کوچیک.

---

### بخش ۲-۳: Self-Referencing Comment

**Screen**: مدل Comment

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```prisma
model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  postId    String   @map("post_id") @db.Uuid
  authorId  String   @map("author_id")
  parentId  String?  @map("parent_id") @db.Uuid  // ← Self-reference
  body      String
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@map("comments")
}
```

</div>

**Host**: `parentId: String?` اشاره می‌کنه به `Comment.id`. این همون self-referencing یا adjacency list هستش که قبلاً درباره‌اش حرف زدیم. `?` یعنی nullable — اگه `parentId` null باشه، این کامنت سطح اوله (root comment).

**`onDelete: Cascade`** یعنی اگه پستی حذف بشه، همه کامنت‌هاش هم حذف می‌شن. این رو حتماً داشته باشید وگرنه دیتابیس خطای Foreign Key می‌ده.

---

### بخش ۲-۴: Naming Conventions

**Host**: توی Prisma از:

- `@map()` برای نام ستون توی دیتابیس (snake_case)
- `@@map()` برای نام جدول توی دیتابیس (snake_case)
- فیلدهای Prisma به صورت camelCase

این کار باعث میشه کد TypeScript تمیز (camelCase) ولی دیتابیس استاندارد (snake_case) داشته باشیم.

---

## قسمت ۳: لایه دسترسی به داده (Queries) + الگوریتم‌های مرتب‌سازی

**مدت**: ۴۵ دقیقه

### بخش ۳-۱: batchAuthorsForIds — الگوی Batch Loading (۵ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۶-۳۶

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function batchAuthorsForIds(
  authorIds: string[],
): Promise<Map<string, User>> {
  const unique = [...new Set(authorIds)];
  if (unique.length === 0) return new Map();

  const rows = await prisma.userProfile.findMany({
    where: { id: { in: unique } },
  });

  const result = new Map<string, User>();
  for (const row of rows) {
    result.set(row.id, {
      id: row.id,
      username: row.username,
      displayName: row.displayName ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      bio: row.bio ?? undefined,
      createdAt: row.createdAt.toISOString(),
    });
  }

  // ← Fallback: اگه کاربری توی دیتابیس نبود (مثلاً seed نشده)
  for (const id of unique) {
    if (!result.has(id)) {
      result.set(id, { id, username: `user_${id.slice(0, 6)}` });
    }
  }

  return result;
}
```

</div>

**Host**: این یه الگوی خیلی مهمه — **Batch Loading**. توی صفحه اصلی، ۵۰ تا پست داریم که هرکدوم یه `authorId` دارن. اگه تک‌تک بریم کاربر رو از دیتابیس بگیریم، ۵۰ تا query زده میشه (N+1 Problem!).

با این روش، همه authorIdها رو یه جا به دیتابیس می‌دیم و یه query می‌زنیم. نتیجه رو توی `Map` می‌ذاریم که بعداً بتونیم سریع (O(1)) بهش دسترسی داشته باشیم.

**نکته حرفه‌ای**: اون fallback loop رو ببینید. اگه کاربری توی دیتابیس نباشه (مثلاً seedش نکردیم)، یهユーザ fallback می‌سازیم. این کار باعث نمیشه صفحه کلاً خطا بده.

---

### بخش ۳-۲: listPostsSorted — سه الگوریتم مرتب‌سازی (۱۰ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۴۴-۱۰۳

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function listPostsSorted(
  sort: FeedSort,
  tagFilter: string | undefined,
  userId: string | undefined,
): Promise<FeedPostRow[]> {
```

</div>

**Host**: این تابع قلب برنامه‌ست. بیایید ببینیم چطور کار می‌کنه:

**گام ۱ — گرفتن داده‌ها به صورت موازی:**

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const [tagMap, ccMap, vsMap, uvMap] = await Promise.all([
  tagsForPosts(ids),
  commentCountsForPosts(ids),
  voteSumsForPosts(ids),
  userVotesForPosts(userId, ids),
]);
```

</div>

همون `Promise.all` که توی قسمت ۱ گفتیم.

**گام ۲ — تبدیل با Map کردن:**

هر پست رو با اطلاعات تگ‌ها، تعداد کامنت‌ها، امتیاز و رای کاربر ادغام می‌کنیم.

**گام ۳ — مرتب‌سازی بر اساس sort:**

#### 🔥 مرتب‌سازی Hot:

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const hotB = b.voteScore + 2 * b.post.commentCount;
const hotA = a.voteScore + 2 * a.post.commentCount;
return hotB - hotA || b.created - a.created;
```

</div>

**Host**: فرمول Hot = امتیاز پست + ۲ برابر تعداد کامنت‌ها. کامنت وزن بیشتری داره چون نشون‌دهنده تعامله. `||` برای tie-breaking استفاده شده.

#### ✨ مرتب‌سازی New:

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
mapped.sort((a, b) => b.created - a.created);
```

</div>

ساده‌ترین مرتب‌سازی — بر اساس زمان ایجاد.

#### 🏆 مرتب‌سازی Top:

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
mapped.sort(
  (a, b) =>
    b.voteScore - a.voteScore ||
    b.post.commentCount - a.post.commentCount ||
    b.created - a.created,
);
```

</div>

بر اساس امتیاز. اگه برابر بود، تعداد کامنت. بازم برابر بود، زمان.

---

### بخش ۳-۳: getCommentTree — ساختن درخت کامنت (۷ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۴۰۹-۴۳۹

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function getCommentTree(
  postId: string,
  sessionUserId?: string,
): Promise<EnrichedCommentNode[]> {
  const flat = await listCommentsForPost(postId);
  if (flat.length === 0) return [];

  const authorIds = [...new Set(flat.map((c) => c.authorId))];
  const authorMap = await batchAuthorsForIds(authorIds);
  const commentIds = flat.map((c) => c.id);

  const scoreMap = await batchCommentScores(commentIds);
  const voteMap = sessionUserId
    ? await batchUserVotesForComments(sessionUserId, commentIds)
    : new Map<string, -1 | 0 | 1>();

  const enriched = flat
    .map((c) => {
      const author = authorMap.get(c.authorId);
      if (!author) return null;
      return {
        ...c,
        author,
        score: scoreMap.get(c.id) ?? 0,
        userVote: (voteMap.get(c.id) ?? 0) as -1 | 0 | 1,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return nestCommentRows(enriched);
}
```

</div>

**Host**: این تابع پنج مرحله داره:

1. **Flat Fetch**: همه کامنت‌های یه پست رو می‌گیره (یک query)
2. **Batch Authors**: همه نویسنده‌ها رو یه جا می‌گیره (دومین query)
3. **Batch Scores**: همه امتیازها رو یه جا (سومین query)
4. **Batch User Votes**: رای‌های کاربر جاری (چهارمین query)
5. **Enrich + Tree**: همه اطلاعات رو ترکیب می‌کنه و درخت می‌سازه

جمعاً ۴ تا query برای کل درخت کامنت — بدون N+1 Problem!

---

### بخش ۳-۴: توابع کمکی — Group By (۳ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
// ← commentCountsForPosts — Group By
async function commentCountsForPosts(
  postIds: string[],
): Promise<Map<string, number>> {
  const rows = await prisma.comment.groupBy({
    by: ["postId"],
    where: { postId: { in: postIds } },
    _count: { _all: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.postId, r._count._all);
  return m;
}

// ← voteSumsForPosts — Group By with Sum
async function voteSumsForPosts(
  postIds: string[],
): Promise<Map<string, number>> {
  const rows = await prisma.vote.groupBy({
    by: ["targetId"],
    where: { targetType: "post", targetId: { in: postIds } },
    _sum: { value: true },
  });
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.targetId, Number(r._sum.value ?? 0));
  return m;
}
```

</div>

**Host**: این توابع کمکی از قدرت **SQL Group By** استفاده می‌کنن. به جای ۵۰ تا query جدا، یه query می‌زنیم با `groupBy` و `_count` یا `_sum`.

---

### بخش ۳-۵: getUserKarma — جمع امتیاز کاربر (۳ دقیقه)

**Screen**: `lib/db/queries.ts` خطوط ۲۴۱-۲۶۳

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function getUserKarma(userId: string): Promise<number> {
  const [postIds, commentIds] = await Promise.all([
    prisma.post.findMany({ where: { authorId: userId }, select: { id: true } }),
    prisma.comment.findMany({
      where: { authorId: userId },
      select: { id: true },
    }),
  ]);

  const allTargetIds = [
    ...postIds.map((p) => p.id),
    ...commentIds.map((c) => c.id),
  ];

  const agg = await prisma.vote.aggregate({
    where: { targetId: { in: allTargetIds } },
    _sum: { value: true },
  });

  return Number(agg._sum.value ?? 0);
}
```

</div>

**Host**: Karma کاربر = جمع امتیاز همه پست‌ها + کامنت‌های اون کاربر.

مراحل:

1. همه postIdها و commentIdهای کاربر رو می‌گیریم
2. دو تا آرایه رو با spread operator یکی می‌کنیم
3. یه `aggregate` با `_sum` می‌زنیم تا کل امتیازها جمع بشه

---

## قسمت ۴: Server Actions و Auth

**مدت**: ۳۰ دقیقه

### بخش ۴-۱: Neon Auth Setup (۵ دقیقه)

**Screen**: `lib/auth.ts`

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cache } from "react";
import { ensureUserProfile } from "./db/user-profile";
import { User } from "./types";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});

export const getCurrentUserId = cache(async (): Promise<string | undefined> => {
  const { data: session } = await auth.getSession();
  return session?.user.id;
});

export const getSessionUser = cache(async (): Promise<User | null> => {
  const { data: session } = await auth.getSession();
  if (!session?.user) return null;
  return ensureUserProfile(session.user);
});
```

</div>

**Host**: Neon Auth یه سرویس احراز هویته که با Neon Database هماهنگه. دو تابع مهم داریم:

- `getCurrentUserId`: فقط id کاربر رو برمی‌گردونه (برای چک‌های سریع)
- `getSessionUser`: کل اطلاعات کاربر رو از دیتابیس می‌گیره

**نکته مهم**: از `cache()` از React استفاده کردیم. یعنی توی یه درخواست، چند بار که صدا بزنیم، فقط یه بار اجرا میشه.

---

### بخش ۴-۲: createPostAction — اولین Server Action (۷ دقیقه)

**Screen**: `lib/actions/posts.ts`

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "../auth";
import { prisma } from "../prisma";
import { redirect } from "next/navigation";

export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "You must be signed in to post." };
  }

  const title = String(formData.get("title") ?? "");
  const body = String(formData.get("body") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");

  if (title.trim().length < 4) {
    return { error: "Title is too short." };
  }

  const tagSlugs = tagsRaw
    .split(/[,#\s]+/)
    .map((s) => s.trim().toLowerCase())
    .slice(0, 5);

  const post = await addPost({ authorId: userId, title, body, tagSlugs });

  revalidatePath("/");
  revalidatePath("/submit");
  redirect(`/post/${post.id}`);
}
```

</div>

**Host**: Server Actions توابعی هستن که روی سرور اجرا می‌شن ولی می‌تونیم از کلاینت صداشون بزنیم. نکات مهم:

1. **`"use server"`** — این directive توی اول فایل، همه exportها رو Server Action می‌کنه
2. **FormData** — داده‌های فرم مستقیماً به سرور می‌رن
3. **Validation** — توی سمت سرور validation می‌کنیم
4. **revalidatePath** — بعد از ایجاد پست، کش Next.js رو پاک می‌کنیم
5. **redirect** — کاربر رو به صفحه پست جدید هدایت می‌کنیم

---

### بخش ۴-۳: Vote System — Toggle Logic (۶ دقیقه)

**Screen**: `lib/actions/posts.ts` خطوط ۲۲-۵۱

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function votePost(
  userId: string,
  postId: string,
  value: -1 | 1,
): Promise<void> {
  const current = await getUserVote(userId, "post", postId);
  let next: -1 | 0 | 1 = value;

  // ← Toggle: اگه قبلاً همین رای رو داده بود، رای رو برمی‌داریم
  if (current === value) next = 0;

  // ← اول همه رای‌های قبلی رو پاک می‌کنیم
  await prisma.vote.deleteMany({
    where: { userId, targetType: "post", targetId: postId },
  });

  // ← بعد اگه باید رای بده، رای جدید ایجاد می‌کنیم
  if (next !== 0) {
    await prisma.vote.create({
      data: { userId, targetType: "post", targetId: postId, value: next },
    });
  }
}
```

</div>

**Host**: منطق رای:

1. می‌بینیم کاربر قبلاً چی رای داده
2. اگه قبلاً همین رای رو داده (مثلاً upvote و حالا دوباره upvote زده)، `next = 0` یعنی رای رو برمی‌داریم
3. همه رای‌های قبلی کاربر برای این پست رو پاک می‌کنیم (**delete-then-create**)
4. اگه `next !== 0`، رای جدید می‌سازیم

**چالش**: چرا `deleteMany` و بعد `create` به جای `upsert`؟ چون با `upsert` نمی‌تونیم مقدار رو صفر کنیم. توی این طراحی، ما رای صفر نداریم — یا رای مثبت هست، یا منفی، یا وجود نداره.

---

### بخش ۴-۴: Comment Action (۵ دقیقه)

**Screen**: `lib/actions/comments.ts`

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export async function createCommentAction(
  _prev: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "You must be signed in to comment." };

  const postId = String(formData.get("postId") ?? "");
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const body = String(formData.get("body") ?? "");

  if (!postId || body.trim().length < 1) {
    return { error: "Comment cannot be empty." };
  }

  const parentId = parentIdRaw && parentIdRaw !== null ? parentIdRaw : null;
  await addComment({ postId, authorId: userId, parentId, body });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/");
  return { ok: true };
}
```

</div>

**Host**: این Action توسط دو تا کامپوننت مختلف صدا زده میشه:

- `CommentComposer` توی صفحه پست (برای کامنت جدید)
- `CommentComposer` توی `CommentNode` (برای ریپلای)

---

### بخش ۴-۵: ensureUserProfile — ثبت‌نام خودکار (۳ دقیقه)

**Screen**: `lib/db/user-profile.ts`

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
function generateUsername(name: string): string {
  const base = name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20) || "user";
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}_${suffix}`;
}

export async function ensureUserProfile(neon: {
  id: string; name: string; image?: string | null
}): Promise<User> {
  const existing = await prisma.userProfile.findUnique({
    where: { id: neon.id },
  });
  if (existing) {
    return {
      id: existing.id,
      username: existing.username,
      displayName: existing.displayName ?? neon.name,
      avatarUrl: existing.avatarUrl ?? neon.image ?? undefined,
      bio: existing.bio ?? undefined,
      createdAt: existing.createdAt.toISOString(),
    };
  }

  // ← اولین بار — پروفایل رو می‌سازیم
  const row = await prisma.userProfile.create({
    data: {
      id: neon.id,
      username: generateUsername(neon.name),
      displayName: neon.name,
      avatarUrl: neon.image,
    },
  });
  return { ... };
}
```

</div>

**Host**: این تابع هر وقت کاربر لاگین می‌کنه صدا زده میشه:

- **اگه کاربر قبلاً توی دیتابیس ماست** ← اطلاعاتش رو برمی‌گردونه
- **اگه اولین باره که میاد** ← براش یه پروفایل توی دیتابیس می‌سازه

**`generateUsername`**: اسم کاربر رو به فرمت استاندارد تبدیل می‌کنه (حذف کاراکترهای خاص) + یه suffix تصادفی برای uniqueness.

---

## قسمت ۵: کامپوننت‌های Layout

**مدت**: ۳۰ دقیقه

### بخش ۵-۱: Root Layout + Providers (۳ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NeonAuthProviders>{children}</NeonAuthProviders>
      </body>
    </html>
  );
}

// providers/neon-auth-ui-provider.tsx
"use client";
export function NeonAuthProviders({ children }) {
  return (
    <NeonAuthUIProvider authClient={authClient} defaultTheme="dark">
      {children}
    </NeonAuthUIProvider>
  );
}
```

</div>

**Host**: Layout ریشه شامل:

1. **Fontها**: Inter برای Sans، Geist Mono برای Monospace
2. **کلاس dark**: پروژه همیشه dark mode هستش (مثل Reddit)
3. **`NeonAuthProviders`**: wrapper کلاینت‌ساید برای Auth UI

---

### بخش ۵-۲: Core Layout — Grid سه ستونه (۵ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export default async function CoreGroupLayout({ children }) {
  const user = await getSessionUser();
  const tags = await tagPostCounts();
  return (
    <>
      <Navbar />
      <div className="mx-auto flex max-w-300 gap-8 px-4 pb-16 pt-2">
        <LeftSidebar showCta={!user} tagsWithCounts={tags} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
```

</div>

**Host**: از **Route Group** `(core)` استفاده کردیم. layout اصلی سه بخش داره:

1. **سمت چپ**: LeftSidebar (مخفی توی موبایل)
2. **وسط**: محتوای اصلی (flex-1)
3. **سمت راست**: Trending (توی page.tsx هر صفحه اضافه میشه)

---

### بخش ۵-۳: Navbar (۴ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-300 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">T</span>
          <span className="text-lg">Threadly</span>
        </Link>

        <SignedIn>
          <Link href="/submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:inline-flex")}>Create</Link>
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="size-5" /></Button>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Link href="/auth/sign-in" className={buttonVariants({ variant: "ghost" })}>Log In</Link>
          <Link className={buttonVariants({ variant: "default" })} href="/auth/sign-up">Sign Up</Link>
        </SignedOut>
      </div>
    </header>
  );
}
```

</div>

**Host**: Navbar با استفاده از **Neon Auth Components**:

- `<SignedIn>`: فقط وقتی کاربر لاگین کرده نمایش داده بشه
- `<SignedOut>`: فقط وقتی کاربر لاگین نکرده
- `<UserButton>`: دکمه پروفایل کاربر

**نکته UI**: `bg-background/90 backdrop-blur-md` — یه افکت شیشه‌ای به navbar میده.

---

### بخش ۵-۴: LeftSidebar با usePathname (۶ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";

export function LeftSidebar({ showCta, tagsWithCounts }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const sort = sp.get("sort");

  return (
    <aside className="hidden w-52 shrink-0 lg:block">
      <nav>
        {nav.map(({ href, label, icon: Icon, match }) => {
          const active = match === "home"
            ? pathname === "/" && sort !== "hot" && sort !== "new" && sort !== "top"
            : match === "hot" ? pathname === "/" && sort === "hot"
            : match === "new" ? pathname === "/" && sort === "new"
            : false;
          // ... Link با کلاس active
        })}
      </nav>

      <LeftTags items={tagsWithCounts} />
      {showCta && <JoinCtaCard />}
    </aside>
  );
}
```

</div>

**Host**: این کامپوننت باید **کلاینت-ساید** باشه چون از `usePathname()` و `useSearchParams()` استفاده می‌کنه. منطق Active Link:

- "Home": وقتی در `"/"` هستیم و هیچ sortای فعال نیست
- "Popular": وقتی در `"/?sort=hot"` هستیم
- "All Posts": وقتی در `"/?sort=new"` هستیم

---

### بخش ۵-۵: RightTrending (۳ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export function RightTrending({ items }: { items: TrendingItem[] }) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Trending today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {items.map((t) => (
          <div key={t.rank} className="flex gap-3 text-sm">
            <span className="font-mono text-lg font-semibold text-muted-foreground">{t.rank}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug text-foreground">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.postCount} posts</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

</div>

**Host**: Trending از static data استفاده می‌کنه (فایل `lib/trending.ts`). توی نسخه واقعی، می‌تونیم به دیتابیس وصل کنیم.

---

## قسمت ۶: کامپوننت Feed

**مدت**: ۳۵ دقیقه

### بخش ۶-۱: صفحه اصلی (Home Page) (۸ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export default async function Home({ searchParams }) {
  const sp = await searchParams;
  const sort: FeedSort = sortRaw === "new" || sortRaw === "top" ? sortRaw : "hot";
  const tagFilter = sp.tag?.toLowerCase();

  const sessionUser = await getSessionUser();
  const rows = await listPostsSorted(sort, tagFilter, sessionUser?.id);
  const tags = await listTags();
  const tagMap = new Map(tags.map((t) => [t.slug, t]));

  const authorIds = [...new Set(rows.map((r) => r.post.authorId))];
  const authorById = await batchAuthorsForIds(authorIds);

  return (
    <div className="flex gap-8">
      <div className="min-w-0 flex-1">
        <FeedSortTabs current={sort} tag={tagFilter} />
        <div className="space-y-4">{cards}</div>
      </div>
      <aside className="hidden w-72 shrink-0 space-y-6 lg:block">
        <RightTrending items={trending} />
      </aside>
    </div>
  );
}
```

</div>

**Host**: صفحه اصلی یه **Server Component** هستش:

1. پارامترهای URL رو می‌خونه (`sort`, `tag`)
2. کاربر جاری رو می‌گیره
3. پست‌ها رو بر اساس sort و tag filter می‌گیره
4. نویسنده‌ها رو batch می‌گیره

**نکته**: `searchParams: Promise<...>` توی Next.js 16، searchParams دیگه مستقیم در دسترس نیست و باید `await` بشه.

---

### بخش ۶-۲: PostCard — نمایش پست (۷ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
function snippet(body: string, max = 160) {
  const t = body.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function PostCard({ post, author, tagsBySlug, score, userVote }) {
  const primarySlug = post.tagSlugs[0];
  const primaryTag = primarySlug ? tagsBySlug.get(primarySlug) : undefined;

  return (
    <article className="flex gap-2 rounded-xl border border-border bg-card p-3">
      <VoteButtons target="post" targetId={post.id} score={score} userVote={userVote} />

      <div className="min-w-0 flex-1">
        {/* ← Avatar + Username + Time */}
        <div>
          <Link href={`/u/${author.username}`}><UserAvatar user={author} size="sm" /></Link>
          <Link href={`/u/${author.username}`}>u/{author.username}</Link>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        {/* ← Title + Body */}
        <Link href={`/post/${post.id}`}>
          <h2>{post.title}</h2>
          <p className="line-clamp-2">{snippet(post.body)}</p>
        </Link>

        {/* ← Tag */}
        {primaryTag ? <Link href={`/?tag=${encodeURIComponent(primaryTag.slug)}`}>#{primaryTag.label}</Link> : null}

        {/* ← Comments count */}
        <span><MessageSquare /> {post.commentCount} Comments</span>
      </div>
    </article>
  );
}
```

</div>

**Host**: `PostCard` کامپوننت اصلی نمایش پست توی لیسته. نکات جالب:

1. **`snippet` function**: متن بدنه رو تا ۱۶۰ کاراکتر کوتاه می‌کنه
2. **`line-clamp-2`**: کلاس Tailwind که متن رو حداکثر ۲ خط محدود می‌کنه
3. **`tagSlugs[0]`**: فقط اولین تگ رو نشون می‌دیم (primary tag)
4. **Linkها**: همه با `Link` از Next.js
5. **`VoteButtons`**: کامپوننت مجزای رای (DRY)

---

### بخش ۶-۳: VoteButtons — رای با Transition (۵ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";

export function VoteButtons({ target, targetId, score, userVote }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const isPost = target === "post";

  function vote(value: -1 | 1) {
    startTransition(async () => {
      if (isPost) await votePostAction(targetId, value);
      else await voteCommentAction(targetId, value);
      router.refresh();
    });
  }

  return (
    <div className={isPost ? "flex flex-col items-center gap-0.5 py-1 text-sm" : "flex flex-col items-center gap-0 text-xs"}>
      <button disabled={pending} onClick={() => vote(1)}
        className={cn(userVote === 1 ? "text-upvote" : "text-muted-foreground")}
      ><ChevronUp className={isPost ? "size-6" : "size-4"} /></button>

      <span className={cn("tabular-nums", userVote === 1 && "text-upvote", userVote === -1 && "text-downvote")}>
        {score}
      </span>

      <button disabled={pending} onClick={() => vote(-1)}
        className={cn(userVote === -1 ? "text-downvote" : "text-muted-foreground")}
      ><ChevronDown className={isPost ? "size-6" : "size-4"} /></button>
    </div>
  );
}
```

</div>

**Host**: رنگ‌های Reddit:

- **`text-upvote`**: #FF4500 (نارنجی Reddit)
- **`text-downvote`**: #7193FF (آبی)

---

### بخش ۶-۴: FeedSortTabs — با URL (۵ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
function hrefFor(sort: FeedSort, tag?: string, basePath?: string) {
  const params = new URLSearchParams();
  if (sort !== "hot") params.set("sort", sort);
  if (tag) params.set("tag", tag);
  const q = params.toString();
  const base = basePath ?? "/";
  return q ? `${base}?${q}` : base;
}
```

</div>

**Host**: اگه sort "hot" باشه، پارامتر sort رو توی URL نمی‌ذاریم. این باعث میشه URL تمیزتر باشه (`/` به جای `/?sort=hot`).

---

### بخش ۶-۵: Empty State (۲ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
{rows.length === 0 && (
  <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
    No posts match this filter.
  </p>
)}
```

</div>

**Host**: همیشه **Empty State** رو در نظر بگیرید.

---

## قسمت ۷: صفحه پست + کامنت درختی + پروفایل

**مدت**: ۴۰ دقیقه

### بخش ۷-۱: صفحه پست — جزئیات کامل (۱۰ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export default async function PostPage({ params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return notFound();

  const author = await getAuthorById(post.authorId);
  const sessionUser = await getSessionUser();
  const score = await getPostScore(post.id);
  const userVote = await getUserVote(sessionUser?.id, "post", post.id);
  const commentTree = await getCommentTree(post.id, sessionUser?.id);

  return (
    <div>
      <Link href={"/"}><ArrowLeft /> Back to Feed</Link>

      <article>
        <div>
          <Link href={`/u/${author.username}`}><UserAvatar user={author} size="sm" /></Link>
          <Link href={`/u/${author.username}`}>u/{author.username}</Link>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        <h1 className="text-balance text-2xl font-bold">{post.title}</h1>
        {primaryTag ? <Link href={`/?tag=${encodeURIComponent(primaryTag.slug)}`}>#{primaryTag.label}</Link> : null}
        <div className="whitespace-pre-wrap">{post.body}</div>

        <VoteButtons target="post" targetId={post.id} score={score} userVote={userVote} />
        <span><MessageSquare /> {post.commentCount} Comments</span>
      </article>

      <section>
        {sessionUser
          ? <CommentComposer postId={post.id} user={sessionUser} />
          : <p><Link href="/auth/sign-in">Log in</Link> to join the discussion.</p>
        }
        <CommentThread tree={commentTree} postAuthorId={post.authorId} sessionUser={sessionUser} />
      </section>
    </div>
  );
}
```

</div>

**Host**: **نکته**: `text-balance` توی عنوان — یه ویژگی جدید CSS که متن رو به صورت متوازن توی خطوط تقسیم می‌کنه.

---

### بخش ۷-۲: CommentThread + CommentNode (۱۰ دقیقه)

**CommentThread:**

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export function CommentThread({ tree, postAuthorId, sessionUser }) {
  if (tree.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No comments yet.</p>;
  }
  return (
    <ul className="space-y-6">
      {tree.map((node) => (
        <CommentNode key={node.id} node={node} postAuthorId={postAuthorId} sessionUser={sessionUser} />
      ))}
    </ul>
  );
}
```

</div>

**CommentNode (کامپوننت بازگشتی):**

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";

export function CommentNode({ node, postAuthorId, sessionUser }) {
  const isOp = node.author.id === postAuthorId;
  const [showReply, setShowReply] = useState(false);

  return (
    <li>
      <div className="flex gap-2">
        <VoteButtons target="comment" targetId={node.id} score={node.score} userVote={node.userVote} />

        <div className="min-w-0 flex-1 border-l border-border pl-3">
          <div>
            <Link href={`/u/${node.author.username}`}>u/{node.author.username}</Link>
            {isOp ? <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold uppercase">OP</Badge> : null}
            <span>{formatRelativeTime(node.createdAt)}</span>
          </div>

          <p className="whitespace-pre-wrap text-sm">{node.body}</p>

          {sessionUser && (
            <button type="button" onClick={() => setShowReply((v) => !v)}>Reply</button>
          )}

          {sessionUser && showReply && (
            <CommentComposer postId={node.postId} user={sessionUser} parentId={node.id}
              placeholder="Write a reply…" compact />
          )}

          {/* ← Recursive! */}
          {node.children.length > 0 && (
            <ul className="mt-4 space-y-4 border-l border-border/80 pl-3">
              {node.children.map((ch) => (
                <CommentNode key={ch.id} node={ch} postAuthorId={postAuthorId} sessionUser={sessionUser} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
```

</div>

**Host**: مهم‌ترین نکات `CommentNode`:

1. **OP Badge**: اگه نویسنده کامنت با نویسنده پست یکی باشه، "OP" (Original Poster) نشون می‌دیم
2. **Recursive Children**: `node.children.map(ch => <CommentNode ...>)` — این همون recursion هستش
3. **Reply Form**: با کلیک روی Reply، یه `CommentComposer` با `compact={true}` و `parentId` ظاهر میشه

---

### بخش ۷-۳: CommentComposer — فرم ریپلای (۵ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";

export function CommentComposer({
  postId, user, parentId = null, placeholder = "Add a comment…", compact = false,
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createCommentAction(null, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-3">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />

      <UserAvatar user={user} size={compact ? "sm" : "default"} />

      <div className="min-w-0 flex-1 space-y-2">
        <Textarea name="body" required placeholder={placeholder} rows={compact ? 2 : 3} />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : parentId ? "Reply" : "Comment"}
        </Button>
      </div>
    </form>
  );
}
```

</div>

**Host**: دو تا input مخفی — `postId` و `parentId`. اینا مستقیم توی FormData می‌رن.

---

### بخش ۷-۴: SubmitPostForm — useActionState (۵ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
"use client";

export function SubmitPostForm() {
  const [state, action, pending] = useActionState(createPostAction, null);

  return (
    <form action={action} className="mx-auto max-w-xl space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required minLength={4} placeholder="What's on your mind?" />
      </div>

      <div>
        <Label htmlFor="body">Body</Label>
        <Textarea id="body" name="body" rows={8} placeholder="Optional details…" />
      </div>

      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" name="tags" placeholder="webdev, react, nextjs" />
        <p className="text-xs text-muted-foreground">Comma-separated. Defaults to #webdev if empty.</p>
      </div>

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Publishing..." : "Publish Post"}
      </Button>
    </form>
  );
}
```

</div>

**Host**: `action={action}` رو مستقیم به `form` می‌دیم. نیازی به `handleSubmit` دستی نیست.

---

### بخش ۷-۵: پروفایل کاربر (۸ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
export default async function UserProfilePage({ params, searchParams }) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  if (!user) return notFound();

  const sessionUser = await getSessionUser();
  const [rows, karma, commentCount] = await Promise.all([
    listPostsByAuthor(user.id, sort, sessionUser?.id),
    getUserKarma(user.id),
    getUserCommentCount(user.id),
  ]);

  return (
    <div>
      {/* ← Profile Header */}
      <div className="rounded-xl border border-border bg-card p-6 md:p-8">
        <UserAvatar user={user} size="lg" />
        <h1 className="text-2xl font-bold">u/{user.username}</h1>
        {user.bio && <p>{user.bio}</p>}

        {/* ← Stats Grid: Karma, Posts, Comments, Joined */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div><p className="font-bold">{karma}</p><p className="text-xs">Karma</p></div>
          <div><p className="font-bold">{totalPosts}</p><p className="text-xs">Posts</p></div>
          <div><p className="font-bold">{commentCount}</p><p className="text-xs">Comments</p></div>
          <div><p className="font-bold">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}</p><p className="text-xs">Joined</p></div>
        </div>
      </div>

      {/* ← User's Posts */}
      <FeedSortTabs current={sort} basePath={`/u/${username}`} />
      <div className="mt-4 space-y-4">{cards}</div>
    </div>
  );
}
```

</div>

---

## قسمت ۸: Seed Scripts و نکات نهایی

**مدت**: ۱۵ دقیقه

### بخش ۸-۱: Seed Script (۸ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
// ← ۲۰ پست دست‌نویس با محتوای واقعی
const CURATED_POSTS: SeedPost[] = [
  {
    authorId: DEMO_AUTHORS[0],
    title: "Just shipped my side project...",
    tagSlugs: ["webdev"],
  },
  {
    authorId: DEMO_AUTHORS[1],
    title: "Why I moved from CRA to Next 16",
    tagSlugs: ["nextjs", "react"],
  },
  // ... ۱۸ پست دیگه
];

// ← تولید پست‌های اضافی با کد
function proceduralPosts(count: number, offset: number): SeedPost[] {
  // ...
}

// ← برای هر پست: ۲ root comment + ۱ nested reply + رای
async function seedCommentsAndVotes(postIds: string[]) {
  for (let idx = 0; idx < postIds.length; idx++) {
    const postId = postIds[idx];
    const top1 = await prisma.comment.create({
      data: { postId, authorId: a, body: "..." },
    });
    const top2 = await prisma.comment.create({
      data: { postId, authorId: b, body: "..." },
    });
    await prisma.comment.create({
      data: { postId, authorId: c, parentId: top2.id, body: "..." },
    });

    // رای تصادفی از همه کاربران
    for (let v = 0; v < DEMO_AUTHORS.length; v++) {
      votes.push({
        userId: DEMO_AUTHORS[v],
        targetType: "post",
        targetId: postId,
        value: v % 3 === 0 ? -1 : 1,
      });
    }
  }
}
```

</div>

**Host**: اسکریپت seed دو جور پست داره: **Curated** (۲۰ پست دست‌نویس) و **Procedural** (با `SEED_EXTRA=N`).

---

### بخش ۸-۲: Prisma Client Singleton (۳ دقیقه)

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

</div>

**Host**: الگوی استاندارد برای جلوگیری از چندین instance Prisma توی development. با `globalThis`، instance رو توی global object ذخیره می‌کنیم.

---

## جمع‌بندی

**مدت**: ۳ دقیقه

**Host**: پروژه Threadly رو با هم ساختیم. چیزهایی که یاد گرفتید:

✅ **JavaScript/TypeScript Techniques**:

- `Promise.all` برای موازی‌سازی
- `Map` و `Set` برای دیتاهای group
- Spread Operator و Nullish Coalescing
- `useTransition` و `useActionState`
- Recursion برای درخت کامنت
- Type Guards با `x is NonNullable`
- URLSearchParams برای مدیریت query string

✅ **معماری Next.js 16**:

- Server Components و Client Components
- Route Groups
- Server Actions
- `revalidatePath` و `redirect`
- Dynamic Routes

✅ **دیتابیس**:

- Polymorphic Vote System
- Self-Referencing Comments
- Batch Loading (جلوگیری از N+1)
- سه الگوریتم مرتب‌سازی: Hot, New, Top

✅ **UI/UX**:

- Reddit-style dark theme
- Nested threaded comments
- OP Badge و Karma stats
- Responsive three-column layout

اگر این ویدیو براتون مفید بود، لایک و سابسکرایب فراموش نشه. سورس کامل پروژه توی گیتهاب هست. تا ویدیوی بعدی! 🚀

**(Outro with music)**

---

## 📦 سورس کامل پروژه

<div dir="ltr" style="text-align: left; background: #1a1a1b; padding: 12px; border-radius: 8px; margin: 12px 0;">

```
d:\projects\reddit-clone
├── app/
│   ├── layout.tsx              # Root Layout (fonts, dark mode, providers)
│   ├── globals.css             # Tailwind v4 + shadcn + custom vars
│   ├── (core)/
│   │   ├── layout.tsx          # Core Layout (Navbar + LeftSidebar)
│   │   ├── page.tsx            # Home Feed
│   │   ├── post/[id]/page.tsx  # Post Detail Page
│   │   ├── submit/page.tsx     # Create Post
│   │   └── u/[username]/page.tsx  # User Profile
│   └── auth/[pathname]/page.tsx   # Auth Pages (Neon Auth)
├── components/
│   ├── feed/
│   │   ├── post-card.tsx       # Post card in feed
│   │   ├── vote-buttons.tsx    # Upvote/Downvote
│   │   └── feed-sort-tabs.tsx  # Hot/New/Top tabs
│   ├── layout/
│   │   ├── navbar.tsx          # Top navigation bar
│   │   ├── left-sidebar.tsx    # Left sidebar (nav + tags)
│   │   ├── left-tags.tsx       # Tag list in sidebar
│   │   ├── right-trending.tsx  # Trending sidebar card
│   │   └── join-cta-card.tsx   # Sign up CTA card
│   ├── post/
│   │   ├── comment-node.tsx    # Recursive comment display
│   │   ├── comment-thread.tsx  # Comment list wrapper
│   │   ├── comment-composer.tsx # Comment/reply form
│   │   └── submit-post-form.tsx # Create post form
│   └── ui/                     # shadcn components
├── lib/
│   ├── auth.ts                 # Neon Auth helpers
│   ├── prisma.ts               # Prisma client singleton
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # cn() utility
│   ├── format.ts               # formatRelativeTime, formatCount
│   ├── comment-tree.ts         # Flatten → Tree converter
│   ├── trending.ts             # Static trending data
│   ├── actions/
│   │   ├── posts.ts            # Post CRUD + vote actions
│   │   └── comments.ts         # Comment CRUD + vote actions
│   └── db/
│       ├── queries.ts          # All database queries
│       └── user-profile.ts     # User profile upsert
├── prisma/
│   └── schema.prisma           # Database schema
└── scripts/
    ├── seed-users.ts           # Seed demo users
    └── seed-with-comments-and-votes.ts  # Full seed script
```

</div>

</div>
