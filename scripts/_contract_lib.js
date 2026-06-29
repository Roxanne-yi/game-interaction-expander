"use strict";

const fs = require("fs");
const path = require("path");

function readUtf8Json(filePath) {
  const resolved = path.resolve(filePath);
  const buffer = fs.readFileSync(resolved);
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    throw new Error(`${resolved} must be UTF-8 without BOM.`);
  }
  const text = buffer.toString("utf8");
  assertNoDamagedText(text, resolved);
  return JSON.parse(text);
}

function writeUtf8Json(filePath, value) {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  assertNoDamagedText(text, filePath);
  fs.writeFileSync(filePath, text, "utf8");
}

function assertNoDamagedText(value, label = "text") {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (/\uFFFD/.test(text)) throw new Error(`${label} contains replacement characters.`);
  if (/\?{3,}/.test(text)) throw new Error(`${label} contains question-mark replacement blocks.`);
  if (/[绛鍘寰鐣娴涓][\u4e00-\u9fff]{1,3}|鏍|瑙|鍔|搴|閮|棰|囨|湪|瀷/.test(text)) {
    throw new Error(`${label} contains likely mojibake. Rebuild the artifact as UTF-8 without BOM.`);
  }
}

function createReporter() {
  const issues = [];
  return {
    issues,
    fail(code, message, pathValue) {
      issues.push({ level: "fail", code, message, path: pathValue });
    },
    warn(code, message, pathValue) {
      issues.push({ level: "warn", code, message, path: pathValue });
    },
    result(extra = {}) {
      const failCount = issues.filter((issue) => issue.level === "fail").length;
      const warnCount = issues.filter((issue) => issue.level === "warn").length;
      return { passed: failCount === 0, failCount, warnCount, issues, ...extra };
    }
  };
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

module.exports = {
  assertNoDamagedText,
  createReporter,
  ensureArray,
  isNonEmptyString,
  readUtf8Json,
  writeUtf8Json
};
