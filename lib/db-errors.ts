import { NextResponse } from "next/server";

export function isMissingSchemaError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2021",
  );
}

export function missingSchemaJson(extra: Record<string, unknown> = {}) {
  return NextResponse.json(
    { error: "数据库尚未初始化。", code: "MISSING_SCHEMA", ...extra },
    { status: 503 },
  );
}

export function catchDbError(error: unknown, fallback = "无法完成。") {
  console.error(error);
  if (isMissingSchemaError(error)) return missingSchemaJson();
  return NextResponse.json({ error: fallback }, { status: 500 });
}
