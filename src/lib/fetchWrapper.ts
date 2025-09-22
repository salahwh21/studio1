
export async function fetchWrapper<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(url, options);

    // التحقق من حالة الاستجابة
    if (!res.ok) {
      const text = await res.text(); // قراءة الرد إذا لم يكن JSON
      throw new Error(`استجابة غير متوقعة: ${res.status} ${res.statusText} - ${text}`);
    }

    // محاولة تحويل الرد إلى JSON
    try {
      const data: T = await res.json();
      return data;
    } catch (jsonError: any) {
      throw new Error(`فشل تحويل الاستجابة إلى JSON: ${jsonError.message}`);
    }

  } catch (error: any) {
    console.error('خطأ عند جلب البيانات:', error.message);
    throw error; // يمكن إعادة الرمي أو التعامل مع الخطأ هنا
  }
}
