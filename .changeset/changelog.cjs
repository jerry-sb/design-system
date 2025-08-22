// https://github.com/ariakit/ariakit/blob/main/.changeset/changelog.cjs
// MIT License, Copyright (c) Diego Haz

// pnpm changeset version 을 실행할 때
// Changesets가 .changeset 안의 모든 changeset 파일을 읽고
// getReleaseLine, getDependencyReleaseLine, getChangelogEntry를 호출해서
// 각 패키지의 CHANGELOG.md를 생성/갱신합니다.

/** @type {import("@changesets/types").ChangelogFunctions["getDependencyReleaseLine"]} */
async function getDependencyReleaseLine(_, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) return '';
  const updatedDepenenciesList = dependenciesUpdated.map(
    (dependency) => `\`${dependency.name}@${dependency.newVersion}\``,
  );
  return `- Updated dependencies: ${updatedDepenenciesList.join(', ')}`;
}

/** @type {import("@changesets/types").ChangelogFunctions["getReleaseLine"]} */
async function getReleaseLine(changeset) {
  const [firstLine, ...nextLines] = changeset.summary.split('\n').map((l) => l.trimEnd());

  if (!nextLines.length) return `- ${firstLine}`;

  return `### ${firstLine}\n${nextLines.join('\n')}`;
}

/**
 * @param {Array<Promise<string>} changelogLines
 */
async function getChangelogText(changelogLines) {
  const lines = await Promise.all(changelogLines);
  if (!lines.length) return '';

  const isOverviewLine = (l) => l.startsWith('### Overview\n');
  const isHeadingLine = (l) => l.startsWith('###');
  const isOtherLine = (l) => !l.startsWith('###');
  const headingLines = lines
    .filter(isHeadingLine)
    .sort((a, b) => {
      if (isOverviewLine(a)) return -1;
      if (isOverviewLine(b)) return 1;
      return 0;
    })
    .map((l) => l.replace('### Overview\n\n', ''));
  const otherLines = lines.filter(isOtherLine);
  if (!headingLines.length && !otherLines.length) return '';

  const other = otherLines.join('\n');
  if (!headingLines.length) return other;

  const heading = headingLines.join('\n\n');
  if (!otherLines.length) return heading;

  return `${heading}\n\n### Other updates\n\n${other}`;
}

/**
 * @param {import("@changesets/types").ModCompWithPackage} release
 * @param {Record<"major" | "minor" | "patch", Array<Promise<string>>} changelogLines
 */
async function getChangelogEntry(release, changelogLines) {
  const text = await getChangelogText(Object.values(changelogLines).flat());
  const date = new Date().toISOString().split('T')[0]; // 2025-08-20

  return `## ${release.newVersion} - ${date}\n\n${text}`;
}

module.exports = {
  getDependencyReleaseLine,

  //getDependencyReleaseLine
  getReleaseLine,

  //최종적으로 한 패키지/버전의 changelog entry를 구성
  getChangelogEntry,
};
