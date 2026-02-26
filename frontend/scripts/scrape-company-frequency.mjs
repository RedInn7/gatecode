#!/usr/bin/env node
/**
 * Scrape company-wise problem frequency from GitHub CSV files.
 * Source: krishnadey30/LeetCode-Questions-CompanyWise
 * Merges frequency data into existing company-problems.json
 * Usage: node scripts/scrape-company-frequency.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPANY_PROBLEMS_PATH = path.join(__dirname, "..", "public", "data", "company-problems.json");

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/krishnadey30/LeetCode-Questions-CompanyWise/master";

// Top companies to scrape — filename in the repo
const COMPANIES = [
  { slug: "google", file: "google_alltime.csv" },
  { slug: "amazon", file: "amazon_alltime.csv" },
  { slug: "facebook", file: "facebook_alltime.csv" },
  { slug: "microsoft", file: "microsoft_alltime.csv" },
  { slug: "apple", file: "apple_alltime.csv" },
  { slug: "bloomberg", file: "bloomberg_alltime.csv" },
  { slug: "uber", file: "uber_alltime.csv" },
  { slug: "adobe", file: "adobe_alltime.csv" },
  { slug: "oracle", file: "oracle_alltime.csv" },
  { slug: "goldman-sachs", file: "goldman_sachs_alltime.csv" },
  { slug: "tiktok", file: "tiktok_alltime.csv" },
  { slug: "linkedin", file: "linkedin_alltime.csv" },
  { slug: "snapchat", file: "snapchat_alltime.csv" },
  { slug: "walmart-labs", file: "walmart_labs_alltime.csv" },
  { slug: "yahoo", file: "yahoo_alltime.csv" },
];

function slugFromUrl(url) {
  // Extract slug from URL like https://leetcode.com/problems/two-sum/
  const match = url.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  // Header: ID,Title,Acceptance,Difficulty,Frequency,Leetcode Question Link
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV parse — fields may not have quotes
    const parts = line.split(",");
    if (parts.length < 6) continue;
    const id = parseInt(parts[0], 10);
    const title = parts[1]?.trim();
    const difficulty = parts[3]?.trim();
    const frequency = parseFloat(parts[4]);
    const link = parts[parts.length - 1]?.trim();
    const slug = slugFromUrl(link);
    if (!slug || isNaN(id)) continue;
    results.push({
      id,
      title,
      slug,
      difficulty: difficulty || "Medium",
      paidOnly: false,
      frequency: isNaN(frequency) ? 0 : Math.round(frequency * 10) / 10,
    });
  }
  return results;
}

async function fetchCSV(company) {
  const url = `${GITHUB_RAW_BASE}/${company.file}`;
  console.log(`Fetching ${company.slug} from ${url}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ${company.slug}: HTTP ${res.status}, skipping`);
      return null;
    }
    const text = await res.text();
    const problems = parseCSV(text);
    console.log(`  ${company.slug}: ${problems.length} problems`);
    return { slug: company.slug, problems };
  } catch (err) {
    console.warn(`  ${company.slug}: ${err.message}, skipping`);
    return null;
  }
}

async function main() {
  // Load existing company-problems.json
  let existing = {};
  if (fs.existsSync(COMPANY_PROBLEMS_PATH)) {
    existing = JSON.parse(fs.readFileSync(COMPANY_PROBLEMS_PATH, "utf-8"));
    console.log(`Loaded existing data with ${Object.keys(existing).length} companies`);
  }

  // Fetch all companies in parallel (batches of 5)
  for (let i = 0; i < COMPANIES.length; i += 5) {
    const batch = COMPANIES.slice(i, i + 5);
    const results = await Promise.all(batch.map(fetchCSV));
    for (const result of results) {
      if (!result) continue;
      const { slug, problems } = result;
      if (existing[slug]) {
        // Merge frequency into existing problems
        const existingMap = new Map(existing[slug].map((p) => [p.slug, p]));
        for (const p of problems) {
          const ep = existingMap.get(p.slug);
          if (ep) {
            ep.frequency = p.frequency;
          } else {
            existing[slug].push(p);
          }
        }
        // Also add frequency to new problems not in existing
      } else {
        existing[slug] = problems;
      }
    }
    // Small delay between batches
    await new Promise((r) => setTimeout(r, 500));
  }

  fs.mkdirSync(path.dirname(COMPANY_PROBLEMS_PATH), { recursive: true });
  fs.writeFileSync(COMPANY_PROBLEMS_PATH, JSON.stringify(existing, null, 0));
  const size = (fs.statSync(COMPANY_PROBLEMS_PATH).size / 1024).toFixed(1);
  console.log(`Done! ${Object.keys(existing).length} companies → ${COMPANY_PROBLEMS_PATH} (${size} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
