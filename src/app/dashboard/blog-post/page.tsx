
import { UniversalDataFetcherUI } from '@/components/ui/universal-data-fetcher';

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export default function BlogPostPage() {
  return (
    <div className="max-w-2xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">مثال على جلب البيانات</h1>
      <p className="mb-4 text-muted-foreground">
        هذا مثال يستخدم المكون UniversalDataFetcherUI لجلب بيانات تدوينة من واجهة برمجة تطبيقات خارجية.
      </p>

      <UniversalDataFetcherUI<Post>
        url="https://jsonplaceholder.typicode.com/posts/1"
      >
        {post => (
          <div className="p-4 border rounded-lg shadow-sm hover:bg-muted/50 space-y-2">
            <h2 className="text-xl font-semibold text-primary">{post.title}</h2>
            <p>{post.body}</p>
          </div>
        )}
      </UniversalDataFetcherUI>
    </div>
  );
}
