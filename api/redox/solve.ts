import { solveRedoxEquation } from "../../src/utils/redoxSolver";
import {
  bodySizeGuard,
  fail,
  json,
  methodGuard,
  requestId,
  setCors,
  validateEquation,
  validateMedium,
} from "../_lib/http";
import { cacheKey, getCached, setCached } from "../_lib/cache";
import { rateLimit } from "../_lib/rateLimit";

function readInput(req: any) {
  if (req.method === "GET") {
    return {
      equation: req.query?.equation,
      medium: req.query?.medium ?? "acidic",
    };
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  return {
    equation: body.equation,
    medium: body.medium ?? "acidic",
  };
}

function compactResult(result: any, id: string, cached: boolean) {
  return {
    success: Boolean(result?.isValid),
    requestId: id,
    cached,
    data: result?.isValid ? {
      input: result.originalInput,
      medium: result.medium,
      equation: result.balancedEquationString,
      reactants: result.balancedReactants,
      products: result.balancedProducts,
      redox: {
        category: result.reactionCategory,
        oxidizingAgent: result.oxidizingAgent,
        reducingAgent: result.reducingAgent,
        oxidationProducts: result.oxidationProducts,
        reductionProducts: result.reductionProducts,
        electronsTransferred: result.electronsTransferred,
        changes: result.redoxChanges,
      },
      verification: {
        atoms: result.atomVerifications,
        charge: result.chargeVerification,
        electrons: result.electronBalance,
        allAtomsBalanced: result.atomVerifications.every((x: any) => x.isBalanced),
        chargeBalanced: result.chargeVerification.isBalanced,
        electronsBalanced: result.electronBalance.isBalanced,
      },
      steps: {
        halfReaction: result.halfReactionSteps,
        oxidationNumber: result.pboSteps,
      },
      detailedHalfReactions: result.detailedHalfReactions,
      interactiveTerms: result.interactiveTerms,
    } : null,
    error: result?.isValid ? undefined : {
      code: "SOLVER_REJECTED",
      message: result?.errorMessage || "Reaction could not be solved.",
    },
  };
}

export default function handler(req: any, res: any) {
  setCors(req, res);
  if (!methodGuard(req, res, ["GET", "POST"])) return;

  const id = requestId(req);
  const limit = rateLimit(req);
  res.setHeader("X-RateLimit-Remaining", String(limit.remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(limit.resetAt / 1000)));
  if (!limit.allowed) {
    return json(res, 429, {
      success: false,
      error: { code: "RATE_LIMITED", message: "Too many requests. Try again shortly." },
      requestId: id,
    }, { "Retry-After": "60" });
  }

  try {
    bodySizeGuard(req);
    const input = readInput(req);
    const equation = validateEquation(input.equation);
    const medium = validateMedium(input.medium);
    const key = cacheKey(equation, medium);

    const cached = getCached<any>(key);
    if (cached) return json(res, 200, compactResult(cached, id, true));

    const result = solveRedoxEquation(equation, medium);
    if (result?.isValid) setCached(key, result);

    return json(res, result?.isValid ? 200 : 422, compactResult(result, id, false));
  } catch (error) {
    return fail(res, error, id);
  }
}
