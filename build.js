const { execSync } = require('child_process');

if (process.env.OPEN_NEXT_BUILD) {
  // Inside OpenNext: run actual Next.js build
  execSync('next build', { stdio: 'inherit' });
} else {
  // Top-level build: run OpenNext build wrapper
  execSync('npx opennextjs-cloudflare build', {
    stdio: 'inherit',
    env: { ...process.env, OPEN_NEXT_BUILD: '1' },
  });
}
