/**
 * 页面底部组件
 */

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐼</span>
            <span className="font-bold">Chinglish 黑白语言站</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            全球用户共同参与构建的中式英语查询、验证、分享、学习、文化数据库平台
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>© 2024 Chinglish WB</span>
            <span>•</span>
            <span>Made with 🐼 by Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
