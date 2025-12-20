const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    if (pathname === '/') {
      pathname = '/public/index.html';
    } else if (pathname.startsWith('/src/')) {
      // TypeScript files are served directly (Bun compiles them)
    } else if (!pathname.includes('.')) {
      pathname = '/public/index.html';
    } else {
      pathname = '/public' + pathname;
    }

    const filePath = '.' + pathname;

    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();

      if (!exists) {
        if (pathname.startsWith('/src/') && pathname.endsWith('.ts')) {
          const tsFile = Bun.file('.' + pathname);
          if (await tsFile.exists()) {
            const transpiler = new Bun.Transpiler({
              loader: 'ts',
            });
            const code = await tsFile.text();
            const result = await transpiler.transform(code);
            return new Response(result, {
              headers: {
                'Content-Type': 'application/javascript',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        }
        return new Response('Not Found', { status: 404 });
      }

      const contentType = getContentType(pathname);
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
});

function getContentType(pathname: string): string {
  if (pathname.endsWith('.html')) return 'text/html';
  if (pathname.endsWith('.js')) return 'application/javascript';
  if (pathname.endsWith('.ts')) return 'application/javascript';
  if (pathname.endsWith('.css')) return 'text/css';
  if (pathname.endsWith('.json')) return 'application/json';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

console.log(`🎮 Vampire Survivors Clone`);
console.log(`🚀 Server running at http://localhost:${server.port}`);
