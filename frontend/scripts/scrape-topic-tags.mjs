#!/usr/bin/env node
/**
 * Scrape topic tags for all LeetCode problems via leetcode.cn GraphQL API.
 * Output: public/data/problem-topic-tags.json
 * Usage: node scripts/scrape-topic-tags.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.join(__dirname, "..", "public", "data", "problem-topic-tags.json");

const GRAPHQL_URL = "https://leetcode.com/graphql/";
const PAGE_SIZE = 100;

const QUERY = `
query questionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
  questionList(
    categorySlug: $categorySlug
    limit: $limit
    skip: $skip
    filters: $filters
  ) {
    totalNum
    data {
      titleSlug
      topicTags { slug name }
    }
  }
}`;

async function fetchPage(skip) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com/problemset/",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { categorySlug: "", skip, limit: PAGE_SIZE, filters: {} },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const ql = json.data.questionList;
  return { total: ql.totalNum, questions: ql.data };
}

async function main() {
  console.log("Fetching total count...");
  const first = await fetchPage(0);
  const total = first.total;
  console.log(`Total problems: ${total}`);

  const result = {};

  // Process first page
  for (const q of first.questions) {
    if (q.topicTags && q.topicTags.length > 0) {
      result[q.titleSlug] = q.topicTags.map((t) => t.slug);
    }
  }

  // Fetch remaining pages
  const pages = Math.ceil(total / PAGE_SIZE);
  for (let page = 1; page < pages; page++) {
    const skip = page * PAGE_SIZE;
    console.log(`Fetching page ${page + 1}/${pages} (skip=${skip})...`);
    try {
      const data = await fetchPage(skip);
      for (const q of data.questions) {
        if (q.topicTags && q.topicTags.length > 0) {
          result[q.titleSlug] = q.topicTags.map((t) => t.slug);
        }
      }
    } catch (err) {
      console.error(`Error on page ${page + 1}: ${err.message}, retrying...`);
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const data = await fetchPage(skip);
        for (const q of data.questions) {
          if (q.topicTags && q.topicTags.length > 0) {
            result[q.titleSlug] = q.topicTags.map((t) => t.slug);
          }
        }
      } catch (err2) {
        console.error(`Skipping page ${page + 1}: ${err2.message}`);
      }
    }
    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 0));
  const size = (fs.statSync(OUT_PATH).size / 1024).toFixed(1);
  console.log(`Done! ${Object.keys(result).length} problems → ${OUT_PATH} (${size} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
