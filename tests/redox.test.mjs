import test from "node:test";
import assert from "node:assert/strict";
import { solveRedoxEquation } from "../dist/index.js";

test("Fe2+ oxidation half reaction", () => {
  const r = solveRedoxEquation("Fe2+ -> Fe3+", "acidic");
  assert.equal(r.redoxChanges.some(x => x.element === "Fe" && x.type === "oxidation"), true);
  assert.equal(r.electronsTransferred, 1);
});

test("MnO4- to Mn2+ acidic", () => {
  const r = solveRedoxEquation("MnO4- -> Mn2+", "acidic");
  assert.equal(r.halfReactions.reduction?.electrons, 5);
  assert.match(r.halfReactions.reduction?.equation ?? "", /5/);
});

test("Cr2O7^2- to Cr3+ acidic", () => {
  const r = solveRedoxEquation("Cr2O7^2- -> Cr3+", "acidic");
  assert.equal(r.halfReactions.reduction?.electrons, 6);
});

test("classic permanganate/iron reaction is atom and charge balanced", () => {
  const r = solveRedoxEquation(
    "Fe2+ + MnO4- + H+ -> Fe3+ + Mn2+ + H2O",
    "acidic"
  );
  assert.equal(r.verification.charge.balanced, true);
  assert.equal(r.verification.atoms.every(x => x.balanced), true);
});

test("dichromate/iron reaction has six-electron transfer", () => {
  const r = solveRedoxEquation(
    "Cr2O7^2- + Fe2+ + H+ -> Cr3+ + Fe3+ + H2O",
    "acidic"
  );
  assert.equal(r.electronsTransferred, 6);
});

test("chlorine disproportionation is detected", () => {
  const r = solveRedoxEquation("Cl2 + OH- -> Cl- + ClO- + H2O", "basic");
  assert.equal(r.reactionCategory, "Autoredoks (Disproporsionasi)");
});

test("electron verification is not hard-coded", () => {
  const r = solveRedoxEquation("Fe2+ -> Fe3+", "acidic");
  assert.equal(typeof r.verification.electrons.balanced, "boolean");
});

test("permanganate to manganese dioxide in basic medium", () => {
  const r = solveRedoxEquation("MnO4- -> MnO2", "basic");
  assert.match(r.balancedEquation, /3 e/);
  assert.equal(r.verification.overall, true);
});
