import { solveRedoxEquation } from "../../src/utils/redoxSolver";
import { fail, json, methodGuard, requestId, setCors, validateEquation, validateMedium, bodySizeGuard } from "../_lib/http";

export default function handler(req: any, res: any) {
  setCors(req, res);
  if (!methodGuard(req, res, ["GET", "POST"])) return;

  const id = requestId(req);
  try {
    bodySizeGuard(req);
    const body = req.method === "GET" ? req.query : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));
    const equation = validateEquation(body?.equation);
    const medium = validateMedium(body?.medium ?? "acidic");
    const result = solveRedoxEquation(equation, medium);

    if (!result.isValid) {
      return json(res, 422, {
        success: false,
        requestId: id,
        error: { code: "SOLVER_REJECTED", message: result.errorMessage || "Unable to verify reaction." },
      });
    }

    const atomsBalanced = result.atomVerifications.every((item) => item.isBalanced);
    const chargeBalanced = result.chargeVerification.isBalanced;
    const electronsBalanced = result.electronBalance.isBalanced;

    return json(res, 200, {
      success: atomsBalanced && chargeBalanced && electronsBalanced,
      requestId: id,
      data: {
        equation: result.balancedEquationString,
        atoms: result.atomVerifications,
        charge: result.chargeVerification,
        electrons: result.electronBalance,
        valid: atomsBalanced && chargeBalanced && electronsBalanced,
      },
    });
  } catch (error) {
    return fail(res, error, id);
  }
}
