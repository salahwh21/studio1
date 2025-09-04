
import utilStyles from './utils.module.css'
import buttonStyles from './button.module.css'

export default function BlogPost() {
  return (
    <div className={utilStyles.container}>
      <h1 className="text-2xl font-bold mb-4">مثال على تدوينة</h1>
      <p className="mb-4">هذه الصفحة توضح كيفية استخدام وحدات CSS.</p>
      <button className={buttonStyles.primary}>اضغط هنا</button>
    </div>
  )
}
