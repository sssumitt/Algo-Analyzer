// src/components/data.ts
export interface Problem {
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  notes: string;
  dateSolved: string;
}
export interface AlgorithmNode {
  name: string;
  problems: Problem[];
}
export interface DomainNode {
  name: string;
  algorithms: AlgorithmNode[];
}

// For slug comparisons in the URL:
export const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/[-_ ]+/g, '-');

export const sampleData: DomainNode[] = [
  {
    name: 'Array',
    algorithms: [
      {
        name: 'Binary Search',
        problems: [
          {
            title: 'Search Insert Position',
            link: 'https://leetcode.com/problems/search-insert-position',
            difficulty: 'Medium',
            notes: 'Check lower-bound carefully.',
            dateSolved: '2025-01-28',
          },
          {
            title: 'First Bad Version',
            link: 'https://leetcode.com/problems/first-bad-version',
            difficulty: 'Easy',
            notes: 'Edge cases on mid calculation.',
            dateSolved: '2025-02-03',
          },
        ],
      },
      { name: 'Two Pointer', problems: [] },
    ],
  },
  {
    name: 'Tree',
    algorithms: [{ name: 'DFS', problems: [] }],
  },
];
