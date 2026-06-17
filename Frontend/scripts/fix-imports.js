const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "src");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(jsx?|js)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const replacements = [
  [/from ['"]\.\.\/\.\.\/services\/api['"]/g, "from 'shared/api/client'"],
  [/from ['"]\.\.\/services\/api['"]/g, "from 'shared/api/client'"],
  [/from ['"]\.\.\/\.\.\/context\/AuthContext['"]/g, "from 'features/auth/context/AuthContext'"],
  [/from ['"]\.\.\/context\/AuthContext['"]/g, "from 'features/auth/context/AuthContext'"],
  [/from ['"]\.\.\/\.\.\/components\/settings\//g, "from 'features/auth/components/"],
  [/from ['"]\.\.\/components\/settings\//g, "from 'features/auth/components/"],
  [/from ['"]\.\.\/\.\.\/components\/ui\//g, "from 'shared/components/ui/"],
  [/from ['"]\.\.\/components\/ui\//g, "from 'shared/components/ui/"],
  [/from ['"]\.\.\/\.\.\/components\/layout\//g, "from 'shared/components/layout/"],
  [/from ['"]\.\.\/components\/layout\//g, "from 'shared/components/layout/"],
  [/from ['"]\.\.\/\.\.\/hooks\/useDbMode['"]/g, "from 'shared/hooks/useDbMode'"],
  [/from ['"]\.\.\/hooks\/useDbMode['"]/g, "from 'shared/hooks/useDbMode'"],
  [/from ['"]\.\/theme\//g, "from 'styles/theme/"],
  [/from ['"]\.\.\/theme\//g, "from 'styles/theme/"],
  [/from ['"]\.\.\/\.\.\/theme\//g, "from 'styles/theme/"],
  [/from ['"]\.\/appGlobalCss['"]/g, "from 'styles/theme/appGlobalCss'"],
  [/from ['"]\.\/valmikiTheme['"]/g, "from 'styles/theme/valmikiTheme'"],
  [/from ['"]\.\/ThemeModeContext['"]/g, "from 'styles/theme/ThemeModeContext'"],
  [/from ['"]\.\/AppThemeProvider['"]/g, "from 'styles/theme/AppThemeProvider'"],
  [/from ['"]\.\.\/components\/settings\/ChangePasswordForm['"]/g, "from 'features/auth/components/ChangePasswordForm'"],
  [/from ['"]\.\.\/components\/settings\/SettingsModal['"]/g, "from 'features/auth/components/SettingsModal'"],
  [/from ['"]\.\.\/components\/layout\/Layout['"]/g, "from 'shared/components/layout/AppLayout'"],
  [/from ['"]\.\.\/components\/layout\/ProtectedRoute['"]/g, "from 'shared/components/layout/ProtectedRoute'"],
];

let changed = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [re, rep] of replacements) next = next.replace(re, rep);
  if (next !== content) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`Updated ${changed} files`);
