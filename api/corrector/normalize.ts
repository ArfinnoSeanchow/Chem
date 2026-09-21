import { detectAndAutoCorrectFormula } from "../../src/utils/formulaAutoCorrector.js";
import { bodySizeGuard, fail, json, methodGuard, requestId, setCors, validateEquation } from "../_lib/http.js";

export default function handler(req: any, res: any) {
  setCors(req, res);
  if (!methodGuard(req, res, ["GET", "POST"])) return;

  const id = requestId(req);
  try {
    bodySizeGuard(req);
    const body = req.method === "GET" ? req.query : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));
    const equation = validateEquation(body?.equation);
    const result = detectAndAutoCorrectFormula(equation);

    return json(res, 200, {
      success: true,
      requestId: id,
      data: {
        original: result.original,
        corrected: result.corrected,
        hasCorrection: result.hasCorrection,
        diagnostics: result.diagnostics,
        summaryTitle: result.summaryTitle,
        detailedExplanation: result.detailedExplanation,
        badges: result.badges,
      },
    });
  } catch (error) {
    return fail(res, error, id);
  }
}
